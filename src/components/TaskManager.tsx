import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';
import { getTodayDateString } from '../data/mockData';

export const TaskManager: React.FC = () => {
  const {
    subjects,
    tasks,
    addTask,
    editTask,
    updateTaskStatus,
    deleteTask,
    openDailyTestModal,
  } = useStudy();

  const [viewScope, setViewScope] = useState<'today' | 'week' | 'month'>('today');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formTime, setFormTime] = useState('16:00');
  const [formDuration, setFormDuration] = useState(60);
  const [formPriority, setFormPriority] = useState<Priority>('Medium');
  const [formDescription, setFormDescription] = useState('');

  const todayStr = getTodayDateString();

  // Filter tasks based on viewScope
  const filteredTasks = tasks.filter((t) => {
    // Subject filter
    if (filterSubject !== 'all' && t.subjectId !== filterSubject) return false;
    // Priority filter
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

    // Scope filter
    if (viewScope === 'today') {
      return t.date === todayStr;
    } else if (viewScope === 'week') {
      // within next 7 days or today
      const diff = (new Date(t.date).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    } else {
      // within 30 days
      const diff = (new Date(t.date).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 30;
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      editTask(editingTask.id, {
        title: formTitle,
        subjectId: formSubjectId,
        date: formDate,
        startTime: formTime,
        duration: Number(formDuration),
        priority: formPriority,
        description: formDescription,
      });
      setEditingTask(null);
    } else {
      addTask({
        title: formTitle,
        subjectId: formSubjectId,
        date: formDate,
        startTime: formTime,
        duration: Number(formDuration),
        priority: formPriority,
        description: formDescription,
        status: 'not_started',
      });
    }

    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormSubjectId(task.subjectId || subjects[0]?.id || '');
    setFormDate(task.date);
    setFormTime(task.startTime || '16:00');
    setFormDuration(task.duration);
    setFormPriority(task.priority);
    setFormDescription(task.description || '');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Academic To-Do Lists</span>
            <span>•</span>
            <span>Section 12 & 13</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Study Tasks & To-Do Lists
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Organize daily focus items, track assignment completion, and align work with your weekly syllabus goals.
          </p>
        </div>

        <button
          id="tasks-add-task-btn"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Scope Switcher & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-1">
          {(['today', 'week', 'month'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setViewScope(scope)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                viewScope === scope
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {scope === 'today' ? 'Today' : scope === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No tasks in this view</p>
            <p className="text-xs text-slate-700 mt-1">
              Add a new task or generate your study plan to populate your daily checklist.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const sub = subjects.find((s) => s.id === task.subjectId);
            const isDone = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isSkipped = task.status === 'skipped';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : isInProgress
                    ? 'bg-blue-50/40 border-blue-200'
                    : isSkipped
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Checkbox */}
                  <button
                    onClick={() =>
                      updateTaskStatus(task.id, isDone ? 'not_started' : 'completed')
                    }
                    className="mt-0.5 shrink-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold ${
                          isDone ? 'line-through text-slate-600' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.isDailyTest && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded-full">
                          Daily Test
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-700 mt-0.5">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-700">
                      {sub && (
                        <span className="flex items-center gap-1 font-medium" style={{ color: sub.color }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
                          {sub.name}
                        </span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {task.date}
                      </span>
                      {task.startTime && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.startTime} ({task.duration}m)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions & Priority */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {/* Lifecycle Selector */}
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 capitalize"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>

                  <button
                    onClick={() => openEdit(task)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Create New Study Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Revise Algebra matrices exercise 1-20"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
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
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
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
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes or references..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
