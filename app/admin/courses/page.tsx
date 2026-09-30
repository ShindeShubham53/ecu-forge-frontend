'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Course } from '../../../types';
import { api } from '../../../services/api';
import { BookOpen, Plus, Upload, Play, ChevronLeft, Trash2, Edit, Check } from 'lucide-react';

export default function AdminCourseManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState(10);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) setCourses(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) fetchCourses();
  }, [user, isAdmin, authLoading, router]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/admin/courses', {
        title,
        description,
        short_description: description.slice(0, 100),
        price: Number(price),
        level,
        duration_hours: Number(duration),
        thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
        category_id: 'cat_ecu',
      });

      if (res.data.success) {
        setCourses([res.data.data, ...courses]);
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Course creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg bg-brand-surface text-brand-silver hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-brand-green font-mono text-xs font-bold uppercase">ADMINISTRATION</span>
            <h1 className="text-3xl font-black text-white uppercase font-sans">Course & Video Management</h1>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
        >
          <Plus className="w-5 h-5" /> Create New Masterclass
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-40 rounded-xl overflow-hidden bg-black">
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-bold text-white line-clamp-2">{course.title}</h3>
              <p className="text-xs text-brand-silver font-mono">
                {course.level} • {course.duration_hours}h • {course.price === 0 ? 'FREE' : `₹${course.price}`}
              </p>
            </div>

            <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400">Published</span>
              <Link
                href={`/admin/courses/${course.id}`}
                className="text-brand-green font-bold hover:underline"
              >
                Preview & Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white uppercase font-sans">Create New Masterclass</h3>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-brand-silver">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bosch MED17 Bench Flashing Masterclass"
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full technical walkthrough of Bosch TriCore MCUs..."
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-brand-silver">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-brand-silver">Duration (Hours)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-dark text-brand-silver"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
