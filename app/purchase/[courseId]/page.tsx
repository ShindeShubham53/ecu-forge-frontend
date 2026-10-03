'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Loader2, CheckCircle2, XCircle, AlertTriangle, Smartphone, CreditCard } from 'lucide-react';
import { Course } from '../../../types';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { createCourseOrder, loadRazorpayScript, openRazorpayCheckout } from '../../../services/razorpayCheckout';
import { AppReturnStatus, buildAppReturnLink, parseAppReturnUrl } from '../../../services/appReturn';

/**
 * ECU FORGE secure purchase page, opened by the mobile app (and usable directly on the web).
 * Uses the existing order -> Razorpay Checkout -> server verification -> enrollment flow.
 * Success is only reported after the server confirms the enrollment via GET /courses/my-courses.
 */

type Phase =
  | 'ready'
  | 'paying'
  | 'confirming'
  | 'success'
  | 'already_enrolled'
  | 'cancelled'
  | 'failed'
  | 'pending';

const CONFIRM_POLL_MS = 3000;
const CONFIRM_POLL_ATTEMPTS = 10; // ~30s, gives the Razorpay webhook time to enroll

function PurchasePageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params?.courseId as string;
  const { user, loading: authLoading, login, logout } = useAuth();

  const appReturnBase = useMemo(() => parseAppReturnUrl(searchParams.get('return')), [searchParams]);
  const appUserId = searchParams.get('uid');

  const [course, setCourse] = useState<Course | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('ready');
  const [message, setMessage] = useState<string | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const phaseRef = useRef<Phase>('ready');
  const redirectedRef = useRef(false);

  const updatePhase = (next: Phase, msg: string | null = null) => {
    phaseRef.current = next;
    setPhase(next);
    setMessage(msg);
  };

  // Sign-in form state (only when the browser has no web session)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const accountMismatch = Boolean(user && appUserId && user.id !== appUserId);

  const returnLink = (status: AppReturnStatus) =>
    appReturnBase && course ? buildAppReturnLink(appReturnBase, course.id, status) : null;

  // 1. Load the course (price always comes from the server)
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/courses/${courseId}`, { timeout: 70000 });
        if (alive && res.data.success) setCourse(res.data.data);
      } catch (err: any) {
        if (!alive) return;
        setCourseError(
          err.response?.status === 404
            ? 'This course is not available for purchase.'
            : 'Could not reach the ECU FORGE server. Please check your connection and reload this page.'
        );
      } finally {
        if (alive) setCourseLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [courseId]);

  const isEnrolledOnServer = useCallback(async (): Promise<boolean> => {
    if (!course) return false;
    const res = await api.get('/courses/my-courses', { headers: { 'Cache-Control': 'no-cache' } });
    return Boolean(res.data?.data?.some((e: any) => e.course_id === course.id));
  }, [course]);

  // 2. Already enrolled? (server state)
  useEffect(() => {
    if (!user || !course || accountMismatch) return;
    let alive = true;
    setCheckingEnrollment(true);
    isEnrolledOnServer()
      .then((enrolled) => {
        if (alive && enrolled && phaseRef.current === 'ready') updatePhase('already_enrolled');
      })
      .catch(() => {})
      .finally(() => alive && setCheckingEnrollment(false));
    return () => {
      alive = false;
    };
  }, [user, course, accountMismatch, isEnrolledOnServer]);

  // 3. Return to the app automatically once the server has confirmed the enrollment
  useEffect(() => {
    if (phase !== 'success' || redirectedRef.current) return;
    const link = returnLink('success');
    if (!link) return;
    redirectedRef.current = true;
    const t = setTimeout(() => {
      window.location.href = link;
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const confirmEnrollment = async (): Promise<boolean> => {
    for (let i = 0; i < CONFIRM_POLL_ATTEMPTS; i++) {
      try {
        if (await isEnrolledOnServer()) return true;
      } catch {
        // network blip / cold start: keep polling
      }
      await new Promise((r) => setTimeout(r, CONFIRM_POLL_MS));
    }
    return false;
  };

  const handlePay = async () => {
    if (!course || !user || accountMismatch) return;
    updatePhase('paying');

    try {
      const order = await createCourseOrder(course.id);
      if (!order) {
        updatePhase('failed', 'Failed to create the payment order. Please try again.');
        return;
      }

      if (!(await loadRazorpayScript())) {
        updatePhase('failed', 'Could not load Razorpay Checkout. Please check your connection and try again.');
        return;
      }

      openRazorpayCheckout({
        order,
        courseId: course.id,
        description: course.title,
        prefill: { name: user.full_name || '', email: user.email || '' },
        callbacks: {
          onVerified: async () => {
            updatePhase('confirming');
            const enrolled = await confirmEnrollment();
            updatePhase(enrolled ? 'success' : 'pending');
          },
          onVerificationFailed: async (msg) => {
            // The payment may still be captured: the Razorpay webhook enrolls the learner server-side.
            updatePhase('confirming', msg);
            const enrolled = await confirmEnrollment();
            updatePhase(enrolled ? 'success' : 'pending', enrolled ? null : msg);
          },
          onPaymentFailed: (description) => {
            updatePhase('failed', `Payment failed: ${description}`);
          },
          onDismiss: () => {
            // Closing the modal before paying = cancelled. A recorded failure keeps its message.
            if (phaseRef.current === 'paying') updatePhase('cancelled');
          },
        },
      });
    } catch (err: any) {
      if (err.response?.status === 409) {
        updatePhase('already_enrolled');
      } else {
        updatePhase('failed', err.response?.data?.message || 'Could not start the payment. Please try again.');
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setSignInError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setSignInError(err.message || 'Invalid email or password');
    } finally {
      setSigningIn(false);
    }
  };

  const ReturnButton = ({ status, label }: { status: AppReturnStatus; label: string }) => {
    const link = returnLink(status);
    if (!link) return null;
    return (
      <a
        href={link}
        data-testid="return-to-app"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400"
      >
        <Smartphone className="w-4 h-4" /> {label}
      </a>
    );
  };

  const priceLabel = course ? `₹${course.price.toLocaleString('en-IN')}` : '';

  const renderBody = () => {
    if (courseLoading || authLoading) {
      return (
        <div className="py-10 text-center space-y-3" data-testid="purchase-loading">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto" />
          <p className="text-sm text-brand-silver">Connecting to the secure ECU FORGE server… this can take up to a minute.</p>
        </div>
      );
    }

    if (courseError || !course) {
      return (
        <div className="py-8 text-center space-y-3" data-testid="purchase-course-error">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-sm text-white">{courseError || 'This course is not available for purchase.'}</p>
        </div>
      );
    }

    const summary = (
      <div className="p-5 rounded-2xl bg-brand-dark border border-brand-border space-y-2" data-testid="purchase-summary">
        <span className="text-[11px] font-mono text-brand-green uppercase tracking-wider">{course.category_name}</span>
        <h2 className="text-lg font-bold text-white" data-testid="purchase-course-title">{course.title}</h2>
        <div className="flex items-baseline justify-between pt-2 border-t border-brand-border/60">
          <span className="text-xs text-brand-silver font-mono">Lifetime access</span>
          <span className="text-2xl font-black text-brand-green" data-testid="purchase-price">
            {course.price > 0 ? priceLabel : 'Free'}
          </span>
        </div>
      </div>
    );

    if (course.price <= 0) {
      return (
        <div className="space-y-5">
          {summary}
          <p className="text-sm text-brand-silver text-center">This course is free. Enroll directly in the ECU FORGE app.</p>
          <ReturnButton status="cancelled" label="Return to the ECU FORGE app" />
        </div>
      );
    }

    if (!user) {
      return (
        <div className="space-y-5">
          {summary}
          <form onSubmit={handleSignIn} className="space-y-3" data-testid="purchase-signin">
            <p className="text-xs text-brand-silver">
              Sign in with the <b className="text-white">same account you use in the ECU FORGE app</b>.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green"
            />
            {signInError && <p className="text-xs text-rose-400">{signInError}</p>}
            <button
              type="submit"
              disabled={signingIn}
              className="w-full px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 disabled:opacity-50"
            >
              {signingIn ? 'Signing in…' : 'Sign in to continue'}
            </button>
          </form>
        </div>
      );
    }

    if (accountMismatch) {
      return (
        <div className="space-y-5" data-testid="purchase-account-mismatch">
          {summary}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 space-y-2">
            <p className="font-bold">Different account</p>
            <p>
              This browser is signed in as <b>{user.email}</b>, which is not the account signed in to the ECU FORGE app.
              To avoid buying the course for the wrong account, sign out and sign in with your app account.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              updatePhase('ready');
            }}
            className="w-full px-6 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold text-sm hover:border-brand-green"
          >
            Sign out and switch account
          </button>
        </div>
      );
    }

    switch (phase) {
      case 'already_enrolled':
        return (
          <div className="space-y-5" data-testid="purchase-already-enrolled">
            {summary}
            <p className="text-sm text-brand-green text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> You already have access to this course.
            </p>
            <ReturnButton status="success" label="Return to the ECU FORGE app" />
            {!appReturnBase && (
              <Link href={`/learn/${course.id}`} className="block text-center text-sm text-brand-green underline">
                Start learning
              </Link>
            )}
          </div>
        );
      case 'confirming':
        return (
          <div className="space-y-5" data-testid="purchase-confirming">
            {summary}
            <div className="py-4 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto" />
              <p className="text-sm text-white">Payment received. Confirming your enrollment with ECU FORGE…</p>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="space-y-5" data-testid="purchase-success">
            {summary}
            <div className="p-4 rounded-xl bg-brand-green/10 border border-brand-green/40 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-brand-green mx-auto" />
              <p className="font-bold text-white">Payment successful. Your course is unlocked.</p>
              {appReturnBase && <p className="text-xs text-brand-silver">Returning you to the ECU FORGE app…</p>}
            </div>
            <ReturnButton status="success" label="Open the ECU FORGE app" />
            {!appReturnBase && (
              <Link href={`/learn/${course.id}`} className="block text-center text-sm text-brand-green underline">
                Start learning
              </Link>
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="space-y-5" data-testid="purchase-pending">
            {summary}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 space-y-2">
              <p className="font-bold">We could not confirm your enrollment yet.</p>
              {message && <p className="text-xs">{message}</p>}
              <p className="text-xs">
                If your payment was captured, access unlocks automatically once Razorpay confirms it. You will not be
                charged twice. Contact support if the course is still locked later.
              </p>
            </div>
            <ReturnButton status="pending" label="Return to the ECU FORGE app" />
          </div>
        );
      case 'cancelled':
      case 'failed':
        return (
          <div className="space-y-5" data-testid={phase === 'cancelled' ? 'purchase-cancelled' : 'purchase-failed'}>
            {summary}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-200 flex gap-2">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>{phase === 'cancelled' ? 'Payment cancelled. You have not been charged.' : message}</span>
            </div>
            <button
              onClick={handlePay}
              className="w-full px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400"
            >
              Try again
            </button>
            <ReturnButton status={phase} label="Return to the ECU FORGE app" />
          </div>
        );
      default:
        return (
          <div className="space-y-5">
            {summary}
            <p className="text-xs text-brand-silver">
              Signed in as <b className="text-white">{user.email}</b>
            </p>
            <button
              onClick={handlePay}
              disabled={phase === 'paying' || checkingEnrollment}
              data-testid="purchase-pay"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 disabled:opacity-50"
            >
              {phase === 'paying' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening secure checkout…
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Pay {priceLabel} securely
                </>
              )}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-brand-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 border border-brand-green/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <h1 className="text-base font-black text-white">ECU FORGE Secure Purchase</h1>
            <p className="text-[11px] text-brand-silver font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> Payments processed by Razorpay
            </p>
          </div>
        </div>
        {renderBody()}
      </div>
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={null}>
      <PurchasePageInner />
    </Suspense>
  );
}
