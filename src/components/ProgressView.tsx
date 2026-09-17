import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  TrendingUp,
  Award,
  Flame,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  BarChart2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const {
    subjects,
    topics,
    sessions,
    streak,
    testSubmissions,
    weakTopicsMap,
    addSession,
    setActiveTab,
    openDailyTestModal,
  } = useStudy();

  // 1. Overall Syllabus Completion
  const totalTopicsCount = topics.length;
  const completedTopicsCount = topics.filter((t) => t.isCompleted).length;
  const overallSyllabusPercent =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // 2. Study Time Completed vs Planned
  const completedMins = sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + s.duration, 0);
  const plannedMins = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completionTimeRate =
    plannedMins > 0 ? Math.round((completedMins / plannedMins) * 100) : 0;

  // 3. Test Score Average
  const testCount = testSubmissions.length;
  const avgTestScore =
    testCount > 0
      ? Math.round(
          (testSubmissions.reduce((acc, t) => acc + t.score, 0) / (testCount * 20)) * 100
        )
      : 0;

  // 4. Exam Readiness per Subject (Section 20 & 34)
  // Readiness = (Syllabus % * 0.4) + (Test % * 0.35) + (Time Adherence * 0.25)
  const subjectReadiness = subjects.map((sub) => {
    const subTopics = topics.filter((t) => t.subjectId === sub.id);
    const subCompletedTopics = subTopics.filter((t) => t.isCompleted).length;
    const subSylPercent =
      subTopics.length > 0 ? (subCompletedTopics / subTopics.length) * 100 : 0;

    // Test performance for this subject
    let totalQ = 0;
    let correctQ = 0;
    testSubmissions.forEach((subm) => {
      if (subm.subjectScores && subm.subjectScores[sub.id]) {
        totalQ += subm.subjectScores[sub.id].total;
        correctQ += subm.subjectScores[sub.id].correct;
      }
    });
    const testPercent = totalQ > 0 ? (correctQ / totalQ) * 100 : 70; // baseline if no tests

    // Time adherence
    const subSessions = sessions.filter((s) => s.subjectId === sub.id);
    const subDone = subSessions.filter((s) => s.status === 'completed').length;
    const timeRate = subSessions.length > 0 ? (subDone / subSessions.length) * 100 : 80;

    const readinessScore = Math.min(
      100,
      Math.round(subSylPercent * 0.4 + testPercent * 0.35 + timeRate * 0.25)
    );

    return {
      ...sub,
      totalTopics: subTopics.length,
      completedTopics: subCompletedTopics,
      syllabusPercent: Math.round(subSylPercent),
      testPercent: Math.round(testPercent),
      readinessScore,
    };
  });

  // Weak topics list from map
  const weakTopicEntries = Object.entries(weakTopicsMap || {}).map(([name, data]) => {
    const d = data as { subjectId: string; testedCount: number; correctCount: number; lastTestedDate: string };
    return {
      name,
      ...d,
      accuracy: d.testedCount > 0 ? Math.round((d.correctCount / d.testedCount) * 100) : 0,
    };
  });

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const handleScheduleRevision = (topicName: string, subjectId: string) => {
    const today = new Date().toISOString().split('T')[0];
    addSession({
      subjectId,
      topicName: `Revision: ${topicName}`,
      date: today,
      startTime: '19:00',
      endTime: '19:45',
      duration: 45,
      status: 'scheduled',
      isRevision: true,
      notes: 'Scheduled from Weak Topics Analysis',
    });
    setActiveTab('timetable');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Analytics & Readiness</span>
          <span>•</span>
          <span>Sections 20 & 21</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Learning Progress & Exam Readiness
        </h1>
        <p className="text-slate-700 text-sm mt-0.5">
          Quantifies your study velocity, retention accuracy from daily retrieval tests, and actionable knowledge gaps.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Syllabus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <span className="font-semibold uppercase tracking-wider">Syllabus Completion</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {overallSyllabusPercent}%
            </span>
            <span className="text-xs text-slate-700 font-medium">
              ({completedTopicsCount}/{totalTopicsCount} topics)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${overallSyllabusPercent}%` }}
            />
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <span className="font-semibold uppercase tracking-wider">Time Completed</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatHoursMins(completedMins)}
            </span>
            <span className="text-xs text-slate-700 font-medium">
              of {formatHoursMins(plannedMins)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, completionTimeRate)}%` }}
            />
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{streak.current}</span>
            <span className="text-xs text-slate-700 font-medium">
              Days (Best: {streak.longest})
            </span>
          </div>
          <p className="text-[11px] text-slate-700">
            Consecutive days completing planned sessions or retrieval checks.
          </p>
        </div>

        {/* Test Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <span className="font-semibold uppercase tracking-wider">Avg Test Accuracy</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{avgTestScore}%</span>
            <span className="text-xs text-slate-700 font-medium">({testCount} tests taken)</span>
          </div>
          <p className="text-[11px] text-slate-700">
            Weighted retrieval accuracy across all completed MCQ sets.
          </p>
        </div>
      </div>

      {/* Exam Readiness Section (Section 20) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Exam Readiness Index</h2>
            <p className="text-xs text-slate-700 mt-0.5">
              Multi-factor confidence scoring: 40% syllabus coverage + 35% retrieval accuracy + 25% schedule adherence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectReadiness.map((sub) => {
            const isHigh = sub.readinessScore >= 75;
            const isModerate = sub.readinessScore >= 50 && sub.readinessScore < 75;

            return (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-bold text-sm text-slate-900">{sub.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      isHigh
                        ? 'bg-emerald-100 text-emerald-800'
                        : isModerate
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.readinessScore}% Ready
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      isHigh ? 'bg-emerald-600' : isModerate ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.readinessScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-700 block text-[11px]">Syllabus Done:</span>
                    <span className="font-semibold text-slate-800">{sub.syllabusPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block text-[11px]">Test Accuracy:</span>
                    <span className="font-semibold text-slate-800">{sub.testPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Topics Analysis Dashboard (Section 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Weak Topics Requiring Attention
              </h2>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              Identified automatically whenever topic accuracy falls below 60% on daily retrieval checks.
            </p>
          </div>

          <button
            onClick={openDailyTestModal}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors self-start sm:self-auto"
          >
            Take Retrieval Check
          </button>
        </div>

        {weakTopicEntries.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-950">No Weak Topics Flagged!</p>
            <p className="text-xs text-emerald-800 mt-1">
              Your retrieval scores are consistently above 60% across all tested subjects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakTopicEntries.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);
              return (
                <div
                  key={item.name}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{item.name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                        {item.accuracy}% Accuracy ({item.correctCount}/{item.testedCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-700">
                      <span>Subject:</span>
                      <span className="font-semibold text-slate-800">{sub?.name || 'General'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800">
                      Scheduled for revision in auto-plan
                    </span>
                    <button
                      onClick={() => handleScheduleRevision(item.name, item.subjectId)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      <span>Add Extra Revision</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Test Submissions Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Retrieval Practice History</h2>
        {testSubmissions.length === 0 ? (
          <p className="text-xs text-slate-700 italic">No tests taken yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Time Spent</th>
                  <th className="py-2.5 px-3">Topics Tested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testSubmissions.map((subm) => (
                  <tr key={subm.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                      {subm.date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {subm.score} / {subm.totalMarks}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          subm.score >= 15
                            ? 'bg-emerald-100 text-emerald-800'
                            : subm.score >= 10
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {Math.round((subm.score / subm.totalMarks) * 100)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-mono">
                      {Math.floor(subm.durationSeconds / 60)}m {subm.durationSeconds % 60}s
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {subm.rememberedTopics.length} remembered, {subm.weakTopics.length} need review
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
