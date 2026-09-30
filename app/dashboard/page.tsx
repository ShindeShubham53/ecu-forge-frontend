'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Enrollment, Certificate } from '../../types';
import { api } from '../../services/api';
import { CertificateModal } from '../../components/CertificateModal';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function LearnerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [enrRes, certRes] = await Promise.all([
          api.get('/courses/my-courses'),
          api.get('/certificates/my-certificates'),
        ]);

        if (enrRes.data.success) setEnrollments(enrRes.data.data);
        if (certRes.data.success) setCertificates(certRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-96 bg-brand-surface rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  const completedCount = enrollments.filter((e) => e.is_completed).length;
  const inProgress = enrollments.find((e) => !e.is_completed) || enrollments[0];
  const totalHours = enrollments.reduce((acc, e) => acc + (e.course?.duration_hours || 10), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-surface via-brand-dark to-brand-surface border border-brand-border/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green font-mono text-xs font-bold border border-brand-green/30">
            <ShieldCheck className="w-4 h-4" /> LEARNER PORTAL ACTIVE
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-sans">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-sm text-brand-silver">
            Track your automotive diagnostic masterclass progress, resume lectures, and view certificates.
          </p>
        </div>

        <Link
          href="/courses"
          className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-brand-silver text-xs font-mono">
            <span>Courses Enrolled</span>
            <BookOpen className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{enrollments.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-brand-silver text-xs font-mono">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{completedCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-brand-silver text-xs font-mono">
            <span>Learning Hours</span>
            <Clock className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalHours}h</div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-brand-silver text-xs font-mono">
            <span>Certificates</span>
            <Award className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{certificates.length}</div>
        </div>
      </div>

      {/* Continue Learning Active Hero Banner */}
      {inProgress && (
        <div className="p-8 rounded-3xl bg-brand-surface border border-brand-green/40 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.1)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="px-3 py-1 rounded bg-brand-green/20 text-brand-green font-mono text-xs font-bold">
                CONTINUE LEARNING
              </span>
              <h3 className="text-2xl font-bold text-white">
                {inProgress.course?.title || 'Masterclass in Progress'}
              </h3>
              <p className="text-xs text-brand-silver font-mono">
                Module 3 • Lecture 5: Bootmode & Password Extraction
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-brand-silver">
                  <span>Overall Course Completion</span>
                  <span className="text-brand-green font-bold">{inProgress.progress_percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-brand-dark rounded-full overflow-hidden border border-brand-border">
                  <div
                    className="h-full bg-brand-green rounded-full transition-all duration-500"
                    style={{ width: `${inProgress.progress_percent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Link
              href={`/learn/${inProgress.course_id}`}
              className="px-8 py-4 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 transition-all shrink-0 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
            >
              <Play className="w-4 h-4 fill-black" />
              Resume Learning
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white uppercase font-sans">
          My Enrolled Courses ({enrollments.length})
        </h3>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <div
                key={enr.id}
                className="p-6 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between space-y-4 hover:border-brand-green/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-brand-silver">
                    <span className="text-brand-green font-bold">{enr.course?.level} Level</span>
                    <span>{enr.progress_percent}% Completed</span>
                  </div>
                  <h4 className="text-lg font-bold text-white line-clamp-2">
                    {enr.course?.title}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-brand-border">
                    <div
                      className="h-full bg-brand-green rounded-full"
                      style={{ width: `${enr.progress_percent}%` }}
                    ></div>
                  </div>

                  <Link
                    href={`/learn/${enr.course_id}`}
                    className="w-full py-2.5 rounded-xl bg-brand-surface-light border border-brand-border text-white text-xs font-bold text-center block hover:bg-brand-green hover:text-black transition-colors"
                  >
                    Open Lecture Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-brand-surface border border-brand-border text-center space-y-3">
            <p className="text-brand-silver text-sm">You have not enrolled in any masterclasses yet.</p>
            <Link
              href="/courses"
              className="inline-block px-4 py-2 rounded-xl bg-brand-green text-black font-bold text-xs"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white uppercase font-sans">
          My Certificates ({certificates.length})
        </h3>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-brand-surface border border-brand-green/30 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-brand-green/20 text-brand-green font-mono text-[10px] font-bold">
                      VERIFIED ACCREDITATION
                    </span>
                    <span className="text-xs font-mono text-brand-silver">
                      {new Date(cert.issue_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{cert.course_title}</h4>
                  <p className="text-xs font-mono text-brand-silver">ID: {cert.certificate_code}</p>
                </div>

                <button
                  onClick={() => setSelectedCert(cert)}
                  className="w-full py-2.5 rounded-xl bg-brand-green text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> View & Print Certificate
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border text-center text-xs text-brand-silver">
            Complete a masterclass and pass its required assessment to earn an official certificate.
          </div>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
}
