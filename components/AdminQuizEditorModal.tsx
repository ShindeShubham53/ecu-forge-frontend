'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Save,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface EditableQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  orderIndex: number;
}

interface AdminQuizEditorModalProps {
  courseId: string;
  moduleId: string;
  quizId?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminQuizEditorModal: React.FC<AdminQuizEditorModalProps> = ({
  courseId,
  moduleId,
  quizId,
  onClose,
  onSaved,
}) => {
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(80);
  const [questions, setQuestions] = useState<EditableQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      orderIndex: 1,
    },
  ]);

  useEffect(() => {
    if (quizId) {
      const fetchQuizForAdmin = async () => {
        setLoadingQuiz(true);
        setErrorMsg(null);
        try {
          const res = await api.get(`/admin/quizzes/${quizId}`);
          if (res.data.success) {
            const qData = res.data.data;
            setTitle(qData.title || '');
            setPassingPercentage(qData.passing_percentage ?? 80);
            if (Array.isArray(qData.questions) && qData.questions.length > 0) {
              setQuestions(
                qData.questions.map((q: any, idx: number) => ({
                  id: q.id,
                  questionText: q.question_text || '',
                  options: Array.isArray(q.options) && q.options.length === 4
                    ? q.options
                    : [q.options?.[0] || '', q.options?.[1] || '', q.options?.[2] || '', q.options?.[3] || ''],
                  correctOptionIndex: q.correct_option_index ?? 0,
                  explanation: q.explanation || '',
                  orderIndex: q.order_index ?? idx + 1,
                }))
              );
            }
          }
        } catch (err: any) {
          setErrorMsg(err.response?.data?.message || 'Failed to fetch quiz details for editing.');
        } finally {
          setLoadingQuiz(false);
        }
      };

      fetchQuizForAdmin();
    }
  }, [quizId]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        orderIndex: questions.length + 1,
      },
    ]);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('A quiz must contain at least one question.');
      return;
    }
    if (confirm(`Are you sure you want to delete Question ${index + 1}?`)) {
      const updated = questions
        .filter((_, idx) => idx !== index)
        .map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
      setQuestions(updated);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Update orderIndex
    const reordered = copy.map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
    setQuestions(reordered);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const copy = [...questions];
    copy[index].questionText = text;
    setQuestions(copy);
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const copy = [...questions];
    copy[qIndex].options[optIndex] = text;
    setQuestions(copy);
  };

  const handleCorrectOptionSelect = (qIndex: number, optIndex: number) => {
    const copy = [...questions];
    copy[qIndex].correctOptionIndex = optIndex;
    setQuestions(copy);
  };

  const handleExplanationChange = (index: number, text: string) => {
    const copy = [...questions];
    copy[index].explanation = text;
    setQuestions(copy);
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Quiz Title is required.';
    if (passingPercentage < 0 || passingPercentage > 100)
      return 'Passing Percentage must be between 0 and 100.';
    if (questions.length === 0) return 'At least one question is required.';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1} text is required.`;
      for (let o = 0; o < 4; o++) {
        if (!q.options[o] || !q.options[o].trim())
          return `Question ${i + 1}, Option ${String.fromCharCode(65 + o)} is required.`;
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex > 3)
        return `Question ${i + 1} must have a valid correct answer selected (A, B, C, or D).`;
      if (!q.explanation.trim())
        return `Question ${i + 1} explanation is required.`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);

    const payload = {
      courseId,
      moduleId,
      title: title.trim(),
      passingPercentage: Number(passingPercentage),
      questions: questions.map((q, idx) => ({
        id: q.id,
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation.trim(),
        orderIndex: idx + 1,
      })),
    };

    try {
      let res;
      if (quizId) {
        res = await api.put(`/admin/quizzes/${quizId}`, payload);
      } else {
        res = await api.post('/admin/quizzes', payload);
      }

      if (res.data.success) {
        onSaved();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save assessment quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-brand-surface border border-brand-border rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-brand-border/60 bg-brand-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                ADMIN KNOWLEDGE ASSESSMENT CREATOR
              </span>
              <h2 className="text-xl font-bold text-white uppercase font-sans">
                {quizId ? 'Edit Module Knowledge Assessment' : 'Create Module Knowledge Assessment'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-silver hover:text-white hover:bg-brand-surface border border-transparent hover:border-brand-border transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingQuiz ? (
            <div className="p-16 text-center space-y-3 font-mono">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs text-brand-silver">Loading assessment quiz details...</p>
            </div>
          ) : (
            <form id="quizForm" onSubmit={handleSubmit} className="space-y-8">
              {/* Metadata Section */}
              <div className="p-6 rounded-2xl bg-brand-dark/80 border border-brand-border/80 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-brand-silver font-bold uppercase tracking-wider">
                    Quiz Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Module 1 Knowledge Assessment: ECU Fundamentals & Hardware"
                    className="w-full p-3 rounded-xl bg-brand-surface border border-brand-border text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-brand-silver font-bold uppercase tracking-wider">
                    Passing Percentage (%) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-brand-surface border border-brand-border text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions Builder Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Assessment Questions ({questions.length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-6 rounded-2xl bg-brand-dark/90 border border-brand-border space-y-6 shadow-lg relative group"
                    >
                      {/* Question Card Header */}
                      <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-brand-silver font-bold uppercase">
                            Question {qIdx + 1} of {questions.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={qIdx === 0}
                            onClick={() => handleMoveQuestion(qIdx, 'up')}
                            className="p-1.5 rounded-lg bg-brand-surface text-brand-silver hover:text-white disabled:opacity-30 border border-brand-border"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={qIdx === questions.length - 1}
                            onClick={() => handleMoveQuestion(qIdx, 'down')}
                            className="p-1.5 rounded-lg bg-brand-surface text-brand-silver hover:text-white disabled:opacity-30 border border-brand-border"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qIdx)}
                            className="p-1.5 rounded-lg bg-brand-surface text-brand-silver hover:text-rose-400 border border-brand-border hover:border-rose-500/40 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text Input */}
                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-white font-bold">
                          Question Statement <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={q.questionText}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          placeholder="e.g. What nominal DC voltage is typically expected on the sensor 5V reference rail of a healthy Bosch MED17 ECU?"
                          className="w-full p-3.5 rounded-xl bg-brand-surface border border-brand-border text-white text-sm focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      {/* Options Grid (A, B, C, D) */}
                      <div className="space-y-3 font-mono text-xs">
                        <label className="text-white font-bold flex items-center justify-between">
                          <span>Multiple Choice Options (Select Radio Button for Correct Answer) <span className="text-rose-400">*</span></span>
                          <span className="text-brand-silver text-[11px] font-normal">Select (A/B/C/D) radio for correct choice</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                            const isCorrect = q.correctOptionIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                  isCorrect
                                    ? 'bg-purple-500/10 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                    : 'bg-brand-surface border-brand-border text-brand-silver hover:border-brand-border/80'
                                }`}
                              >
                                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`correctAnswer_${qIdx}`}
                                    checked={isCorrect}
                                    onChange={() => handleCorrectOptionSelect(qIdx, optIdx)}
                                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                                  />
                                  <span
                                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                      isCorrect ? 'bg-purple-500 text-white' : 'bg-brand-dark text-brand-silver border border-brand-border'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                </label>

                                <input
                                  type="text"
                                  required
                                  value={q.options[optIdx]}
                                  onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                  placeholder={`Option ${letter} answer choice...`}
                                  className="w-full bg-transparent text-white text-xs font-mono border-none focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation Input */}
                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-white font-bold">
                          Technical Explanation (Displayed after attempt submission) <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          placeholder="e.g. Internal power management ICs regulate input voltage down to a stable 5.0V (±0.05V) reference rail for analog sensors."
                          className="w-full p-3.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-border/60 bg-brand-dark flex items-center justify-between font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-silver hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="quizForm"
            disabled={saving || loadingQuiz}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Assessment...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Knowledge Assessment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizEditorModal;
