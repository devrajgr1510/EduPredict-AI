import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { TimeTableSlot } from '../types/index.ts';

interface TimeTableViewProps {
  slots: TimeTableSlot[];
  onAddSlot?: (slot: TimeTableSlot) => void;
  onDeleteSlot?: (id: string) => void;
}

export const TimeTableView: React.FC<TimeTableViewProps> = ({ 
  slots,
  onAddSlot,
  onDeleteSlot
}) => {
  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Auto-detect current day of week
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState<string>(
    days.includes(todayName as any) ? todayName : 'Monday'
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeTableSlot, 'id'>>({
    dayOfWeek: (days.includes(todayName as any) ? todayName : 'Monday') as any,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectCode: 'CS606',
    subjectName: 'Artificial Intelligence & Robotics',
    room: 'Hall 401',
    instructor: 'Prof. Micheal Sykse',
    type: 'Lecture'
  });

  const daySlots = slots.filter(s => s.dayOfWeek === selectedDay);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSlot) {
      onAddSlot({
        ...newSlot,
        id: `slot-${Date.now()}`
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Class Timetable & Lecture Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            B.Tech Computer Science & Engineering · Semester 6 (Section A)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewSlot(prev => ({ ...prev, dayOfWeek: selectedDay as any }));
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject to Timetable</span>
          </button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedDay === day
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {day}
            {day === todayName && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white">
                Today
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Slots Schedule for Selected Day */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>{selectedDay} Periods & Laboratory Sessions</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {daySlots.length} lecture{daySlots.length !== 1 ? 's' : ''} scheduled
            </span>
            <button
              onClick={() => {
                setNewSlot(prev => ({ ...prev, dayOfWeek: selectedDay as any }));
                setIsAddModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              title="Add class to this day"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {daySlots.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No scheduled classes for {selectedDay}</div>
            <p className="text-xs text-slate-500">Click the + button above to add a new subject lecture or lab slot.</p>
            <button
              onClick={() => {
                setNewSlot(prev => ({ ...prev, dayOfWeek: selectedDay as any }));
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class to {selectedDay}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daySlots.map(slot => (
              <div
                key={slot.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-blue-400 transition-all space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {slot.subjectCode}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      slot.type === 'Lab' 
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : slot.type === 'Tutorial'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {slot.type}
                    </span>

                    {onDeleteSlot && (
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                        title="Remove slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {slot.subjectName}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{slot.startTime} – {slot.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{slot.room}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-500 pt-0.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.instructor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD NEW TIMETABLE SLOT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Subject to Timetable</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={newSlot.dayOfWeek}
                    onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Session Type</label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Session</option>
                    <option value="Tutorial">Tutorial / Discussion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSlot.subjectCode}
                    onChange={(e) => setNewSlot({ ...newSlot, subjectCode: e.target.value })}
                    placeholder="e.g. CS606"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSlot.subjectName}
                    onChange={(e) => setNewSlot({ ...newSlot, subjectName: e.target.value })}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    placeholder="e.g. Hall 401"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Instructor</label>
                  <input
                    type="text"
                    required
                    value={newSlot.instructor}
                    onChange={(e) => setNewSlot({ ...newSlot, instructor: e.target.value })}
                    placeholder="e.g. Prof. Micheal Sykse"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
