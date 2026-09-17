import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Clock,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Coffee,
  School,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { StudySession, DayOfWeek } from '../types';
import { getTodayDateString } from '../data/mockData';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export const Timetable: React.FC = () => {
  const {
    subjects,
    availability,
    sessions,
    addSession,
    editSession,
    deleteSession,
    updateSessionStatus,
    regeneratePlan,
    openDailyTestModal,
  } = useStudy();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formTopicName, setFormTopicName] = useState('');
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formStartTime, setFormStartTime] = useState('16:00');
  const [formDuration, setFormDuration] = useState(60);
  const [formIsTest, setFormIsTest] = useState(false);

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();

    const [h, m] = formStartTime.split(':').map(Number);
    const endTotalMin = h * 60 + m + Number(formDuration);
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    if (editingSession) {
      editSession(editingSession.id, {
        subjectId: formSubjectId,
        topicName: formTopicName,
        date: formDate,
        startTime: formStartTime,
        endTime,
        duration: Number(formDuration),
        isDailyTest: formIsTest,
      });
      setEditingSession(null);
    } else {
      addSession({
        subjectId: formSubjectId,
        topicName: formTopicName || (formIsTest ? 'Daily MCQ Test' : 'Custom Study Block'),
        date: formDate,
        startTime: formStartTime,
        endTime,
        duration: Number(formDuration),
        status: 'scheduled',
        isDailyTest: formIsTest,
      });
    }

    setIsAddModalOpen(false);
    // Reset
    setFormTopicName('');
  };

  const openEditModal = (sess: StudySession) => {
    setEditingSession(sess);
    setFormSubjectId(sess.subjectId);
    setFormTopicName(sess.topicName || '');
    setFormDate(sess.date);
    setFormStartTime(sess.startTime);
    setFormDuration(sess.duration);
    setFormIsTest(Boolean(sess.isDailyTest));
    setIsAddModalOpen(true);
  };

  // Helper to map date to day of week
  const getDayNameForDate = (dateStr: string): DayOfWeek => {
    const d = new Date(dateStr + 'T12:00:00');
    return DAYS[(d.getDay() + 6) % 7]; // Convert Sunday=0 to Monday=0
  };

  return (
    <div className="space-y-6">
      {/* Timetable Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Interactive Weekly Schedule</span>
            <span>•</span>
            <span>Section 11 View</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Weekly Study Timetable
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Auto-generated based on your flexible availability, exam countdowns, and fixed commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="timetable-regenerate-btn"
            onClick={() => regeneratePlan(7)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            id="timetable-add-session-btn"
            onClick={() => {
              setEditingSession(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Legend & Availability Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">Legend:</span>
          {subjects.map((sub) => (
            <div key={sub.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
              <span className="text-slate-700">{sub.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-700 font-medium">Daily 20m MCQ Test</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-700">School / Blocked Slot</span>
          </div>
        </div>

        <div className="text-slate-700">
          Click any session to mark completion, edit, or adjust times.
        </div>
      </div>

      {/* Grid Timetable Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-700 sticky top-0 z-10">
            <div className="p-3 border-r border-slate-200 text-center font-mono">TIME</div>
            {DAYS.map((day) => {
              const dayConfig = availability.days[day];
              return (
                <div key={day} className="p-3 border-r border-slate-200 last:border-r-0 text-center">
                  <span className="block text-slate-900 font-bold uppercase">{day.slice(0, 3)}</span>
                  <span className="block text-[11px] font-normal text-slate-700 mt-0.5">
                    {dayConfig ? `${Math.round(dayConfig.availableMinutes / 60)}h target` : 'Off'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map((timeSlot) => {
            const slotHour = parseInt(timeSlot.split(':')[0], 10);

            return (
              <div
                key={timeSlot}
                className="grid grid-cols-8 border-b border-slate-100 min-h-[72px] text-xs hover:bg-slate-50/30 transition-colors"
              >
                {/* Time Label */}
                <div className="p-2.5 border-r border-slate-200 text-slate-700 font-mono text-[11px] flex items-start justify-center bg-slate-50/40">
                  {timeSlot}
                </div>

                {/* Day Columns */}
                {DAYS.map((day) => {
                  // Check if school or dinner is blocked here
                  const blocked = availability.unavailableWindows.find((w) => {
                    if (w.day !== day) return false;
                    const [sH] = w.startTime.split(':').map(Number);
                    const [eH] = w.endTime.split(':').map(Number);
                    return slotHour >= sH && slotHour < eH;
                  });

                  // Find sessions for this day around this hour
                  const slotSessions = sessions.filter((s) => {
                    const sessionDay = getDayNameForDate(s.date);
                    if (sessionDay !== day) return false;
                    const [sH] = s.startTime.split(':').map(Number);
                    return sH === slotHour;
                  });

                  return (
                    <div
                      key={day}
                      className="p-1 border-r border-slate-100 last:border-r-0 relative group"
                    >
                      {/* If unavailable window */}
                      {blocked && (
                        <div className="w-full h-full rounded-md bg-slate-100/70 border border-slate-200/60 p-1.5 flex items-center gap-1 text-[11px] text-slate-700">
                          {blocked.title.toLowerCase().includes('dinner') ? (
                            <Utensils className="w-3 h-3 shrink-0 text-slate-700" />
                          ) : (
                            <School className="w-3 h-3 shrink-0 text-slate-700" />
                          )}
                          <span className="truncate">{blocked.title}</span>
                        </div>
                      )}

                      {/* Render scheduled study session */}
                      {slotSessions.map((session) => {
                        const sub = subjects.find((s) => s.id === session.subjectId);
                        const isDone = session.status === 'completed';
                        const isMissed = session.status === 'missed';

                        return (
                          <div
                            key={session.id}
                            className={`w-full rounded-lg p-2 border transition-all cursor-pointer shadow-xs mb-1 ${
                              session.isDailyTest
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                                : isDone
                                ? 'bg-slate-100 border-slate-300 opacity-70 text-slate-600'
                                : isMissed
                                ? 'bg-rose-50 border-rose-300 text-rose-900'
                                : 'bg-white border-slate-200 hover:border-slate-400 text-slate-900'
                            }`}
                            onClick={() => openEditModal(session)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-slate-700">
                                {session.startTime}
                              </span>
                              <div className="flex items-center gap-1">
                                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isMissed && <AlertCircle className="w-3 h-3 text-rose-600" />}
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: session.isDailyTest
                                      ? '#6366f1'
                                      : sub?.color || '#3b82f6',
                                  }}
                                />
                              </div>
                            </div>

                            <p className="font-bold text-[11px] truncate mt-0.5">
                              {session.isDailyTest
                                ? 'Daily MCQ Test'
                                : sub?.name || 'Study Block'}
                            </p>

                            <p className="text-[10px] text-slate-700 truncate">
                              {session.topicName || `${session.duration}m`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Session Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSession ? 'Edit Timetable Session' : 'Add Manual Study Session'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSession(null);
                }}
                className="p-1 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sessionType"
                      checked={!formIsTest}
                      onChange={() => setFormIsTest(false)}
                      className="text-blue-600"
                    />
                    <span>Subject Study Block</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sessionType"
                      checked={formIsTest}
                      onChange={() => setFormIsTest(true)}
                      className="text-indigo-600"
                    />
                    <span>Daily MCQ Test</span>
                  </label>
                </div>
              </div>

              {!formIsTest && (
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
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Topic / Task Description
                </label>
                <input
                  type="text"
                  placeholder={formIsTest ? 'Daily 20-min retrieval practice' : 'e.g., Matrices Cramer Rule Exercises'}
                  value={formTopicName}
                  onChange={(e) => setFormTopicName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                <div className="flex items-center gap-2">
                  {[20, 30, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setFormDuration(dur)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        formDuration === dur
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              {editingSession && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateSessionStatus(
                          editingSession.id,
                          editingSession.status === 'completed' ? 'scheduled' : 'completed'
                        );
                        setIsAddModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold"
                    >
                      {editingSession.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed ✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSessionStatus(editingSession.id, 'missed');
                        setIsAddModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 font-semibold"
                    >
                      Mark Missed
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      deleteSession(editingSession.id);
                      setIsAddModalOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                >
                  {editingSession ? 'Update Session' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
