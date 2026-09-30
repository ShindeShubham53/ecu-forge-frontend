'use client';

import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../types';
import { api } from '../services/api';
import { CheckCircle2, XCircle, Award, RotateCcw, X, HelpCircle, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onComplete?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = Object.keys(selectedAnswers).map((qId) => ({
        questionId: qId,
        selectedOptionIndex: selectedAnswers[qId],
      }));

      const res = await api.post(`/quizzes/${quiz.id}/submit`, {
        answers: answersPayload,
      });

      if (res.data.success) {
        setAttemptResult(res.data.data);
        if (onComplete) onComplete();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit quiz attempt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-brand-dark">
          <div>
            <span className="px-2.5 py-1 rounded bg-brand-green/20 text-brand-green font-mono text-xs font-bold border border-brand-green/30">
              KNOWLEDGE ASSESSMENT
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{quiz.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-brand-silver hover:text-white hover:bg-brand-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!attemptResult ? (
            <>
              {/* Question Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-brand-silver">
                  <span>Question {currentStep + 1} of {questions.length}</span>
                  <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-brand-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-green transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Text */}
              {currentQuestion && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white leading-relaxed">
                    {currentQuestion.question_text}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((optionText, idx) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-green/10 border-brand-green text-white shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                              : 'bg-brand-surface-light border-brand-border text-brand-silver hover:border-brand-green/40 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full font-mono text-xs flex items-center justify-center font-bold ${
                                isSelected ? 'bg-brand-green text-black' : 'bg-brand-surface border border-brand-border text-brand-silver'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex p-4 rounded-full bg-brand-dark border border-brand-border">
                {attemptResult.passed ? (
                  <Award className="w-16 h-16 text-brand-green animate-bounce" />
                ) : (
                  <XCircle className="w-16 h-16 text-rose-500" />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {attemptResult.passed ? 'Masterclass Assessment Passed!' : 'Assessment Failed'}
                </h3>
                <p className="text-sm text-brand-silver mt-1">
                  You scored {attemptResult.score} out of {attemptResult.max_score} ({attemptResult.percentage}%)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-brand-dark border border-brand-border text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-brand-border/60 pb-2">
                  <span className="text-brand-silver">Passing Grade required:</span>
                  <span className="text-white font-bold">{quiz.passing_percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-silver">Status:</span>
                  <span className={`font-bold ${attemptResult.passed ? 'text-brand-green' : 'text-rose-400'}`}>
                    {attemptResult.passed ? 'PASSED & ACCREDITED' : 'RETRY REQUIRED'}
                  </span>
                </div>
              </div>

              {/* Explanations review */}
              {attemptResult.results && (
                <div className="space-y-3 text-left pt-2">
                  <h5 className="text-sm font-bold text-white uppercase font-mono">Answer Explanations</h5>
                  {attemptResult.results.map((res, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        res.correct ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'
                      }`}
                    >
                      <div className="font-bold text-white flex items-center gap-2">
                        {res.correct ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        Q{i + 1}: {res.correct ? 'Correct' : 'Incorrect'}
                      </div>
                      <p className="text-brand-silver">{res.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-border/60 bg-brand-dark flex items-center justify-between">
          {!attemptResult ? (
            <>
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-silver disabled:opacity-30 hover:text-white"
              >
                Previous
              </button>

              {currentStep < questions.length - 1 ? (
                <button
                  disabled={selectedAnswers[currentQuestion?.id] === undefined}
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-1.5"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={submitting || selectedAnswers[currentQuestion?.id] === undefined}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {!attemptResult.passed && (
                <button
                  onClick={() => {
                    setAttemptResult(null);
                    setCurrentStep(0);
                    setSelectedAnswers({});
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-white flex items-center gap-2 hover:border-brand-green"
                >
                  <RotateCcw className="w-4 h-4 text-brand-green" /> Retry Assessment
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-auto px-6 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
