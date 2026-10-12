'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type State = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'deleted' } | { kind: 'reauth' } | { kind: 'error'; message: string };

const SIGN_IN_HREF = '/login?next=%2Fdelete-account';

/**
 * Deletes the signed-in learner's account via POST /api/auth/delete-account.
 * No password is collected here (the existing website sign-in is reused); success is shown only after
 * the server confirms the deletion.
 */
export function DeleteAccountForm() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });

  if (state.kind === 'deleted') {
    return (
      <div role="status" className="p-5 rounded-2xl border border-brand-green/40 bg-brand-green/10 space-y-2" data-testid="delete-success">
        <p className="flex items-center gap-2 font-bold text-white">
          <CheckCircle2 className="w-5 h-5 text-brand-green" /> Your account has been deleted.
        </p>
        <p className="text-sm">You have been signed out on this device. Thank you for learning with ECU FORGE.</p>
      </div>
    );
  }

  if (loading) return <p className="text-sm">Checking your sign-in…</p>;

  if (!user) {
    return (
      <div className="p-5 rounded-2xl border border-brand-border bg-brand-surface space-y-3" data-testid="delete-signin">
        <p>Sign in to the account you want to delete. You will come back to this page afterwards.</p>
        <Link href={SIGN_IN_HREF} className="inline-block px-5 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400">
          Sign in to continue
        </Link>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm" data-testid="delete-admin">
        Admin accounts cannot be deleted from this page. Please contact the platform owner.
      </div>
    );
  }

  const emailMatches = email.trim().toLowerCase() === user.email.trim().toLowerCase();
  const canSubmit = emailMatches && confirmation === 'DELETE' && acknowledged && state.kind !== 'submitting';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ kind: 'submitting' });
    try {
      const res = await api.post('/auth/delete-account', { confirmation, email: email.trim() });
      if (res.data?.success && res.data?.data?.deleted) {
        logout();
        setState({ kind: 'deleted' });
      } else {
        setState({ kind: 'error', message: 'We could not confirm the deletion. Please try again.' });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      if (code === 'REAUTH_REQUIRED') {
        setState({ kind: 'reauth' });
      } else if (status === 401) {
        logout();
        setState({ kind: 'error', message: 'Your session has ended. Please sign in again to continue.' });
      } else if (status && status < 500 && err?.response?.data?.message) {
        setState({ kind: 'error', message: err.response.data.message });
      } else if (!err?.response) {
        setState({ kind: 'error', message: 'We could not reach ECU FORGE. Check your connection and try again. Your account has not been changed.' });
      } else {
        setState({ kind: 'error', message: 'Something went wrong on our side. Your account has not been deleted. Please try again later.' });
      }
    }
  };

  return (
    <form onSubmit={submit} className="p-5 rounded-2xl border border-rose-500/30 bg-brand-surface space-y-4" data-testid="delete-form" noValidate>
      <p className="flex items-start gap-2 text-sm text-rose-200">
        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
        You are signed in as <b className="text-white">{user.email}</b>. Deleting this account is permanent and removes access
        to all of its courses, including purchased ones.
      </p>

      <label className="block space-y-1.5">
        <span className="text-sm text-white font-semibold">Type your account email</span>
        <input
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={email.length > 0 && !emailMatches}
          className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green"
        />
        {email.length > 0 && !emailMatches && <span className="text-xs text-rose-300">This doesn&apos;t match the signed-in account.</span>}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-white font-semibold">
          Type <b>DELETE</b> to confirm
        </span>
        <input
          type="text"
          autoComplete="off"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm font-mono focus:outline-none focus:border-brand-green"
        />
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-1 accent-rose-500" />
        <span>I understand that my account, progress, quiz results and course access will be permanently removed.</span>
      </label>

      {state.kind === 'error' && (
        <p role="alert" className="text-sm text-rose-300" data-testid="delete-error">
          {state.message}
        </p>
      )}
      {state.kind === 'reauth' && (
        <div role="alert" className="text-sm text-amber-200 space-y-2" data-testid="delete-reauth">
          <p>For your security, please sign in again, then confirm the deletion. Your account has not been changed.</p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push(SIGN_IN_HREF);
            }}
            className="px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-white font-bold hover:border-brand-green"
          >
            Sign in again
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
        data-testid="delete-submit"
      >
        {state.kind === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
          </>
        ) : (
          'Permanently delete my account'
        )}
      </button>
    </form>
  );
}
