'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, CourseModule, Lecture, Quiz } from '../../../types';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { MuxVideoPlayer } from '../../../components/MuxVideoPlayer';
import { QuizModal } from '../../../components/QuizModal';
import { CertificateModal } from '../../../components/CertificateModal';
import {
  CheckCircle2,
  Lock,
  Play,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  Check,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function VideoLearningWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<(Course & { modules: (CourseModule & { lectures: Lecture[] })[] }) | null>(null);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [completedLectureIds, setCompletedLectureIds] = useState<{ [id: string]: boolean }>({});
  const [lastPositions, setLastPositions] = useState<{ [id: string]: number }>({});
  const [persistedProgress, setPersistedProgress] = useState<number | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'info' | 'resources' | 'quiz'>('info');
  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [retakingQuiz, setRetakingQuiz] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState<any | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleDownloadResource = async (resourceId: string, title: string) => {
    setDownloadingResourceId(resourceId);
    try {
      const res = await api.get(`/resources/${resourceId}/download`);
      if (res.data.success && res.data.data?.downloadUrl) {
        const { downloadUrl } = res.data.data;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = '_blank';
        link.setAttribute('download', `${title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(res.data.message || 'Failed to generate download URL');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert(err.response?.data?.message || 'Access denied or download failed');
    } finally {
      setDownloadingResourceId(null);
    }
  };

  const [videoPlaybackData, setVideoPlaybackData] = useState<{
    loading: boolean;
    error: string | null;
    data: any | null;
  }>({ loading: false, error: null, data: null });

  useEffect(() => {
    if (!activeLecture?.id) return;

    let isMounted = true;
    const fetchLectureVideo = async () => {
      setVideoPlaybackData({ loading: true, error: null, data: null });
      try {
        const res = await api.get(`/lectures/${activeLecture.id}/video`);
        if (isMounted) {
          if (res.data.success) {
            setVideoPlaybackData({ loading: false, error: null, data: res.data.data });
          } else {
            setVideoPlaybackData({
              loading: false,
              error: res.data.message || 'Failed to load video stream',
              data: null,
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          const errMsg =
            err.response?.data?.message ||
            'Access forbidden. Active course enrollment required to view this lecture video.';
          setVideoPlaybackData({ loading: false, error: errMsg, data: null });
        }
      }
    };

    fetchLectureVideo();
    return () => {
      isMounted = false;
    };
  }, [activeLecture?.id]);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const [courseRes, progressRes, quizRes] = await Promise.allSettled([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/progress`),
          api.get(`/quizzes/course/${courseId}`),
        ]);

        if (courseRes.status === 'fulfilled' && courseRes.value.data.success) {
          const cData = courseRes.value.data.data;
          setCourse(cData);

          // Find first lecture
          let firstLec: Lecture | null = null;
          if (cData.modules?.length > 0 && cData.modules[0].lectures?.length > 0) {
            firstLec = cData.modules[0].lectures[0];
          }
          setActiveLecture(firstLec);
        }

        if (progressRes.status === 'fulfilled' && progressRes.value.data.success) {
          const progData = progressRes.value.data.data;
          if (progData) {
            setPersistedProgress(progData.progressPercent ?? 0);
            if (progData.completedLectureIds && Array.isArray(progData.completedLectureIds)) {
              const completedMap: { [id: string]: boolean } = {};
              progData.completedLectureIds.forEach((id: string) => {
                completedMap[id] = true;
              });
              setCompletedLectureIds(completedMap);
            }
            if (progData.lastPositions && typeof progData.lastPositions === 'object') {
              setLastPositions(progData.lastPositions);
            }
          }
        }

        if (quizRes.status === 'fulfilled' && quizRes.value.data.success) {
          setQuiz(quizRes.value.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };

    if (courseId) loadWorkspace();
  }, [courseId]);

  const handleProgressUpdate = async (positionSeconds: number, completed: boolean) => {
    if (!activeLecture || !user) return;

    setLastPositions((prev) => ({ ...prev, [activeLecture.id]: positionSeconds }));
    
    let updatedMap = { ...completedLectureIds };
    if (completed) {
      updatedMap[activeLecture.id] = true;
      setCompletedLectureIds(updatedMap);
    }

    const currentCompletedCount = Object.keys(updatedMap).length;
    const currentTotal = allLectures.length || 1;
    const newPercent = Math.min(100, Math.round((currentCompletedCount / currentTotal) * 100));
    setPersistedProgress(newPercent);

    try {
      await api.post('/courses/progress', {
        lectureId: activeLecture.id,
        positionSeconds,
        isCompleted: completed,
      });

      // Check if course became 100% completed
      if (completed) {
        checkCourseCompletion();
      }
    } catch (e) {}
  };

  const checkCourseCompletion = async () => {
    try {
      const [certRes, qRes] = await Promise.allSettled([
        api.get('/certificates/my-certificates'),
        api.get(`/quizzes/course/${courseId}`),
      ]);
      if (certRes.status === 'fulfilled' && certRes.value.data.success) {
        const matching = certRes.value.data.data.find((c: any) => c.course_id === courseId);
        if (matching) {
          setEarnedCertificate(matching);
        }
      }
      if (qRes.status === 'fulfilled' && qRes.value.data.success) {
        setQuiz(qRes.value.data.data);
      }
      setRetakingQuiz(false);
    } catch (e) {}
  };

  // Lecture Navigation helpers
  const getAllLectures = (): Lecture[] => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m) => m.lectures || []);
  };

  const allLectures = getAllLectures();
  const currentLecIndex = allLectures.findIndex((l) => l.id === activeLecture?.id);
  const prevLecture = currentLecIndex > 0 ? allLectures[currentLecIndex - 1] : null;
  const nextLecture = currentLecIndex < allLectures.length - 1 ? allLectures[currentLecIndex + 1] : null;

  if (loading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="h-96 rounded-3xl bg-brand-surface animate-pulse"></div>
      </div>
    );
  }

  const completedCount = Object.keys(completedLectureIds).length;
  const totalLectures = allLectures.length || 1;
  const calculatedPercent = Math.min(100, Math.round((completedCount / totalLectures) * 100));
  const overallProgressPercent = persistedProgress !== null ? Math.max(persistedProgress, calculatedPercent) : calculatedPercent;

  const isQuizPassed = Boolean(quiz?.latest_attempt?.passed);
  const isCourseFullyCompleted = overallProgressPercent >= 100 && isQuizPassed;

  return (
    <div className="min-h-screen bg-brand-bg space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="bg-brand-surface border-b border-brand-border py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-brand-silver hover:text-white hover:bg-brand-dark transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-[10px] font-mono text-brand-green font-bold uppercase tracking-wider">
                {course.category_name}
              </span>
              <h2 className="text-base font-bold text-white truncate max-w-xl">{course.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {isCourseFullyCompleted ? (
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-brand-green/20 text-brand-green text-[11px] font-bold border border-brand-green/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Course Completed
                </span>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-green text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-emerald-400 transition-colors"
                >
                  <Award className="w-4 h-4" /> View Certificate
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-brand-silver">Course Progress:</span>
                  <span className="text-brand-green font-bold">{overallProgressPercent}%</span>
                </div>
                {overallProgressPercent >= 100 && !isQuizPassed ? (
                  <div className="px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-brand-silver text-[11px] font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pass Quiz (80%+) to Unlock Cert</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border/60 text-brand-silver/60 text-[11px] font-bold flex items-center gap-1.5 opacity-75">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Certificate Locked</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Learning Workspace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: Course Curriculum Interactive Accordion Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">Curriculum</h3>
              <span className="text-xs font-mono text-brand-green">{overallProgressPercent}%</span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green transition-all duration-300"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>

            {/* Modules & Lectures List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {course.modules?.map((mod, modIdx) => (
                <div key={mod.id} className="space-y-1">
                  <div className="p-2 rounded bg-brand-dark text-xs font-mono font-bold text-brand-silver flex items-center justify-between">
                    <span>Module {modIdx + 1}: {mod.title}</span>
                  </div>

                  <div className="space-y-1 pl-2">
                    {mod.lectures?.map((lec) => {
                      const isActive = activeLecture?.id === lec.id;
                      const isCompleted = completedLectureIds[lec.id];

                      return (
                        <button
                          key={lec.id}
                          onClick={() => setActiveLecture(lec)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-brand-green/10 border-brand-green text-white font-bold'
                              : 'bg-brand-surface-light border-brand-border/40 text-brand-silver hover:text-white hover:border-brand-border'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                            ) : isActive ? (
                              <Play className="w-4 h-4 text-brand-green fill-brand-green shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-brand-silver/50 shrink-0" />
                            )}
                            <span className="truncate">{lec.title}</span>
                          </div>
                          <span className="text-[10px] text-brand-silver/70 ml-1">
                            {Math.round(lec.duration_seconds / 60)}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER & RIGHT COLUMN: Main Video Player & Tabs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main Video Player */}
          {activeLecture ? (
            videoPlaybackData.loading ? (
              <div className="aspect-video rounded-2xl bg-brand-surface border border-brand-border animate-pulse flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-green border-t-transparent animate-spin"></div>
                <p className="text-xs font-mono text-brand-silver">Loading Mux video stream...</p>
              </div>
            ) : videoPlaybackData.error ? (
              <div className="aspect-video rounded-2xl bg-brand-surface border border-brand-border flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-sans">Video Access Restricted</h3>
                  <p className="text-xs text-brand-silver max-w-md mx-auto">{videoPlaybackData.error}</p>
                </div>
                <Link
                  href={`/courses/${courseId}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                >
                  Enroll in Course
                </Link>
              </div>
            ) : videoPlaybackData.data?.muxPlaybackId ? (
              <MuxVideoPlayer
                playbackId={videoPlaybackData.data.muxPlaybackId}
                playbackToken={videoPlaybackData.data.playbackToken}
                title={activeLecture.title}
                autoPlay
                onEnded={() => handleProgressUpdate(activeLecture.duration_seconds, true)}
              />
            ) : videoPlaybackData.data?.playbackUrl ? (
              <MuxVideoPlayer
                playbackId={videoPlaybackData.data.muxPlaybackId}
                playbackToken={videoPlaybackData.data.playbackToken}
                title={activeLecture.title}
                autoPlay
                onEnded={() => handleProgressUpdate(activeLecture.duration_seconds, true)}
              />
            ) : (
              <div className="aspect-video rounded-2xl bg-brand-surface border border-brand-border flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-silver">
                  <Play className="w-6 h-6" />
                </div>
                <p className="text-sm font-mono text-brand-silver font-bold">
                  No video asset has been processed for this lecture yet.
                </p>
              </div>
            )
          ) : (
            <div className="aspect-video rounded-2xl bg-black flex items-center justify-center text-brand-silver font-mono text-sm">
              Select a lecture from the curriculum to start streaming.
            </div>
          )}

          {/* Navigation & Controls Row */}
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-between gap-4">
            <button
              disabled={!prevLecture}
              onClick={() => prevLecture && setActiveLecture(prevLecture)}
              className="px-4 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs font-mono text-brand-silver hover:text-white disabled:opacity-30 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Lecture
            </button>

            <div className="text-center font-mono text-xs text-brand-silver hidden sm:block truncate max-w-xs">
              {activeLecture?.title}
            </div>

            <button
              disabled={!nextLecture}
              onClick={() => nextLecture && setActiveLecture(nextLecture)}
              className="px-4 py-2 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 disabled:opacity-30 flex items-center gap-1.5"
            >
              Next Lecture <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Workspace Tabs: Info / Resources / Assessment */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-6">
            <div className="flex border-b border-brand-border/60 gap-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 text-sm font-bold font-mono transition-all border-b-2 ${
                  activeTab === 'info'
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-brand-silver hover:text-white'
                }`}
              >
                Lecture Details
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 text-sm font-bold font-mono transition-all border-b-2 ${
                  activeTab === 'resources'
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-brand-silver hover:text-white'
                }`}
              >
                Resources & Downloads ({activeLecture?.resources?.length || 1})
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`pb-3 text-sm font-bold font-mono transition-all border-b-2 ${
                  activeTab === 'quiz'
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-brand-silver hover:text-white'
                }`}
              >
                Knowledge Assessment
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">{activeLecture?.title}</h3>
                <p className="text-sm text-brand-silver leading-relaxed">
                  {activeLecture?.description ||
                    'In this technical masterclass session, we inspect internal microcontroller architectures, pinout connections, oscilloscope trace decoding, and ECU bench flashing.'}
                </p>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase font-mono">
                  Resources & Downloads ({activeLecture?.resources?.length || 0})
                </h4>
                {activeLecture?.resources && activeLecture.resources.length > 0 ? (
                  activeLecture.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl bg-brand-dark border border-brand-border flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-3 text-white truncate">
                        <FileText className="w-5 h-5 text-brand-green shrink-0" />
                        <div className="truncate">
                          <span className="font-bold block truncate">{res.title}</span>
                          <span className="text-[10px] text-brand-silver">
                            PDF Document {res.file_size ? `• ${(res.file_size / (1024 * 1024)).toFixed(1)} MB` : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        disabled={downloadingResourceId === res.id}
                        onClick={() => handleDownloadResource(res.id, res.title)}
                        className="px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-green hover:border-brand-green font-bold flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                      >
                        {downloadingResourceId === res.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Preparing...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Download
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-xl bg-brand-dark border border-brand-border text-center text-xs font-mono text-brand-silver">
                    No PDF resources attached to this lecture.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {!quiz ? (
                  <div className="p-8 rounded-2xl bg-brand-dark border border-brand-border text-center text-brand-silver text-xs font-mono">
                    No quiz available for this course yet.
                  </div>
                ) : quiz.latest_attempt && quiz.latest_attempt.passed && !retakingQuiz ? (
                  /* COMPLETED ASSESSMENT CARD */
                  <div className="p-6 rounded-2xl bg-brand-dark border border-brand-green/40 space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.08)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green font-mono text-xs font-bold border border-brand-green/30">
                          <CheckCircle2 className="w-4 h-4" /> ASSESSMENT COMPLETED
                        </div>
                        <h4 className="text-xl font-bold text-white font-mono mt-2">{quiz.title}</h4>
                        <p className="text-xs text-brand-silver">
                          You have successfully passed the accredited knowledge assessment.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded bg-brand-surface border border-brand-border text-xs font-mono text-brand-silver">
                        Attempted: {new Date(quiz.latest_attempt.attempted_at).toLocaleDateString()} {new Date(quiz.latest_attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Score Achieved</span>
                        <div className="text-xl font-bold text-white">
                          {quiz.latest_attempt.score} / {quiz.latest_attempt.max_score}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Percentage</span>
                        <div className="text-xl font-bold text-brand-green">
                          {quiz.latest_attempt.percentage}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Passing Grade</span>
                        <div className="text-xl font-bold text-white">
                          {quiz.passing_percentage}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Status</span>
                        <div className="text-sm font-bold text-brand-green flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-4 h-4" /> PASSED
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-brand-border/60">
                      {isCourseFullyCompleted && earnedCertificate ? (
                        <button
                          onClick={() => setShowCertModal(true)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" /> View Certificate
                        </button>
                      ) : (
                        <p className="text-xs font-mono text-brand-silver">
                          Complete all remaining course lectures (100%) to claim your official certificate.
                        </p>
                      )}

                      <button
                        onClick={() => {
                          setRetakingQuiz(true);
                          setShowQuizModal(true);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-mono font-bold text-brand-silver hover:text-white hover:border-brand-green transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-brand-green" /> Retake Assessment
                      </button>
                    </div>
                  </div>
                ) : quiz.latest_attempt && !quiz.latest_attempt.passed && !retakingQuiz ? (
                  /* FAILED ASSESSMENT CARD */
                  <div className="p-6 rounded-2xl bg-brand-dark border border-rose-500/30 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-xs font-bold border border-rose-500/30">
                          ASSESSMENT NOT PASSED
                        </div>
                        <h4 className="text-xl font-bold text-white font-mono mt-2">{quiz.title}</h4>
                        <p className="text-xs text-brand-silver">
                          Passing requirement is {quiz.passing_percentage}%. Retake the assessment to earn your certificate.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded bg-brand-surface border border-brand-border text-xs font-mono text-brand-silver">
                        Attempted: {new Date(quiz.latest_attempt.attempted_at).toLocaleDateString()} {new Date(quiz.latest_attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Score Achieved</span>
                        <div className="text-xl font-bold text-white">
                          {quiz.latest_attempt.score} / {quiz.latest_attempt.max_score}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Percentage</span>
                        <div className="text-xl font-bold text-rose-400">
                          {quiz.latest_attempt.percentage}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Passing Grade</span>
                        <div className="text-xl font-bold text-white">
                          {quiz.passing_percentage}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-1">
                        <span className="text-brand-silver">Status</span>
                        <div className="text-sm font-bold text-rose-400 flex items-center gap-1 mt-1">
                          RETRY REQUIRED
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-2 border-t border-brand-border/60">
                      <button
                        onClick={() => {
                          setRetakingQuiz(true);
                          setShowQuizModal(true);
                        }}
                        className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-xs hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> Retake Assessment
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INITIAL / RETAKE START CARD */
                  <div className="p-6 rounded-2xl bg-brand-dark border border-brand-border text-center space-y-4">
                    <HelpCircle className="w-12 h-12 text-brand-green mx-auto" />
                    <h4 className="text-lg font-bold text-white font-mono">{quiz.title}</h4>
                    <p className="text-xs text-brand-silver max-w-md mx-auto">
                      Take the required {quiz.passing_percentage}%+ passing quiz ({quiz.questions?.length || 0} questions) to validate your technical understanding and earn your MECH-MOTO accredited certificate.
                    </p>
                    <button
                      onClick={() => setShowQuizModal(true)}
                      className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 shadow-[0_0_20px_rgba(0,255,102,0.3)]"
                    >
                      Start Assessment Quiz ({quiz.questions?.length || 0} Questions)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && quiz && (
        <QuizModal
          quiz={quiz}
          onClose={() => setShowQuizModal(false)}
          onComplete={checkCourseCompletion}
        />
      )}

      {/* Certificate Modal */}
      {showCertModal && earnedCertificate && (
        <CertificateModal
          certificate={earnedCertificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
