/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StudyPlanView } from './components/StudyPlanView';
import { Timetable } from './components/Timetable';
import { CalendarView } from './components/CalendarView';
import { TaskManager } from './components/TaskManager';
import { ProgressView } from './components/ProgressView';
import { SubjectsManager } from './components/SubjectsManager';
import { AvailabilitySettings } from './components/AvailabilitySettings';
import { DailyTestModal } from './components/DailyTestModal';

const StudyAppContent: React.FC = () => {
  const { activeTab } = useStudy();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'study_plan' && <StudyPlanView />}
        {activeTab === 'timetable' && <Timetable />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'progress' && <ProgressView />}
        {activeTab === 'subjects' && <SubjectsManager />}
        {activeTab === 'availability' && <AvailabilitySettings />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-700">
        <p>
          <strong>Study Plan Maker</strong> — Plan → Study → Test → Track → Adapt loop with retrieval practice.
        </p>
      </footer>

      {/* Global 20-Minute Retrieval MCQ Modal */}
      <DailyTestModal />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <StudyAppContent />
    </StudyProvider>
  );
}
