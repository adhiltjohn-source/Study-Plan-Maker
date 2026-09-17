import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  MapPin,
  Tag,
} from 'lucide-react';
import { Priority, Exam, Task } from '../types';
import { getTodayDateString } from '../data/mockData';

export const CalendarView: React.FC = () => {
  const {
    subjects,
    exams,
    tasks,
    sessions,
    addExam,
    addTask,
    updateTaskStatus,
    updateSessionStatus,
  } = useStudy();

  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Modals state
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Add Exam Form
  const [examName, setExamName] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(todayStr);
  const [examTime, setExamTime] = useState('09:00');
  const [examLocation, setExamLocation] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [examPriority, setExamPriority] = useState<Priority>('High');

  // Add Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDate, setTaskDate] = useState(todayStr);
  const [taskTime, setTaskTime] = useState('16:00');
  const [taskDuration, setTaskDuration] = useState(60);
  const [taskPriority, setTaskPriority] = useState<Priority>('Medium');
  const [taskDescription, setTaskDescription] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(todayStr);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Calendar Grid Days Calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday-start (0 = Monday, 6 = Sunday)
  const startingDayIndex = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const calendarCells = [];
  // Empty leading days
  for (let i = 0; i < startingDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedD = String(d).padStart(2, '0');
    const formattedM = String(month + 1).padStart(2, '0');
    const dateKey = `${year}-${formattedM}-${formattedD}`;
    calendarCells.push(dateKey);
  }

  // Handle Add Exam Submit (Section 9)
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    addExam({
      name: examName,
      subjectId: examSubjectId,
      date: examDate,
      time: examTime,
      location: examLocation || undefined,
      notes: examNotes || undefined,
      priority: examPriority,
    });

    setIsExamModalOpen(false);
    setExamName('');
    setExamLocation('');
    setExamNotes('');
  };

  // Handle Add Task Submit (Section 10)
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      subjectId: taskSubjectId,
      date: taskDate,
      startTime: taskTime,
      duration: Number(taskDuration),
      priority: taskPriority,
      description: taskDescription || undefined,
      status: 'not_started',
    });

    setIsTaskModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
  };

  // Selected Day Items
  const dayExams = exams.filter((e) => e.date === selectedDateStr);
  const dayTasks = tasks.filter((t) => t.date === selectedDateStr);
  const daySessions = sessions.filter((s) => s.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Academic Calendar & Deadlines</span>
            <span>•</span>
            <span>Section 8, 9 & 10</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Study Planner Calendar
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Click any day to view its complete study schedule, add upcoming exams, or log assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="cal-add-exam-btn"
            onClick={() => {
              setExamDate(selectedDateStr);
              setIsExamModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>
          <button
            id="cal-add-task-btn"
            onClick={() => {
              setTaskDate(selectedDateStr);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Main Grid + Day Agenda Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month View (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {/* Month Navigator Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {monthName} {year}
              </h2>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((dateKey, index) => {
              if (!dateKey) {
                return <div key={`empty-${index}`} className="h-20 sm:h-24 bg-slate-50/40 rounded-xl" />;
              }

              const dayNum = parseInt(dateKey.split('-')[2], 10);
              const isSelected = dateKey === selectedDateStr;
              const isToday = dateKey === todayStr;

              // Items for this cell
              const cellExams = exams.filter((e) => e.date === dateKey);
              const cellTasks = tasks.filter((t) => t.date === dateKey);
              const cellSessions = sessions.filter((s) => s.date === dateKey);

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30'
                      : isToday
                      ? 'border-slate-400 bg-slate-50/70 font-semibold'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold'
                          : isSelected
                          ? 'text-blue-700 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {cellExams.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Exam scheduled" />
                    )}
                  </div>

                  {/* Badges / Indicators */}
                  <div className="space-y-1 overflow-hidden">
                    {cellExams.slice(0, 1).map((ex) => (
                      <div
                        key={ex.id}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 truncate"
                        title={ex.name}
                      >
                        🎯 {ex.name}
                      </div>
                    ))}

                    {cellSessions.length > 0 && cellExams.length === 0 && (
                      <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 truncate">
                        📚 {cellSessions.length} session{cellSessions.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    {cellTasks.length > 0 && (
                      <div className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 truncate hidden sm:block">
                        ☐ {cellTasks.length} task{cellTasks.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (1 span) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Day Agenda
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            {selectedDateStr === todayStr && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                TODAY
              </span>
            )}
          </div>

          {/* Exams on this day */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
              <span>Exams Scheduled</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-[10px]">
                {dayExams.length}
              </span>
            </h4>
            {dayExams.length === 0 ? (
              <p className="text-xs text-slate-700 italic">No exams on this date.</p>
            ) : (
              <div className="space-y-2">
                {dayExams.map((ex) => {
                  const sub = subjects.find((s) => s.id === ex.subjectId);
                  return (
                    <div
                      key={ex.id}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-950">{ex.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                          {ex.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-rose-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ex.time}</span>
                        {sub && <span>· {sub.name}</span>}
                      </div>
                      {ex.location && (
                        <div className="flex items-center gap-2 text-xs text-rose-700">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{ex.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study Sessions on this day */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
              <span>Study Sessions</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[10px]">
                {daySessions.length}
              </span>
            </h4>
            {daySessions.length === 0 ? (
              <p className="text-xs text-slate-700 italic">No study sessions allocated.</p>
            ) : (
              <div className="space-y-2">
                {daySessions.map((sess) => {
                  const sub = subjects.find((s) => s.id === sess.subjectId);
                  const isDone = sess.status === 'completed';
                  return (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span className="font-mono text-slate-700">
                            {sess.startTime} – {sess.endTime}
                          </span>
                          <span>·</span>
                          <span>{sess.isDailyTest ? 'Daily MCQ Test' : sub?.name || 'Study'}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 truncate max-w-[180px]">
                          {sess.topicName || `${sess.duration}m focus`}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          updateSessionStatus(sess.id, isDone ? 'scheduled' : 'completed')
                        }
                        className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {isDone ? 'Done ✓' : 'Mark'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks & Assignments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span>Assignments & Tasks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px]">
                {dayTasks.length}
              </span>
            </h4>
            {dayTasks.length === 0 ? (
              <p className="text-xs text-slate-700 italic">No tasks due.</p>
            ) : (
              <div className="space-y-2">
                {dayTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        updateTaskStatus(task.id, isDone ? 'not_started' : 'completed')
                      }
                      className="p-2 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`truncate ${isDone ? 'line-through text-slate-600' : 'text-slate-800 font-medium'}`}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Exam Modal (Section 9) */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Exam to Calendar</h3>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g., Physics Final Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Science Hall B"
                  value={examLocation}
                  onChange={(e) => setExamLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <div className="flex items-center gap-2">
                  {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setExamPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                        examPriority === p
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Syllabus</label>
                <textarea
                  rows={2}
                  placeholder="Key topics to focus on, allowed materials..."
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal (Section 10) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Task to Calendar</h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Complete Physics Chapter 5 problems"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task details, instructions..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
