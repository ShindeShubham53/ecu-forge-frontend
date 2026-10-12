'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseModule, Lecture } from '../../../types';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { createCourseOrder, loadRazorpayScript, openRazorpayCheckout } from '../../../services/razorpayCheckout';
import {
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  Play,
  Zap,
  ShieldCheck,
  ChevronDown,
  User as UserIcon,
  CreditCard,
} from 'lucide-react';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<(Course & { modules: (CourseModule & { lectures: Lecture[] })[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [openModuleIds, setOpenModuleIds] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data.success) {
          const cData = res.data.data;
          setCourse(cData);
          if (cData.modules?.length > 0) {
            setOpenModuleIds({ [cData.modules[0].id]: true });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (!user) return;
      try {
        const res = await api.get('/courses/my-courses');
        if (res.data.success) {
          const myCourses = res.data.data;
          const match = myCourses.some((e: any) => e.course_id === courseId || e.course?.id === courseId);
          setIsEnrolled(match);
        }
      } catch (e) {}
    };

    if (courseId) {
      fetchCourseDetails();
      checkEnrollment();
    }
  }, [courseId, user]);

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isEnrolled) {
      router.push(`/learn/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      if (course?.price === 0) {
        // Free course -> instant enrollment
        const res = await api.post('/courses/enroll', { courseId });
        if (res.data.success) {
          setIsEnrolled(true);
          router.push(`/learn/${courseId}`);
        }
        setEnrolling(false);
      } else {
        // Paid course -> Create Order & Open Razorpay Checkout Modal
        const order = await createCourseOrder(courseId);
        if (!order) {
          alert('Failed to create Razorpay order. Please try again.');
          setEnrolling(false);
          return;
        }

        // Ensure Razorpay Checkout SDK is loaded
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert('Failed to load Razorpay Checkout SDK. Please check your network connection and try again.');
          setEnrolling(false);
          return;
        }

        openRazorpayCheckout({
          order,
          courseId,
          description: course?.title || 'Masterclass Access Fee',
          prefill: {
            name: user?.full_name || '',
            email: user?.email || '',
          },
          callbacks: {
            onVerified: () => {
              setIsEnrolled(true);
              router.push(`/learn/${courseId}`);
              setEnrolling(false);
            },
            onVerificationFailed: (message) => {
              alert(message);
              setEnrolling(false);
            },
            onPaymentFailed: (description) => {
              alert(`Payment Failed: ${description}`);
              setEnrolling(false);
            },
            onDismiss: () => {
              setEnrolling(false);
            },
          },
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment request failed');
      setEnrolling(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Course Hero Banner */}
      <section className="bg-brand-dark border-b border-brand-border/80 pt-10 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
          {/* Left Hero Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-green/20 text-brand-green font-mono text-xs font-bold border border-brand-green/30">
                {course.category_name || 'ECU Technical'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-brand-surface border border-brand-border text-white text-xs font-mono">
                {course.level} Level
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight font-sans">
              {course.title}
            </h1>

            <p className="text-base text-brand-silver leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {/* Instructor & Metadata */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-brand-silver border-t border-brand-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green text-brand-green flex items-center justify-center font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-bold">{course.instructor_name}</p>
                  <p className="text-[10px] text-brand-silver/70">{course.instructor_title}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-green" />
                <span>{course.duration_hours} Hours Total</span>
              </div>

              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-green" />
                <span>{course.modules?.length || 3} Technical Modules</span>
              </div>
            </div>
          </div>

          {/* Right Enrollment Sticky Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl space-y-6 sticky top-24">
              <div className="relative h-44 rounded-2xl overflow-hidden bg-black">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-brand-green/30 border border-brand-green text-brand-green flex items-center justify-center">
                    <Play className="w-6 h-6 fill-brand-green ml-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
                <div>
                  <span className="text-xs text-brand-silver font-mono">Masterclass Fee</span>
                  <div className="text-3xl font-black text-white font-mono">
                    {course.price === 0 ? (
                      <span className="text-brand-green">FREE</span>
                    ) : (
                      `₹${course.price.toLocaleString('en-IN')}`
                    )}
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-emerald-400 font-bold">
                  Full Lifetime Access
                </div>
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`w-full py-4 rounded-xl font-extrabold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isEnrolled
                    ? 'bg-brand-green text-black hover:bg-emerald-400'
                    : 'bg-brand-green text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(0,255,102,0.3)]'
                }`}
              >
                {enrolling ? (
                  'Processing...'
                ) : isEnrolled ? (
                  'Continue Learning'
                ) : course.price === 0 ? (
                  'Enroll Free Now'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Enroll & Pay ₹{course.price}
                  </>
                )}
              </button>
              {!isEnrolled && course.price > 0 && (
                <p className="text-[11px] text-brand-silver/80 text-center" data-testid="course-policies">
                  By purchasing you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-brand-green">Terms &amp; Conditions</Link> and{' '}
                  <Link href="/refund-policy" className="underline hover:text-brand-green">Refund Policy</Link>.
                </p>
              )}

              <div className="space-y-2 text-xs font-mono text-brand-silver/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Cloudflare Stream 1080p Video Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Downloadable PDF Schematics & Pinouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>MECH-MOTO Accredited Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* What You'll Learn */}
          <div className="p-8 rounded-3xl bg-brand-surface border border-brand-border space-y-6">
            <h3 className="text-xl font-bold text-white uppercase font-sans">
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.what_you_will_learn || [
                'Understand internal MCU TriCore architectures',
                'Perform bench flashing without pin damage',
                'Analyze CAN-Bus differential signals',
                'Read & Write full EEPROM dumps',
              ]).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-brand-silver">
                  <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Curriculum Tree */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white uppercase font-sans">
                Course Curriculum
              </h3>
              <span className="text-xs font-mono text-brand-silver">
                {course.modules?.length} Modules • {course.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0)} Lectures
              </span>
            </div>

            <div className="space-y-4">
              {course.modules?.map((mod, modIdx) => {
                const isOpen = openModuleIds[mod.id];
                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl bg-brand-surface border border-brand-border overflow-hidden"
                  >
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full p-5 bg-brand-surface hover:bg-brand-surface-light flex items-center justify-between text-left transition-colors"
                    >
                      <div className="font-bold text-white text-base">
                        <span className="text-brand-green font-mono mr-2">Module {modIdx + 1}:</span>
                        {mod.title}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-brand-silver transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0 space-y-2 border-t border-brand-border/40 bg-brand-dark/50">
                        {mod.lectures?.map((lec, lecIdx) => (
                          <div
                            key={lec.id}
                            className="p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40 flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center gap-3 text-brand-silver">
                              {lec.is_free_preview ? (
                                <Play className="w-4 h-4 text-brand-green fill-brand-green" />
                              ) : (
                                <Lock className="w-4 h-4 text-brand-silver/60" />
                              )}
                              <span className="text-white font-medium">{lec.title}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {lec.is_free_preview && (
                                <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green text-[10px] font-bold">
                                  Free Preview
                                </span>
                              )}
                              <span>{Math.round(lec.duration_seconds / 60)} mins</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requirements & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
              <h4 className="text-base font-bold text-white uppercase font-sans">Requirements</h4>
              <ul className="space-y-2 text-xs text-brand-silver">
                {course.requirements?.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-3">
              <h4 className="text-base font-bold text-white uppercase font-sans">Who This Course Is For</h4>
              <ul className="space-y-2 text-xs text-brand-silver">
                {course.target_audience?.map((aud, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                    {aud}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
