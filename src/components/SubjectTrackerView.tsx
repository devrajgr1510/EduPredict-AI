import React, { useState } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Save, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Calculator,
  User,
  MapPin,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { SubjectDetails } from '../types/index.ts';

interface SubjectTrackerViewProps {
  subjects: SubjectDetails[];
  onUpdateInternals: (subjectCode: string, marks50: number) => void;
  onAddSubject?: (subject: SubjectDetails) => void;
  onRemoveSubject?: (subjectCode: string) => void;
}

export const SubjectTrackerView: React.FC<SubjectTrackerViewProps> = ({
  subjects,
  onUpdateInternals,
  onAddSubject,
  onRemoveSubject
}) => {
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(35);
  const [saveNotice, setSaveNotice] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSubj, setNewSubj] = useState({
    subjectCode: 'CS606',
    subjectName: 'Big Data Analytics',
    credits: 4,
    internalMarksOutOf50: 42,
    totalClasses: 30,
    attendedClasses: 27,
    facultyName: 'Dr. Vikramaditya',
    room: 'Hall 402'
  });

  const handleStartEdit = (subj: SubjectDetails) => {
    setEditingCode(subj.subjectCode);
    setEditValue(subj.internalMarksOutOf50);
  };

  const handleSave = (code: string) => {
    onUpdateInternals(code, editValue);
    setEditingCode(null);
    setSaveNotice(`Updated internal marks for ${code} to ${editValue}/50`);
    setTimeout(() => setSaveNotice(''), 3500);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSubject) {
      const attendancePercentage = Math.round((newSubj.attendedClasses / (newSubj.totalClasses || 1)) * 100);
      const marks100 = Math.round((newSubj.internalMarksOutOf50 / 50) * 100);
      let grade = 'B';
      if (marks100 >= 90) grade = 'A+';
      else if (marks100 >= 80) grade = 'A';
      else if (marks100 >= 70) grade = 'B';
      else if (marks100 >= 60) grade = 'C';
      else if (marks100 >= 50) grade = 'D';
      else grade = 'F';

      const fullSubj: SubjectDetails = {
        subjectCode: newSubj.subjectCode.toUpperCase(),
        subjectName: newSubj.subjectName,
        credits: Number(newSubj.credits),
        internalMarksOutOf50: Number(newSubj.internalMarksOutOf50),
        attendancePercentage,
        totalClasses: Number(newSubj.totalClasses),
        attendedClasses: Number(newSubj.attendedClasses),
        assignmentsCompleted: 3,
        totalAssignments: 4,
        predictedMarks: marks100,
        marks: marks100,
        predictedGrade: grade,
        grade,
        facultyName: newSubj.facultyName,
        room: newSubj.room
      };
      onAddSubject(fullSubj);
      setSaveNotice(`Enrolled new subject ${newSubj.subjectCode} successfully!`);
      setTimeout(() => setSaveNotice(''), 3500);
    }
    setIsAddModalOpen(false);
  };

  const avgInternals50 = Math.round(
    subjects.reduce((a, s) => a + s.internalMarksOutOf50, 0) / (subjects.length || 1) * 10
  ) / 10;

  const totalCredits = subjects.reduce((a, s) => a + s.credits, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Subject-Wise Tracker & Internal Marks (/50)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered subjects, adjust continuous assessment marks out of 50, and track course credits.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Average Internals</div>
            <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              {avgInternals50} / 50 <span className="text-xs text-slate-400">({Math.round((avgInternals50 / 50) * 100)}%)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Total Credits</div>
            <div className="text-xl font-black font-mono text-slate-800 dark:text-slate-200">
              {totalCredits} Credits
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {subjects.map(subj => {
          const isEditing = editingCode === subj.subjectCode;
          const marksPct = Math.round((subj.internalMarksOutOf50 / 50) * 100);

          return (
            <div
              key={subj.subjectCode}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 hover:border-blue-400 transition-all relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {subj.subjectCode} · {subj.credits} Credits
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {subj.subjectName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    Grade {subj.predictedGrade}
                  </span>

                  {onRemoveSubject && (
                    <button
                      onClick={() => onRemoveSubject(subj.subjectCode)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all cursor-pointer"
                      title={`Remove ${subj.subjectCode}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Marks out of 50 Editor */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                    <span>Continuous Internal Assessment (CIA / 50)</span>
                  </span>

                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(subj)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Adjust Marks</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSave(subj.subjectCode)}
                      className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 w-16 text-right">
                      {editValue} / 50
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {subj.internalMarksOutOf50} <span className="text-xs text-slate-400 font-normal">/ 50</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{marksPct}%</span>
                      <div className="text-[10px] text-slate-400">Equivalent Scale</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Attendance & Meta Strip */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div>
                  <span className="text-slate-400 text-[11px]">Attendance Ledger</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {subj.attendancePercentage}% ({subj.attendedClasses}/{subj.totalClasses} classes)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Assignments</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {subj.assignmentsCompleted} / {subj.totalAssignments} Submitted
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <User className="w-3.5 h-3.5" />
                  <span>{subj.facultyName}</span>
                  <span className="text-slate-300">·</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{subj.room}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD NEW SUBJECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Enroll New Subject</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubj.subjectCode}
                    onChange={(e) => setNewSubj({ ...newSubj, subjectCode: e.target.value })}
                    placeholder="e.g. CS606"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubj.subjectName}
                    onChange={(e) => setNewSubj({ ...newSubj, subjectName: e.target.value })}
                    placeholder="e.g. Big Data Analytics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={newSubj.credits}
                    onChange={(e) => setNewSubj({ ...newSubj, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Internals (/50)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={newSubj.internalMarksOutOf50}
                    onChange={(e) => setNewSubj({ ...newSubj, internalMarksOutOf50: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classes Attended (Present)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newSubj.attendedClasses}
                    onChange={(e) => setNewSubj({ ...newSubj, attendedClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSubj.totalClasses}
                    onChange={(e) => setNewSubj({ ...newSubj, totalClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Name</label>
                  <input
                    type="text"
                    required
                    value={newSubj.facultyName}
                    onChange={(e) => setNewSubj({ ...newSubj, facultyName: e.target.value })}
                    placeholder="e.g. Dr. Vikramaditya"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    required
                    value={newSubj.room}
                    onChange={(e) => setNewSubj({ ...newSubj, room: e.target.value })}
                    placeholder="e.g. Hall 402"
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
                  Enroll Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
