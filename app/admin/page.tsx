'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Award,
  PlusCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/dashboard');
        return;
      }
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) fetchStats();
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Nav Bar header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green font-mono text-xs font-bold border border-brand-green/40">
            <ShieldAlert className="w-4 h-4" /> ADMIN CONTROL CENTER
          </div>
          <h1 className="text-3xl font-black text-white uppercase font-sans mt-2">
            ECU FORGE Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-white text-xs font-mono font-bold hover:border-brand-green"
          >
            User Management
          </Link>
          <Link
            href="/admin/courses"
            className="px-4 py-2 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Manage Courses
          </Link>
          <Link
            href="/admin/certificates"
            className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-green text-xs font-mono font-bold hover:border-brand-green"
          >
            Certificates
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Total Users</p>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalUsers || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Active Learners</p>
          <p className="text-2xl font-black text-brand-green font-mono">{stats?.activeLearners || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Total Courses</p>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalCourses || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Enrollments</p>
          <p className="text-2xl font-black text-white font-mono">{stats?.totalEnrollments || 0}</p>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Completion Rate</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">{stats?.completionRate || 0}%</p>
        </div>
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-1">
          <p className="text-brand-silver text-xs font-mono">Total Revenue</p>
          <p className="text-2xl font-black text-brand-green font-mono">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-4">
          <h3 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-green" /> Recent Enrollments
          </h3>

          <div className="space-y-3">
            {stats?.recentEnrollments?.map((enr: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-brand-dark border border-brand-border flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <p className="text-white font-bold">{enr.full_name}</p>
                  <p className="text-brand-silver truncate max-w-xs">{enr.course_title}</p>
                </div>
                <span className="text-brand-green font-bold">{enr.progress_percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-4">
          <h3 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-green" /> Registered Platform Users
          </h3>

          <div className="space-y-3">
            {stats?.recentUsers?.map((u: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-brand-dark border border-brand-border flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <p className="text-white font-bold">{u.full_name}</p>
                  <p className="text-brand-silver">{u.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green text-[10px]">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
