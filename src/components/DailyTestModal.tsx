import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  BookOpen,
  X,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Question } from '../types';
import { questionBank, getTodayDateString } from '../data/mockData';
import { selectDailyTestQuestions } from '../utils/studyPlannerAlgorithm';

export const DailyTestModal: React.FC = () => {
  const {
    isTestModalOpen,
    closeDailyTestModal,
    subjects,
    testSubmissions,
    sessions,
    exams,
    submitDailyTest,
    reviewBookmarks,
    toggleReviewBookmark,
  } = useStudy();

  const [testState, setTestState] = useState<'intro' | 'active' | 'results'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // question index -> option (0-3)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(20 * 60); // 20 minutes (1200 seconds)
  const [isPaused, setIsPaused] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const todayStr = getTodayDateString();
  const existingTodayTest = testSubmissions.find((t) => t.date === todayStr);

  // Initialize test questions when opened
  useEffect(() => {
    if (isTestModalOpen) {
      if (existingTodayTest) {
        // If already completed today, show results mode or let them review
        setTestState('results');
      } else {
        setTestState('intro');
        setUserAnswers({});
        setCurrentIdx(0);
        setTimeRemainingSeconds(20 * 60);
      }
    }
  }, [isTestModalOpen, existingTodayTest]);

  // Start the test
  const handleStartTest = () => {
    const selected = selectDailyTestQuestions(questionBank, testSubmissions, sessions, exams);
    setQuestions(selected);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeRemainingSeconds(20 * 60);
    setTestState('active');
    setIsPaused(false);
  };

  // Timer loop
  useEffect(() => {
    if (testState === 'active' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, isPaused]);

  const handleFinishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score and answers
    let correctCount = 0;
    const answersRecord = questions.map((q, idx) => {
      const selected = userAnswers[idx] !== undefined ? userAnswers[idx] : -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
      };
    });

    // Subject breakdown
    const subjectScores: Record<string, { correct: number; total: number }> = {};
    const weakTopicsSet = new Set<string>();
    const rememberedTopicsSet = new Set<string>();

    questions.forEach((q, idx) => {
      if (!subjectScores[q.subjectId]) {
        subjectScores[q.subjectId] = { correct: 0, total: 0 };
      }
      subjectScores[q.subjectId].total += 1;

      const isCorrect = userAnswers[idx] === q.correctAnswer;
      if (isCorrect) {
        subjectScores[q.subjectId].correct += 1;
        rememberedTopicsSet.add(q.topicName);
      } else {
        weakTopicsSet.add(q.topicName);
      }
    });

    const durationSpent = 20 * 60 - timeRemainingSeconds;

    submitDailyTest({
      date: todayStr,
      completedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, durationSpent),
      score: correctCount,
      totalMarks: 20,
      answers: answersRecord,
      subjectScores,
      weakTopics: Array.from(weakTopicsSet),
      rememberedTopics: Array.from(rememberedTopicsSet),
    });

    setTestState('results');
  };

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isTestModalOpen) return null;

  const currentQ = questions[currentIdx];
  const activeSubmission = existingTodayTest || testSubmissions[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Daily Retrieval Practice Test
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  20 Marks · 20 Mins
                </span>
              </div>
              <p className="text-[11px] text-slate-700">
                Grounded in active recall to solidify what you studied today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {testState === 'active' && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs ${
                  timeRemainingSeconds <= 180
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>
            )}

            <button
              onClick={closeDailyTestModal}
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area Based on State */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* 1. INTRO SCREEN */}
          {testState === 'intro' && (
            <div className="text-center space-y-5 py-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Today’s 20-Minute Retrieval Check</h2>
                <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                  "Retrieval practice is a learning strategy, not an assessment." This check samples questions from your recent study blocks, weak areas, and upcoming exams.
                </p>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">Questions</span>
                  <span className="text-base font-bold text-slate-900">20 MCQs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">Time Limit</span>
                  <span className="text-base font-bold text-slate-900">20:00 Min</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">Total Marks</span>
                  <span className="text-base font-bold text-slate-900">20 Marks</span>
                </div>
              </div>

              {/* Retrieval Practice Info Note */}
              <div className="text-left p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>How this helps your schedule:</span>
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Any questions or topics you get incorrect will automatically boost priority in your study plan and allocate dedicated revision sessions.
                </p>
              </div>

              <button
                id="modal-start-test-btn"
                onClick={handleStartTest}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Start Daily Practice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. ACTIVE TEST SCREEN */}
          {testState === 'active' && currentQ && (
            <div className="space-y-5">
              {/* Question Stepper Bar */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {currentQ.topicName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="py-2">
                <h3 className="text-base sm:text-lg font-medium text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() =>
                        setUserAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))
                      }
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span className="text-xs sm:text-sm font-medium pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigator Grid (1 to 20) */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {questions.map((_, idx) => {
                    const answered = userAnswers[idx] !== undefined;
                    const isCur = idx === currentIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-6 h-6 rounded text-[11px] font-bold transition-colors ${
                          isCur
                            ? 'bg-slate-900 text-white'
                            : answered
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. RESULTS SCREEN (Sections 17 & 18) */}
          {testState === 'results' && activeSubmission && (
            <div className="space-y-6">
              {/* Score Hero Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                    Daily Practice Completed
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-white">
                      {activeSubmission.score}
                    </span>
                    <span className="text-xl text-slate-300 font-bold">/ 20</span>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                      {Math.round((activeSubmission.score / 20) * 100)}% Accuracy
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Completed in {Math.floor(activeSubmission.durationSeconds / 60)}m{' '}
                    {activeSubmission.durationSeconds % 60}s of 20:00 limit.
                  </p>
                </div>

                <button
                  onClick={handleStartTest}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 self-start sm:self-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Practice</span>
                </button>
              </div>

              {/* What You Remembered vs What to Review (Section 17 & 37) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Remembered */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>What You Remembered</span>
                  </div>
                  <div className="space-y-1">
                    {activeSubmission.rememberedTopics.length === 0 ? (
                      <p className="text-slate-700 italic">No topics marked remembered.</p>
                    ) : (
                      activeSubmission.rememberedTopics.map((top, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-800">
                          <span>✓</span>
                          <span>{top}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* What to Review Next */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Topics to Review Next</span>
                  </div>
                  <div className="space-y-1">
                    {activeSubmission.weakTopics.length === 0 ? (
                      <p className="text-emerald-800 font-medium">None! 100% recall achieved.</p>
                    ) : (
                      activeSubmission.weakTopics.map((top, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-amber-900 font-medium">
                          <span>⚠</span>
                          <span>{top}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Subject Performance Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(activeSubmission.subjectScores || {}).map(([subId, sc]: [string, any]) => {
                    const sub = subjects.find((s) => s.id === subId);
                    return (
                      <div key={subId} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-800 truncate block">
                          {sub?.name || 'Subject'}
                        </span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="font-mono font-bold text-slate-900">
                            {sc.correct} / {sc.total}
                          </span>
                          <span className="text-[11px] text-slate-700">
                            {sc.total > 0 ? Math.round((sc.correct / sc.total) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Question Review Toggle (Section 18) */}
              <div>
                <button
                  onClick={() => setShowReviewList(!showReviewList)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{showReviewList ? 'Hide Detailed Questions' : 'Review All 20 Questions & Explanations'}</span>
                </button>

                {showReviewList && (
                  <div className="mt-4 space-y-3.5">
                    {questions.map((q, idx) => {
                      const userOpt = userAnswers[idx];
                      const isCorrect = userOpt === q.correctAnswer;
                      const isBookmarked = reviewBookmarks.some((b) => b.questionId === q.id);

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                            isCorrect
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900">{q.topicName}</span>
                            </div>

                            <button
                              onClick={() => toggleReviewBookmark(q.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                isBookmarked
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {isBookmarked ? (
                                <>
                                  <BookmarkCheck className="w-3 h-3 text-amber-600" />
                                  <span>Review Later Saved</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3 h-3 text-slate-400" />
                                  <span>Review Later</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="font-medium text-slate-900">{q.question}</p>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700">Your Answer:</span>
                              <span
                                className={`font-bold ${
                                  isCorrect ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {userOpt !== undefined
                                  ? `${['A', 'B', 'C', 'D'][userOpt]} - ${q.options[userOpt]}`
                                  : 'Not Answered'}
                                {isCorrect ? ' ✓' : ' ❌'}
                              </span>
                            </div>

                            {!isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">Correct Answer:</span>
                                <span className="font-bold text-emerald-700">
                                  {['A', 'B', 'C', 'D'][q.correctAnswer]} - {q.options[q.correctAnswer]} ✓
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Explanation */}
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                            <strong className="text-slate-900">Explanation: </strong>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          {testState === 'active' ? (
            <>
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFinishTest}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  Submit Test Early
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishTest}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
                  >
                    Finish & Review
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={closeDailyTestModal}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
