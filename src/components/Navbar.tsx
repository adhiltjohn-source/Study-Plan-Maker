import React from 'react';
import { useStudy, NavigationTab } from '../context/StudyContext';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  Sparkles,
  Layers,
  BarChart3,
  Sliders,
  Flame,
  RotateCcw,
  Target,
} from 'lucide-react';
import { getDaysRemaining } from '../utils/studyPlannerAlgorithm';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    exams,
    testSubmissions,
    openDailyTestModal,
    resetToSampleData,
  } = useStudy();

  // Find the closest upcoming exam
  const upcomingExams = exams
    .map((e) => ({ ...e, daysRemaining: getDaysRemaining(e.date) }))
    .filter((e) => e.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nextExam = upcomingExams[0];

  // Has today's test been completed?
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = testSubmissions.some((t) => t.date === todayStr);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
    { id: 'study_plan', label: 'Study Plan', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tasks', label: 'To-Do Lists', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subjects', icon: <Target className="w-4 h-4" /> },
    { id: 'availability', label: 'Availability', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <span className="text-blue-400 text-xl font-mono">SP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Study Plan Maker</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Retrieval Loop
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium hidden sm:block">
                Plan · Study · Test · Track · Adapt
              </p>
            </div>
          </div>

          {/* Center / Right Highlights */}
          <div className="flex items-center gap-3">
            {/* Nearest Exam Countdown Pill */}
            {nextExam && (
              <button
                id="navbar-next-exam-badge"
                onClick={() => setActiveTab('calendar')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors text-xs font-medium"
                title={`Next Exam: ${nextExam.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold">{nextExam.name.split(' ')[0]}:</span>
                <span>{nextExam.daysRemaining} days away</span>
              </button>
            )}

            {/* Daily Test Button */}
            <button
              id="navbar-daily-test-btn"
              onClick={openDailyTestModal}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition-all ${
                completedToday
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{completedToday ? 'Today’s Test Completed ✓' : 'Daily Test (20m / 20 Marks)'}</span>
            </button>

            {/* Reset / Demo Data button */}
            <button
              id="navbar-reset-data-btn"
              onClick={() => {
                if (window.confirm('Reset all planner schedules and data to default initial setup?')) {
                  resetToSampleData();
                }
              }}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
