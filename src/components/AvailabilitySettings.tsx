import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Clock,
  ShieldAlert,
  Calendar,
  Coffee,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { DayOfWeek, UnavailableWindow } from '../types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AvailabilitySettings: React.FC = () => {
  const {
    availability,
    updateDayAvailability,
    updateSchedulePreferences,
    addUnavailableWindow,
    deleteUnavailableWindow,
    regeneratePlan,
  } = useStudy();

  // Add Unavailable Window Form
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddWindow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addUnavailableWindow({
      title: newTitle,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      isRecurring: true,
    });

    setNewTitle('');
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Availability & Constraints</span>
            <span>•</span>
            <span>Sections 23, 24 & 25</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule Capacity & Constraints
          </h1>
          <p className="text-slate-700 text-sm mt-0.5">
            Configure your daily study quotas, fixed commitments (school/dinner), and safety buffers for burnout prevention.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Updated & Applied to Schedule</span>
          </div>
        )}
      </div>

      {/* Burnout Prevention & Buffer Controls (Section 24) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Resilience, Breaks & Burnout Safeguards
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Real schedules encounter delays. Safety buffers and catch-up blocks protect your momentum when unexpected events happen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Max Daily Study Limit */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <label className="font-bold text-slate-900 block">
              Max Daily Study Cap
            </label>
            <p className="text-slate-700 text-[11px]">Prevents burnout scheduling</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min={2}
                max={12}
                value={Math.round(availability.maxDailyStudyMinutes / 60)}
                onChange={(e) => {
                  updateSchedulePreferences({
                    maxDailyStudyMinutes: Number(e.target.value) * 60,
                  });
                  triggerSuccess();
                }}
                className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-900"
              />
              <span className="font-semibold text-slate-700">Hours/day</span>
            </div>
          </div>

          {/* Preferred Session Length */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <label className="font-bold text-slate-900 block">
              Target Focus Block
            </label>
            <p className="text-slate-700 text-[11px]">Duration before a scheduled break</p>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={availability.preferredSessionDuration}
                onChange={(e) => {
                  updateSchedulePreferences({
                    preferredSessionDuration: Number(e.target.value),
                  });
                  triggerSuccess();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes (Deep Focus)</option>
              </select>
            </div>
          </div>

          {/* Break Duration */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <label className="font-bold text-slate-900 block">
              Inter-Session Break
            </label>
            <p className="text-slate-700 text-[11px]">Rest interval between blocks</p>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={availability.breakDuration}
                onChange={(e) => {
                  updateSchedulePreferences({
                    breakDuration: Number(e.target.value),
                  });
                  triggerSuccess();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
              </select>
            </div>
          </div>

          {/* Buffer Percentage */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <label className="font-bold text-slate-900 block">
              Safety Delay Buffer
            </label>
            <p className="text-slate-700 text-[11px]">Section 24 resilience cushion</p>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={availability.bufferPercentage}
                onChange={(e) => {
                  updateSchedulePreferences({
                    bufferPercentage: Number(e.target.value),
                  });
                  triggerSuccess();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value={10}>10% Buffer</option>
                <option value={15}>15% Buffer (Recommended)</option>
                <option value={20}>20% Buffer (High Safety)</option>
                <option value={25}>25% Buffer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Available Hours Breakdown (Section 23) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Daily Study Capacity (Weekly Grid)</h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Set how many hours you can dedicate to studying on each day of the week.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const dayConfig = availability.days[day] || {
              availableMinutes: 180,
              preferredTimeOfDay: 'evening',
            };
            const hours = (dayConfig.availableMinutes / 60).toFixed(1);

            return (
              <div
                key={day}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
              >
                <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px]">
                  {day.slice(0, 3)}
                </span>

                <div>
                  <label className="text-[10px] text-slate-700 block">Target Study</label>
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={12}
                      value={hours}
                      onChange={(e) => {
                        updateDayAvailability(day, {
                          availableMinutes: Math.round(Number(e.target.value) * 60),
                        });
                        triggerSuccess();
                      }}
                      className="w-14 px-2 py-1 rounded border border-slate-200 bg-white font-bold text-slate-900 text-xs"
                    />
                    <span className="text-slate-700 font-semibold">hrs</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-700 block">Focus Period</label>
                  <select
                    value={dayConfig.preferredTimeOfDay}
                    onChange={(e) => {
                      updateDayAvailability(day, {
                        preferredTimeOfDay: e.target.value as any,
                      });
                      triggerSuccess();
                    }}
                    className="w-full mt-0.5 px-1.5 py-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-800"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Commitments & Blocked Windows (Section 23) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Fixed Commitments & Blocked Slots
            </h3>
            <p className="text-xs text-slate-700 mt-0.5">
              Times when you cannot study (e.g., School hours 8:00–15:00, Family Dinner 19:00–20:00, Tuition). The planner leaves these blank.
            </p>
          </div>
        </div>

        {/* Existing Windows List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availability.unavailableWindows.map((win) => (
            <div
              key={win.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 block">{win.title}</span>
                <span className="text-slate-700 font-mono text-[11px] block mt-0.5">
                  {win.day}: {win.startTime} – {win.endTime}
                </span>
              </div>
              <button
                onClick={() => {
                  deleteUnavailableWindow(win.id);
                  triggerSuccess();
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                title="Remove commitment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Commitment Form */}
        <form
          onSubmit={handleAddWindow}
          className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end text-xs"
        >
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Commitment Title</label>
            <input
              type="text"
              placeholder="e.g., School Classes, Gym, Piano Tuition"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Day</label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start & End Time</label>
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                required
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
            >
              + Block Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
