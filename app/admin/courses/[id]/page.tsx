'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { Course, CourseModule, Lecture } from '../../../../types';
import { api } from '../../../../services/api';
import { MuxVideoPlayer } from '../../../../components/MuxVideoPlayer';
import { AdminQuizEditorModal } from '../../../../components/AdminQuizEditorModal';
import {
  ChevronLeft,
  Plus,
  Trash2,
  UploadCloud,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  BookOpen,
  Eye,
  Lock,
  X,
  FileVideo,
  HelpCircle,
  Edit,
  FileText,
  Download,
} from 'lucide-react';

export default function AdminCourseContentManagerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<(Course & { modules: (CourseModule & { lectures: Lecture[]; quizzes?: any[] })[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Module modal state
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  // Lecture modal state
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [lecTitle, setLecTitle] = useState('');
  const [lecDesc, setLecDesc] = useState('');
  const [lecDuration, setLecDuration] = useState(600);
  const [lecFreePreview, setLecFreePreview] = useState(false);
  const [addingLecture, setAddingLecture] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<{ [lectureId: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [lectureId: string]: string }>({});

  // Preview video state
  const [previewVideoData, setPreviewVideoData] = useState<any | null>(null);
  const [previewingLectureId, setPreviewingLectureId] = useState<string | null>(null);

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // PDF Resource Upload Modal State
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [activeResourceLectureId, setActiveResourceLectureId] = useState<string | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [resourceUploadProgress, setResourceUploadProgress] = useState(0);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      if (res.data.success) {
        setCourse(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddResource = (lectureId: string) => {
    setActiveResourceLectureId(lectureId);
    setResourceTitle('');
    setResourceFile(null);
    setResourceUploadProgress(0);
    setShowAddResourceModal(true);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResourceLectureId || !resourceFile || !resourceTitle.trim()) return;

    if (resourceFile.type !== 'application/pdf' && !resourceFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF documents (application/pdf) are permitted.');
      return;
    }

    if (resourceFile.size > 25 * 1024 * 1024) {
      alert('Maximum PDF file size is 25 MB.');
      return;
    }

    setUploadingResource(true);
    setResourceUploadProgress(0);

    try {
      // 1. Request presigned upload URL from backend
      const res = await api.post('/admin/resources/upload-url', {
        lectureId: activeResourceLectureId,
        fileName: resourceFile.name,
        contentType: 'application/pdf',
        fileSize: resourceFile.size,
      });

      if (!res.data.success || !res.data.data?.uploadUrl) {
        throw new Error(res.data.message || 'Failed to generate R2 upload URL');
      }

      const { uploadUrl, resourceKey } = res.data.data;

      // 2. Upload PDF directly to Cloudflare R2 via presigned PUT URL
      const axios = (await import('axios')).default;
      await axios.put(uploadUrl, resourceFile, {
        headers: {
          'Content-Type': 'application/pdf',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setResourceUploadProgress(percent);
          }
        },
      });

      // 3. Confirm upload and save resource metadata in Neon database
      const saveRes = await api.post('/admin/resources', {
        lectureId: activeResourceLectureId,
        title: resourceTitle.trim(),
        resourceKey,
        fileSize: resourceFile.size,
        fileType: 'pdf',
      });

      if (saveRes.data.success) {
        setShowAddResourceModal(false);
        setResourceTitle('');
        setResourceFile(null);
        fetchCourse();
      }
    } catch (err: any) {
      console.error('R2 Resource Upload Error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to upload PDF resource to R2');
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (confirm('Are you sure you want to delete this PDF resource from Cloudflare R2 and the course?')) {
      try {
        const res = await api.delete(`/admin/resources/${resourceId}`);
        if (res.data.success) {
          fetchCourse();
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete resource.');
      }
    }
  };

  const handleOpenAddQuiz = (moduleId: string) => {
    setActiveQuizModuleId(moduleId);
    setEditingQuizId(null);
    setShowQuizModal(true);
  };

  const handleOpenEditQuiz = (moduleId: string, quizId: string) => {
    setActiveQuizModuleId(moduleId);
    setEditingQuizId(quizId);
    setShowQuizModal(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm('Are you sure you want to delete this knowledge assessment quiz?')) {
      try {
        const res = await api.delete(`/admin/quizzes/${quizId}`);
        if (res.data.success) {
          fetchCourse();
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete quiz.');
      }
    }
  };

  const handleQuizSaved = () => {
    setShowQuizModal(false);
    setActiveQuizModuleId(null);
    setEditingQuizId(null);
    fetchCourse();
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    if (courseId && user && isAdmin) {
      fetchCourse();
    }
  }, [courseId, user, isAdmin, authLoading, router]);

  // Create Module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim()) return;

    setAddingModule(true);
    try {
      const res = await api.post('/admin/modules', {
        courseId,
        title: modTitle.trim(),
        description: modDesc.trim(),
      });
      if (res.data.success) {
        setShowAddModuleModal(false);
        setModTitle('');
        setModDesc('');
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create module');
    } finally {
      setAddingModule(false);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lectures?')) return;
    try {
      const res = await api.delete(`/admin/modules/${moduleId}`);
      if (res.data.success) {
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  // Create Lecture
  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !lecTitle.trim()) return;

    setAddingLecture(true);
    try {
      const res = await api.post('/admin/lectures', {
        moduleId: selectedModuleId,
        title: lecTitle.trim(),
        description: lecDesc.trim(),
        durationSeconds: Number(lecDuration),
        isFreePreview: lecFreePreview,
      });

      if (res.data.success) {
        setShowAddLectureModal(false);
        setLecTitle('');
        setLecDesc('');
        setLecDuration(600);
        setLecFreePreview(false);
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create lecture');
    } finally {
      setAddingLecture(false);
    }
  };

  // Delete Lecture
  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await api.delete(`/admin/lectures/${lectureId}`);
      if (res.data.success) {
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lecture');
    }
  };

  // Toggle Free Preview
  const handleToggleFreePreview = async (lectureId: string, currentVal: boolean) => {
    try {
      const res = await api.put(`/admin/lectures/${lectureId}`, {
        isFreePreview: !currentVal,
      });
      if (res.data.success) {
        fetchCourse();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update Free Preview setting');
    }
  };

  // Mux Direct Upload Handler
  const handleFileUpload = async (lectureId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, MOV, WebM).');
      return;
    }

    setUploadProgress((prev) => ({ ...prev, [lectureId]: 0 }));
    setUploadStatus((prev) => ({ ...prev, [lectureId]: 'uploading' }));

    try {
      // STEP 1: Request Direct Upload URL from Backend
      const res = await api.post('/media/mux/upload-url', { lectureId });
      if (!res.data.success || !res.data.data?.uploadUrl) {
        throw new Error(res.data.message || 'Failed to generate Mux upload URL');
      }

      const { uploadUrl } = res.data.data;

      // STEP 2 & 3: Direct Upload to Mux via XHR (Progress Tracking)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [lectureId]: percent }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Mux direct upload failed with HTTP status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during video upload to Mux'));
        xhr.send(file);
      });

      // STEP 5: Upload complete, set status to processing
      setUploadStatus((prev) => ({ ...prev, [lectureId]: 'processing' }));
      setUploadProgress((prev) => ({ ...prev, [lectureId]: 100 }));

      // STEP 6: Poll for Mux webhook processing completion
      startPollingLectureStatus(lectureId);
    } catch (err: any) {
      console.error('Mux Upload Error:', err);
      alert(err.message || 'Video upload failed');
      setUploadStatus((prev) => ({ ...prev, [lectureId]: 'errored' }));
    }
  };

  // Poll Mux Video Processing Status
  const startPollingLectureStatus = (lectureId: string) => {
    let attempts = 0;
    const maxAttempts = 40;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/lectures/${lectureId}/video`);
        if (res.data.success && res.data.data) {
          const { videoStatus } = res.data.data;
          if (videoStatus === 'ready') {
            clearInterval(interval);
            setUploadStatus((prev) => ({ ...prev, [lectureId]: 'ready' }));
            fetchCourse();
          } else if (videoStatus === 'errored') {
            clearInterval(interval);
            setUploadStatus((prev) => ({ ...prev, [lectureId]: 'errored' }));
          }
        }
      } catch (e) {}

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        fetchCourse();
      }
    }, 4000);
  };

  // Preview Video
  const handlePreviewVideo = async (lectureId: string) => {
    try {
      setPreviewingLectureId(lectureId);
      const res = await api.get(`/lectures/${lectureId}/video`);
      if (res.data.success && res.data.data) {
        setPreviewVideoData(res.data.data);
      } else {
        alert(res.data.message || 'Could not fetch playback URL');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load video preview');
    }
  };

  if (authLoading || loading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-2 rounded-xl bg-brand-surface border border-brand-border text-brand-silver hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/20 text-brand-green font-mono text-xs font-bold border border-brand-green/30">
              <Sparkles className="w-3.5 h-3.5" /> COURSE CONTENT MANAGER
            </div>
            <h1 className="text-3xl font-black text-white uppercase font-sans mt-1">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.id}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-silver hover:text-white text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-brand-green" /> Public Page
          </Link>
          <button
            onClick={() => setShowAddModuleModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Module
          </button>
        </div>
      </div>

      {/* Course Stats Card */}
      <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
        <div>
          <span className="text-brand-silver text-[10px]">PRICE</span>
          <p className="text-white font-bold text-base">
            {course.price === 0 ? <span className="text-brand-green">FREE</span> : `₹${course.price.toLocaleString()}`}
          </p>
        </div>
        <div>
          <span className="text-brand-silver text-[10px]">LEVEL</span>
          <p className="text-white font-bold text-base">{course.level}</p>
        </div>
        <div>
          <span className="text-brand-silver text-[10px]">DURATION</span>
          <p className="text-white font-bold text-base">{course.duration_hours} Hours</p>
        </div>
        <div>
          <span className="text-brand-silver text-[10px]">MODULES</span>
          <p className="text-white font-bold text-base">{course.modules?.length || 0}</p>
        </div>
        <div>
          <span className="text-brand-silver text-[10px]">STATUS</span>
          <p className="text-emerald-400 font-bold text-base">
            {course.is_published ? 'PUBLISHED' : 'DRAFT'}
          </p>
        </div>
      </div>

      {/* Module & Curriculum Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase font-sans flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-green" /> Course Curriculum & Mux Video Assets
          </h2>
        </div>

        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-6">
            {course.modules.map((mod, modIdx) => (
              <div
                key={mod.id}
                className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-6 shadow-xl"
              >
                {/* Module Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
                  <div>
                    <span className="text-brand-green font-mono text-xs font-bold uppercase">
                      MODULE {modIdx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-brand-silver mt-1">{mod.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setShowAddLectureModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-dark border border-brand-green/40 text-brand-green font-mono text-xs font-bold hover:bg-brand-green hover:text-black transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Lecture
                    </button>
                    <button
                      onClick={() => handleOpenAddQuiz(mod.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-dark border border-purple-500/40 text-purple-400 font-mono text-xs font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Add Quiz
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-2 rounded-xl bg-brand-dark text-brand-silver hover:text-rose-400 border border-brand-border hover:border-rose-500/40 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lectures List inside Module */}
                {mod.lectures && mod.lectures.length > 0 ? (
                  <div className="space-y-4">
                    {mod.lectures.map((lec, lecIdx) => {
                      const uStatus = uploadStatus[lec.id] || lec.video_status || 'none';
                      const progress = uploadProgress[lec.id] || 0;

                      return (
                        <div
                          key={lec.id}
                          className="p-5 rounded-2xl bg-brand-dark/80 border border-brand-border space-y-4 font-mono text-xs"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* Lecture Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-brand-silver font-bold">
                                  Lecture {modIdx + 1}.{lecIdx + 1}
                                </span>
                                <span className="text-white font-bold text-sm">{lec.title}</span>
                              </div>

                              <div className="flex items-center gap-4 text-brand-silver text-[11px]">
                                <span>Duration: {Math.round(lec.duration_seconds / 60)} mins</span>
                                {lec.description && <span className="truncate max-w-md">• {lec.description}</span>}
                              </div>
                            </div>

                            {/* Free Preview Toggle & Status Badges */}
                            <div className="flex items-center gap-4">
                              {/* Free Preview Toggle */}
                              <label className="flex items-center gap-2 cursor-pointer bg-brand-surface px-3 py-1.5 rounded-xl border border-brand-border hover:border-brand-green/40 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={lec.is_free_preview}
                                  onChange={() => handleToggleFreePreview(lec.id, lec.is_free_preview)}
                                  className="rounded accent-brand-green w-4 h-4 cursor-pointer"
                                />
                                <span className={lec.is_free_preview ? 'text-brand-green font-bold' : 'text-brand-silver'}>
                                  Free Preview
                                </span>
                              </label>

                              {/* Video Status Badge */}
                              {uStatus === 'ready' || lec.mux_playback_id || lec.video_stream_id ? (
                                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Video Ready
                                </span>
                              ) : uStatus === 'uploading' ? (
                                <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading ({progress}%)
                                </span>
                              ) : uStatus === 'processing' ? (
                                <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30 flex items-center gap-1.5 animate-pulse">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mux Processing...
                                </span>
                              ) : uStatus === 'errored' ? (
                                <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Processing Error
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-xl bg-brand-surface text-brand-silver border border-brand-border">
                                  No Video Uploaded
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Upload Progress Bar */}
                          {uStatus === 'uploading' && (
                            <div className="w-full bg-brand-surface rounded-full h-2 overflow-hidden border border-brand-border">
                              <div
                                className="bg-brand-green h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          )}

                          {/* PDF Downloads & Resources Section */}
                          <div className="pt-3 border-t border-brand-border/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-brand-green font-bold text-[11px] flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" /> PDF Downloads & Resources ({lec.resources?.length || 0})
                              </span>
                              <button
                                onClick={() => handleOpenAddResource(lec.id)}
                                className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-green hover:border-brand-green text-[11px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Add PDF Resource
                              </button>
                            </div>

                            {lec.resources && lec.resources.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                {lec.resources.map((res: any) => (
                                  <div
                                    key={res.id}
                                    className="p-2.5 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between text-[11px]"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="w-4 h-4 text-brand-green shrink-0" />
                                      <span className="text-white font-bold truncate">{res.title}</span>
                                      <span className="text-brand-silver text-[10px]">
                                        • {res.file_size ? `${(res.file_size / (1024 * 1024)).toFixed(1)} MB` : 'PDF'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteResource(res.id)}
                                      className="p-1 rounded text-brand-silver hover:text-rose-400 transition-colors"
                                      title="Delete Resource"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Actions: Upload Video & Preview Video */}
                          <div className="pt-2 border-t border-brand-border/40 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Direct Mux Upload Button */}
                              <label className="px-4 py-2 rounded-xl bg-brand-green text-black font-extrabold cursor-pointer hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                                <UploadCloud className="w-4 h-4" />
                                <span>{lec.mux_playback_id || lec.video_stream_id ? 'Replace Video' : 'Upload Video'}</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/quicktime,video/webm"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileUpload(lec.id, f);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* Preview Video Button */}
                              {(lec.mux_playback_id || lec.video_stream_id || uStatus === 'ready') && (
                                <button
                                  onClick={() => handlePreviewVideo(lec.id)}
                                  className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-white hover:border-brand-green font-bold flex items-center gap-2 transition-colors"
                                >
                                  <Play className="w-3.5 h-3.5 text-brand-green fill-brand-green" />
                                  <span>Preview Video</span>
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteLecture(lec.id)}
                              className="text-brand-silver hover:text-rose-400 transition-colors p-1"
                              title="Delete Lecture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Module Knowledge Assessment Quizzes Section */}
                {mod.quizzes && mod.quizzes.length > 0 && (
                  <div className="pt-4 border-t border-brand-border/60 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Module Knowledge Assessment ({mod.quizzes.length})
                      </span>
                    </div>

                    {mod.quizzes.map((quiz: any) => (
                      <div
                        key={quiz.id}
                        className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                              PASSING: {quiz.passing_percentage}%
                            </span>
                            <h4 className="text-white font-bold text-sm">{quiz.title}</h4>
                          </div>
                          <p className="text-brand-silver text-[11px]">
                            {quiz.questions_count || quiz.questions?.length || 0} Technical Questions • Accredited Assessment
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditQuiz(mod.id, quiz.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-brand-dark border border-brand-border text-white hover:border-purple-400 font-bold flex items-center gap-1.5 transition-colors text-xs"
                          >
                            <Edit className="w-3.5 h-3.5 text-purple-400" />
                            <span>Edit Quiz</span>
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="p-2 rounded-xl bg-brand-dark text-brand-silver hover:text-rose-400 border border-brand-border hover:border-rose-500/40 transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-brand-surface border border-brand-border text-center space-y-4">
            <BookOpen className="w-12 h-12 text-brand-silver mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-white">No Curriculum Modules Added</h3>
            <p className="text-sm text-brand-silver max-w-md mx-auto">
              Start building your masterclass structure by adding your first technical module.
            </p>
            <button
              onClick={() => setShowAddModuleModal(true)}
              className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400"
            >
              Add First Module
            </button>
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="text-lg font-bold text-white uppercase font-sans">Add Technical Module</h3>
              <button onClick={() => setShowAddModuleModal(false)} className="text-brand-silver hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-brand-silver font-bold">Module Title *</label>
                <input
                  type="text"
                  required
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  placeholder="Module 1: ECU Hardware Architecture & Pinouts"
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  placeholder="Overview of TriCore Infineon MCUs and PCB components..."
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-dark text-brand-silver"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingModule}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400"
                >
                  {addingModule ? 'Creating...' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lecture Modal */}
      {showAddLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="text-lg font-bold text-white uppercase font-sans">Add Lecture to Module</h3>
              <button onClick={() => setShowAddLectureModal(false)} className="text-brand-silver hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-brand-silver font-bold">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={lecTitle}
                  onChange={(e) => setLecTitle(e.target.value)}
                  placeholder="Lecture 1.1: Anatomy of Bosch MED17 ECU"
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={lecDesc}
                  onChange={(e) => setLecDesc(e.target.value)}
                  placeholder="Component inspection and bootmode connections..."
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver">Duration (Seconds)</label>
                <input
                  type="number"
                  value={lecDuration}
                  onChange={(e) => setLecDuration(Number(e.target.value))}
                  placeholder="900"
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={lecFreePreview}
                  onChange={(e) => setLecFreePreview(e.target.checked)}
                  className="rounded accent-brand-green w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-bold">Enable Free Preview (Allow un-enrolled learners to watch)</span>
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddLectureModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-dark text-brand-silver"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLecture}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400"
                >
                  {addingLecture ? 'Creating...' : 'Create Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 font-mono">
              <div className="flex items-center gap-2 text-white font-bold">
                <Play className="w-4 h-4 text-brand-green fill-brand-green" />
                <span>Admin Mux Signed Video Preview</span>
              </div>
              <button
                onClick={() => {
                  setPreviewVideoData(null);
                  setPreviewingLectureId(null);
                }}
                className="p-1 rounded-lg text-brand-silver hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <MuxVideoPlayer
                playbackId={previewVideoData.muxPlaybackId}
                playbackToken={previewVideoData.playbackToken}
                title={previewVideoData.title || 'Admin Mux Signed Preview'}
                autoPlay
              />
            </div>

            <div className="p-3 rounded-xl bg-brand-dark border border-brand-border text-xs font-mono text-brand-silver flex justify-between items-center">
              <span>Provider: {previewVideoData.provider?.toUpperCase()}</span>
              <span>Status: {previewVideoData.videoStatus?.toUpperCase() || 'READY'}</span>
              <span className="text-brand-green font-bold">Mux Signed Token Verified ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Editor Modal */}
      {showQuizModal && activeQuizModuleId && (
        <AdminQuizEditorModal
          courseId={courseId}
          moduleId={activeQuizModuleId}
          quizId={editingQuizId}
          onClose={() => {
            setShowQuizModal(false);
            setActiveQuizModuleId(null);
            setEditingQuizId(null);
          }}
          onSaved={handleQuizSaved}
        />
      )}

      {/* Add PDF Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="text-lg font-bold text-white uppercase font-sans flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-green" /> Add PDF Resource to Lecture
              </h3>
              <button
                onClick={() => {
                  if (!uploadingResource) setShowAddResourceModal(false);
                }}
                disabled={uploadingResource}
                className="text-brand-silver hover:text-white disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-brand-silver font-bold">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  placeholder="Bosch MED17 Component & Pinout Diagram"
                  className="w-full p-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-brand-silver font-bold">PDF Document File (.pdf, max 25MB) *</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setResourceFile(f);
                  }}
                  className="w-full p-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-silver text-xs cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-green file:text-black"
                />
                {resourceFile && (
                  <p className="text-[11px] text-brand-green mt-1">
                    Selected: {resourceFile.name} ({(resourceFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {uploadingResource && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-brand-silver text-[11px]">
                    <span>Uploading directly to Cloudflare R2...</span>
                    <span>{resourceUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-brand-dark rounded-full h-2 overflow-hidden border border-brand-border">
                    <div
                      className="bg-brand-green h-full transition-all duration-300"
                      style={{ width: `${resourceUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  disabled={uploadingResource}
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-dark text-brand-silver disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResource || !resourceFile || !resourceTitle.trim()}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                >
                  {uploadingResource ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading PDF...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Upload Resource to R2
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
