import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  AlertCircle,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import { getTodayDateString } from '../data/mockData';
import { getDaysRemaining } from '../utils/studyPlannerAlgorithm';

export const Dashboard: React.FC = () => {
  const {
    userProfile,
    subjects,
    topics,
    exams,
    tasks,
    sessions,
    testSubmissions,
    reschedulingSuggestions,
    applyReschedulingSuggestion,
    dismissReschedulingSuggestion,
    feasibilityReport,
    updateSessionStatus,
    updateTaskStatus,
    openDailyTestModal,
    setActiveTab,
  } = useStudy();

  const todayStr = getTodayDateString();

  // 1. What do I need to do today?
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayTasks = tasks.filter((t) => t.date === todayStr);

  // 2. How much have I studied today?
  const plannedMinutesToday = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const studiedMinutesToday = todaySessions.reduce((acc, s) => {
    if (s.status === 'completed') return acc + (s.actualMinutes || s.duration || 0);
    if (s.status === 'in_progress') return acc + (s.actualMinutes || 30);
    return acc;
  }, 0);

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // 3. What exams are coming?
  const sortedExams = [...exams]
    .map((e) => ({ ...e, daysRemaining: getDaysRemaining(e.date) }))
    .filter((e) => e.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nextExam = sortedExams[0];

  // 4. Progress per subject
  const subjectProgress = subjects.map((sub) => {
    const subTopics = topics.filter((t) => t.subjectId === sub.id);
    const completedCount = subTopics.filter((t) => t.status === 'completed').length;
    const totalCount = subTopics.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return {
      ...sub,
      completedCount,
      totalCount,
      percentage,
    };
  });

  // 5. Test Performance
  const completedTodayTest = testSubmissions.find((t) => t.date === todayStr);
  const yesterdaySubmission = testSubmissions.find((t) => t.date !== todayStr);

  // Pending Reschedule suggestions
  const pendingReschedules = reschedulingSuggestions.filter((r) => !r.applied);

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Student Dashboard</span>
            <span>•</span>
            <span>{userProfile.gradeLevel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Good day, {userProfile.name}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            {nextExam ? (
              <span>
                Target Focus: <strong className="text-white font-semibold">{nextExam.name}</strong> is in{' '}
                <span className="text-amber-300 font-bold">{nextExam.daysRemaining} days</span>. Your retrieval-optimized study loop is active.
              </span>
            ) : (
              'Organize subjects, stay consistent, and verify retention daily with quick practice.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dash-quick-take-test-btn"
            onClick={openDailyTestModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm shadow transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{completedTodayTest ? 'Review Today’s Test' : 'Take Daily MCQ Test'}</span>
          </button>
          <button
            id="dash-view-plan-btn"
            onClick={() => setActiveTab('plan')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/15 transition-colors"
          >
            <span>View Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adaptive Rescheduling Alert Banner (Section 21) */}
      {pendingReschedules.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          {pendingReschedules.map((suggestion) => (
            <div key={suggestion.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">
                    Adaptive Plan Adjustment Available
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {suggestion.reason}. We’ve calculated makeup time:
                    {suggestion.proposals.map((p, idx) => (
                      <span key={idx} className="font-semibold ml-1">
                        {p.date} (+{p.duration}m at {p.startTime})
                        {idx < suggestion.proposals.length - 1 ? ' &' : ''}
                      </span>
                    ))}
                    .
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  id={`apply-reschedule-${suggestion.id}`}
                  onClick={() => applyReschedulingSuggestion(suggestion.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
                >
                  Apply Adjustment
                </button>
                <button
                  onClick={() => dismissReschedulingSuggestion(suggestion.id)}
                  className="px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 text-xs font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feasibility Warning Banner (Section 22 & 35) */}
      {!feasibilityReport.isFeasible && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-950">
                Schedule Feasibility Warning
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Your remaining planned workload ({formatHoursMins(feasibilityReport.totalWorkloadMinutes)}) exceeds your available capacity before upcoming exams ({formatHoursMins(feasibilityReport.totalAvailableMinutes)}) by approximately {formatHoursMins(feasibilityReport.deficitMinutes)}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('plan')}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0"
          >
            Review Feasibility
          </button>
        </div>
      )}

      {/* Key Metrics / 5 Questions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Study Time Today */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Today’s Study Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {formatHoursMins(studiedMinutesToday)}
            </span>
            <span className="text-sm font-medium text-slate-700">
              / {formatHoursMins(plannedMinutesToday || 180)} planned
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((studiedMinutesToday / (plannedMinutesToday || 180)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-700 mt-2">
            <span>
              {plannedMinutesToday > 0
                ? `${Math.round((studiedMinutesToday / plannedMinutesToday) * 100)}% completed`
                : 'No sessions scheduled'}
            </span>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Open Timetable →
            </button>
          </div>
        </div>

        {/* Card 2: Daily MCQ Test Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Daily MCQ Test (20 Marks)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>

          {completedTodayTest ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {completedTodayTest.score} / {completedTodayTest.totalMarks}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {Math.round((completedTodayTest.score / completedTodayTest.totalMarks) * 100)}% Accuracy
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-2">
                Completed today in {Math.floor(completedTodayTest.durationSeconds / 60)}m {completedTodayTest.durationSeconds % 60}s.
              </p>
              <button
                id="dash-review-test-btn"
                onClick={openDailyTestModal}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                Review Answers & Explanations →
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-800">Pending Today</span>
                {yesterdaySubmission && (
                  <span className="text-xs text-slate-700">
                    (Yesterday: {yesterdaySubmission.score}/20)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                20 questions · 20 minutes limit. Retrieval practice to reinforce what you studied today.
              </p>
              <button
                id="dash-start-today-test-btn"
                onClick={openDailyTestModal}
                className="mt-3 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Today’s Test</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Next Exam Countdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Next Upcoming Exam
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {nextExam ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {nextExam.daysRemaining}
                </span>
                <span className="text-sm font-semibold text-slate-700">DAYS LEFT</span>
              </div>
              <p className="text-xs font-medium text-slate-900 mt-1 truncate">
                {nextExam.name}
              </p>
              <p className="text-xs text-slate-700">
                {nextExam.date} at {nextExam.time} {nextExam.location && `· ${nextExam.location}`}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-800">
                  {nextExam.priority} Priority
                </span>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-medium"
                >
                  All Exams ({exams.length}) →
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-700">No exams registered yet.</p>
              <button
                onClick={() => setActiveTab('calendar')}
                className="mt-3 text-xs font-semibold text-blue-600"
              >
                + Add an Exam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Schedule & To-Do List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule & Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today’s Study Schedule</h3>
                <p className="text-xs text-slate-700">
                  Click a session to mark status or adjust time
                </p>
              </div>
              <button
                id="dash-add-session-btn"
                onClick={() => setActiveTab('timetable')}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adjust Timetable</span>
              </button>
            </div>

            {todaySessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No sessions scheduled for today</p>
                <p className="text-xs text-slate-700 mt-1">
                  Generate your automated study plan to populate today’s time blocks.
                </p>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="mt-3 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium"
                >
                  Generate Plan
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySessions.map((session) => {
                  const subject = subjects.find((s) => s.id === session.subjectId);
                  const isCompleted = session.status === 'completed';
                  const isInProgress = session.status === 'in_progress';
                  const isMissed = session.status === 'missed';

                  return (
                    <div
                      key={session.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : isInProgress
                          ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                          : isMissed
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: session.isDailyTest ? '#6366f1' : subject?.color || '#94a3b8' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-700">
                              {session.startTime} – {session.endTime}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {session.isDailyTest ? 'Daily MCQ Test' : subject?.name || 'General Study'}
                            </span>
                            {session.isRevision && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                                Revision
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 mt-0.5">
                            {session.topicName || session.notes || `${session.duration} minutes study block`}
                          </p>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {session.isDailyTest ? (
                          <button
                            onClick={openDailyTestModal}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                          >
                            {isCompleted ? 'View Test Results' : 'Take Test (20m)'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                updateSessionStatus(
                                  session.id,
                                  isCompleted ? 'scheduled' : 'completed'
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                              }`}
                            >
                              {isCompleted ? 'Completed ✓' : 'Mark Done'}
                            </button>

                            {!isCompleted && (
                              <button
                                onClick={() =>
                                  updateSessionStatus(
                                    session.id,
                                    isMissed ? 'scheduled' : 'missed'
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  isMissed
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title="Mark Missed to trigger auto-rescheduling"
                              >
                                {isMissed ? 'Missed' : 'Skip'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's To-Do List Tasks */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Today’s Tasks & Assignments</h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                All Tasks ({tasks.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {todayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const sub = subjects.find((s) => s.id === task.subjectId);

                return (
                  <div
                    key={task.id}
                    onClick={() =>
                      updateTaskStatus(task.id, isCompleted ? 'not_started' : 'completed')
                    }
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-medium ${
                            isCompleted ? 'line-through text-slate-600' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-700">
                          {sub && <span style={{ color: sub.color }}>{sub.name}</span>}
                          {task.startTime && <span>· {task.startTime}</span>}
                          <span>· {task.duration}m</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus Progress & Upcoming Exams */}
        <div className="space-y-6">
          {/* Syllabus Progress Tracking */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Syllabus Progress</h3>
              <button
                onClick={() => setActiveTab('subjects')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Edit Topics →
              </button>
            </div>

            <div className="space-y-4">
              {subjectProgress.map((sub) => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span>{sub.name}</span>
                    </div>
                    <span className="text-slate-700 font-mono font-medium">
                      {sub.completedCount}/{sub.totalCount} topics ({sub.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.percentage}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Countdowns List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Upcoming Exams</h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add Exam
              </button>
            </div>

            <div className="space-y-3">
              {sortedExams.slice(0, 4).map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <div
                    key={exam.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub?.color || '#6366f1' }}
                        />
                        <h5 className="text-xs font-bold text-slate-900">{exam.name}</h5>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        {exam.date} · {exam.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-slate-900">
                        {exam.daysRemaining}d
                      </span>
                      <span className="block text-[10px] text-slate-700">remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retrieval Practice Philosophy Insight Card */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-indigo-950">Learning Science Principle</h5>
                <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                  Daily retrieval testing strengthens neural pathways far more than passive re-reading. Each 20-mark test targets today’s topics and reveals specific gaps for tomorrow’s plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
