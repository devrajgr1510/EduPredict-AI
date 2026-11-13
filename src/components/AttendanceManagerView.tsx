import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  BookOpen, 
  Percent, 
  ShieldCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import { SubjectDetails } from '../types/index.ts';

interface AttendanceManagerViewProps {
  subjects: SubjectDetails[];
  overallAttendance: number;
  onAddAttendance: (subjectCode: string, status: 'present' | 'absent') => void;
}

export const AttendanceManagerView: React.FC<AttendanceManagerViewProps> = ({
  subjects,
  overallAttendance,
  onAddAttendance
}) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.subjectCode || 'CS601');
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notification, setNotification] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAttendance(selectedSubject, status);
    setNotification(`Recorded ${status.toUpperCase()} for ${selectedSubject} on ${date}.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const isEligible = overallAttendance >= 75;

  const totalClassesSum = subjects.reduce((acc, s) => acc + (s.totalClasses || 0), 0);
  const presentClassesSum = subjects.reduce((acc, s) => acc + (s.attendedClasses || 0), 0);
  const absentClassesSum = Math.max(0, totalClassesSum - presentClassesSum);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>Attendance Manager & 75% Cutoff Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track exact counts of Present and Absent sessions across all lecture and laboratory hours.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          isEligible
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {isEligible ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{isEligible ? 'Examination Eligible (≥ 75%)' : 'Attendance Deficit Alert (< 75%)'}</span>
        </div>
      </div>

      {/* Aggregate Presence & Absence Summary Cards (Explicit Count) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Classes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Classes Held</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {totalClassesSum} <span className="text-xs font-medium text-slate-400">Hours</span>
          </div>
          <div className="text-[11px] text-slate-500">Across all {subjects.length} enrolled subjects</div>
        </div>

        {/* Card 2: Total Present */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span>Total Present</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {presentClassesSum} <span className="text-xs font-medium text-emerald-500">Classes</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 font-medium">Recorded in session registers</div>
        </div>

        {/* Card 3: Total Absent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-bold">
            <span>Total Absent</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
            {absentClassesSum} <span className="text-xs font-medium text-rose-500">Classes</span>
          </div>
          <div className="text-[11px] text-rose-600/80 font-medium">Leaves & missed sessions</div>
        </div>

        {/* Card 4: Aggregate Percentage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Aggregate %</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
            {overallAttendance}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full rounded-full ${overallAttendance >= 75 ? 'bg-blue-600' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, overallAttendance)}%` }}
            />
          </div>
        </div>

      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Log Daily Attendance Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Log Daily Attendance Status</span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map(subj => (
                <option key={subj.subjectCode} value={subj.subjectCode}>
                  {subj.subjectCode} – {subj.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lecture Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Attendance Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('present')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  status === 'present'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Present</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('absent')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  status === 'absent'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Absent</span>
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 pt-5">
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Record Entry
            </button>
          </div>
        </form>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject-Wise Attendance Ledger</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Showing exact breakdown of Present, Absent, and Safe Misses allowed per subject</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Mandatory Threshold: 75%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4 text-center">Present</th>
                <th className="py-3.5 px-4 text-center">Absent</th>
                <th className="py-3.5 px-4 text-center">Total</th>
                <th className="py-3.5 px-4 text-center">Attendance %</th>
                <th className="py-3.5 px-4 text-center">Eligibility</th>
                <th className="py-3.5 px-4 text-right">Safe Cushion / Remedial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map(subj => {
                const attended = subj.attendedClasses || 0;
                const total = subj.totalClasses || 0;
                const absent = Math.max(0, total - attended);
                const isSubjSafe = subj.attendancePercentage >= 75;

                // Calculate safe misses: (attended) / (total + x) >= 0.75  =>  x <= (attended / 0.75) - total
                const safeMisses = Math.max(0, Math.floor((attended / 0.75) - total));
                // If below 75%, how many consecutive classes to attend:
                const classesNeeded = !isSubjSafe ? Math.max(1, (3 * total) - (4 * attended)) : 0;

                return (
                  <tr key={subj.subjectCode} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{subj.subjectName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{subj.subjectCode} · {subj.facultyName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        <UserCheck className="w-3 h-3" />
                        {attended}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                        <UserX className="w-3 h-3" />
                        {absent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                      {total} hrs
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-mono font-bold text-sm ${isSubjSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {subj.attendancePercentage}%
                        </span>
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${isSubjSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, subj.attendancePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isSubjSafe
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {isSubjSafe ? 'Eligible' : `Need +${classesNeeded} Classes`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {isSubjSafe ? `${safeMisses} hours safe` : '0 hours (Immediate Attend)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
