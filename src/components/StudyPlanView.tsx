import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { getTodayDateString } from '../data/mockData';

export const StudyPlanView: React.FC = () => {
  const {
    subjects,
    topics,
    exams,
    availability,
    sessions,
    feasibilityReport,
    regeneratePlan,
    setActiveTab,
    updateSessionStatus,
  } = useStudy();

  const [planSubView, setPlanSubView] = useState<'today' | 'week' | 'month' | 'feasibility'>('week');
  const [planningHorizonDays, setPlanningHorizonDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayStr = getTodayDateString();

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      regeneratePlan(planningHorizonDays);
      setIsGenerating(false);
    }, 400);
  };

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Group sessions by date
  const sessionsByDate: Record<string, typeof sessions> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) {
      sessionsByDate[s.date] = [];
    }
    sessionsByDate[s.date].push(s);
  });

  const sortedDates = Object.keys(sessionsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Automated Deterministic Engine</span>
            <span>•</span>
            <span>Section 6 & 34 Algorithm</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personalized Study Plan
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Generates realistic study blocks balanced across exam urgency, topic difficulty, weak quiz areas, and daily buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="plan-regenerate-btn"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Feasibility Diagnostic Card (Section 22 & 35) */}
      <div
        className={`rounded-2xl border p-5 transition-all shadow-sm ${
          feasibilityReport.isFeasible
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-amber-50/70 border-amber-300'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                feasibilityReport.isFeasible
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {feasibilityReport.isFeasible ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Study Plan Feasibility Assessment
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    feasibilityReport.isFeasible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {feasibilityReport.isFeasible ? 'Realistic & Achievable' : 'Schedule Deficit Detected'}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 max-w-3xl">
                {feasibilityReport.isFeasible ? (
                  <span>
                    Your schedule provides <strong>{formatHoursMins(feasibilityReport.totalAvailableMinutes)}</strong> of study capacity (including a {availability.bufferPercentage}% cushion), comfortably covering the <strong>{formatHoursMins(feasibilityReport.totalWorkloadMinutes)}</strong> of remaining syllabus before exams.
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Deficit: {formatHoursMins(feasibilityReport.deficitMinutes)}</strong>. Remaining planned syllabus requires approx <strong>{formatHoursMins(feasibilityReport.totalWorkloadMinutes)}</strong>, but your availability provides approx <strong>{formatHoursMins(feasibilityReport.totalAvailableMinutes)}</strong> before upcoming exams.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('availability')}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-sm"
            >
              Adjust Daily Hours
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-sm"
            >
              Refine Syllabus Scope
            </button>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-700 block">Remaining Workload:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatHoursMins(feasibilityReport.totalWorkloadMinutes)}
            </span>
          </div>
          <div>
            <span className="text-slate-700 block">Effective Capacity:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatHoursMins(feasibilityReport.totalAvailableMinutes)}
            </span>
          </div>
          <div>
            <span className="text-slate-700 block">Resilience Buffer ({availability.bufferPercentage}%):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatHoursMins(feasibilityReport.bufferMinutes)}
            </span>
          </div>
          <div>
            <span className="text-slate-700 block">Next Milestone Exam:</span>
            <span className="font-bold text-slate-900 text-sm truncate block">
              {feasibilityReport.nextExamName || 'None set'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-view Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex space-x-2">
          {(['today', 'week', 'month', 'feasibility'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setPlanSubView(view)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                planSubView === view
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {view === 'today'
                ? 'Today’s Plan'
                : view === 'week'
                ? 'Weekly Plan'
                : view === 'month'
                ? 'Monthly View'
                : 'Workload Diagnostic'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span>Plan Horizon:</span>
          <select
            value={planningHorizonDays}
            onChange={(e) => setPlanningHorizonDays(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 font-medium"
          >
            <option value={7}>7 Days (1 Week)</option>
            <option value={14}>14 Days (2 Weeks)</option>
            <option value={30}>30 Days (1 Month)</option>
          </select>
        </div>
      </div>

      {/* Detailed Plan Output */}
      {planSubView === 'feasibility' ? (
        /* Detailed Feasibility & Workload Diagnostic */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Workload vs. Capacity Breakdown</h3>
            <p className="text-xs text-slate-700 mt-0.5">
              How study time is prioritized per subject based on upcoming exam urgency and topic difficulty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feasibilityReport.subjectsBreakdown.map((item) => {
              const sub = subjects.find((s) => s.id === item.subjectId);
              return (
                <div
                  key={item.subjectId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sub?.color || '#3b82f6' }}
                      />
                      <span className="font-bold text-sm text-slate-900">{item.subjectName}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Priority Score: {item.urgencyScore}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                    <span>Required Syllabus Time:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatHoursMins(item.requiredMinutes)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Daily / Weekly / Monthly Session Timeline */
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Generated Plan Yet</h4>
              <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto">
                Click "Regenerate Plan" to automatically allocate topics into balanced daily study sessions and retrieval practice tests.
              </p>
              <button
                onClick={handleRegenerate}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Generate Plan Now
              </button>
            </div>
          ) : (
            sortedDates
              .filter((dateStr) => {
                if (planSubView === 'today') return dateStr === todayStr;
                return true;
              })
              .map((dateStr) => {
                const daySessions = sessionsByDate[dateStr] || [];
                const dateObj = new Date(dateStr + 'T12:00:00');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                const isToday = dateStr === todayStr;

                const dayExams = exams.filter((e) => e.date === dateStr);

                return (
                  <div
                    key={dateStr}
                    className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 transition-colors ${
                      isToday ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                    }`}
                  >
                    {/* Day Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">
                          {dayName.toUpperCase()}
                        </h4>
                        <span className="text-xs font-semibold text-slate-700">· {formattedDate}</span>
                        {isToday && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <span>
                          {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>
                          {formatHoursMins(
                            daySessions.reduce((acc, s) => acc + (s.duration || 0), 0)
                          )}{' '}
                          total
                        </span>
                      </div>
                    </div>

                    {/* Day Exams If Any */}
                    {dayExams.length > 0 && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-900 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>EXAM DAY: {dayExams.map((e) => e.name).join(', ')}</span>
                        </div>
                        <span className="text-rose-700 font-semibold">{dayExams[0].time}</span>
                      </div>
                    )}

                    {/* Sessions Timeline Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySessions.map((session) => {
                        const sub = subjects.find((s) => s.id === session.subjectId);
                        const isDone = session.status === 'completed';

                        return (
                          <div
                            key={session.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                              session.isDailyTest
                                ? 'bg-indigo-50/50 border-indigo-200'
                                : session.isRevision
                                ? 'bg-amber-50/40 border-amber-200'
                                : isDone
                                ? 'bg-slate-50/80 border-slate-200 opacity-80'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-mono font-semibold text-slate-700">
                                  {session.startTime} – {session.endTime}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    session.isDailyTest
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : session.isRevision
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {session.isDailyTest
                                    ? 'Daily Test (20m)'
                                    : session.isRevision
                                    ? 'Revision'
                                    : `${session.duration}m Study`}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: session.isDailyTest
                                      ? '#6366f1'
                                      : sub?.color || '#3b82f6',
                                  }}
                                />
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {session.isDailyTest
                                    ? 'Daily 20-Minute MCQ Test'
                                    : sub?.name || 'General Study'}
                                </h5>
                              </div>

                              <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                                {session.topicName || session.notes || 'Focus study block'}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-700">
                                Status: <strong className="capitalize">{session.status}</strong>
                              </span>

                              {!session.isDailyTest && (
                                <button
                                  onClick={() =>
                                    updateSessionStatus(
                                      session.id,
                                      isDone ? 'scheduled' : 'completed'
                                    )
                                  }
                                  className={`text-[11px] font-semibold px-2 py-1 rounded ${
                                    isDone
                                      ? 'text-slate-700 hover:bg-slate-100'
                                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                                >
                                  {isDone ? 'Undo' : 'Mark Done'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
};
