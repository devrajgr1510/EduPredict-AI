import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Eye, 
  FileSpreadsheet, 
  BookOpen, 
  TrendingUp, 
  Printer, 
  X,
  Mail,
  ChevronDown
} from 'lucide-react';
import { User, StudentAcademicRecord, PredictionResult } from '../types/index.ts';
import { runPrediction } from '../utils/mlEngine.ts';
import { ReferenceDashboardView } from './ReferenceDashboardView.tsx';
import { KMeansClusteringView } from './KMeansClusteringView.tsx';

interface TeacherDashboardProps {
  user: User;
  students: StudentAcademicRecord[];
  onLogout: () => void;
  onDownloadZip: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  students: initialStudents,
  onLogout,
  onDownloadZip
}) => {
  const [students, setStudents] = useState<StudentAcademicRecord[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Low Risk' | 'Moderate Risk' | 'High Risk'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentAcademicRecord | null>(null);
  const [modalPrediction, setModalPrediction] = useState<PredictionResult | null>(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.srn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Analytics Metrics
  const totalStudents = students.length;
  const highRiskCount = students.filter(s => s.riskLevel === 'High Risk').length;
  const moderateRiskCount = students.filter(s => s.riskLevel === 'Moderate Risk').length;
  const avgAttendance = Math.round(students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (totalStudents || 1));
  const avgMarks = Math.round(students.reduce((acc, s) => acc + (s.finalMarks || 70), 0) / (totalStudents || 1) * 10) / 10;

  const handleOpenStudentModal = async (student: StudentAcademicRecord) => {
    setSelectedStudent(student);
    const inputPayload = {
      attendancePercentage: student.attendancePercentage,
      previousSemesterMarks: student.previousSemesterMarks,
      internalAssessmentMarksOutOf50: student.internalAssessmentMarks,
      studyHoursPerDay: student.studyHoursPerDay,
      assignmentCompletionPercentage: student.assignmentCompletionPercentage,
      backlogs: student.backlogs,
      classParticipationPercentage: student.classParticipationPercentage
    };
    const fallbackPred = runPrediction(inputPayload, student.studentName, student.srn);
    setModalPrediction(fallbackPred);
    setInterventionNote('');
    setNoteSaved(false);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputPayload,
          studentName: student.studentName,
          srn: student.srn,
          studentId: student.studentId
        })
      });
      if (res.ok) {
        const pyPred = await res.json();
        setModalPrediction(pyPred);
      }
    } catch {
      // Fallback already shown
    }
  };

  const handleExportCSV = () => {
    const headers = 'SRN,Student Name,Semester,Attendance %,Internal Marks,Predicted Final Marks,Risk Level,Backlogs\n';
    const rows = filteredStudents.map(s => 
      `${s.srn},"${s.studentName}",${s.semester},${s.attendancePercentage},${s.internalAssessmentMarks},${s.finalMarks || 70},${s.riskLevel || 'Low Risk'},${s.backlogs}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPredict_Faculty_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNote = () => {
    if (!interventionNote.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'kmeans' | 'timetable'>('overview');

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Banner with Teacher Identification */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl || '/src/assets/images/avatar_professor_rao_1793977640301.jpg'}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs text-slate-500">Faculty Advisory Portal / Semester 6 CSE · Class A</div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {user.name}
            </h1>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Class Dashboard
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'roster'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Student Roster ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('kmeans')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'kmeans'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              K-Means Clusters
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <ReferenceDashboardView
          onNavigateTab={(tab) => {
            if (tab === 'kmeans') setActiveTab('kmeans');
            else if (tab === 'records') setActiveTab('roster');
          }}
          onSelectStudent={() => setActiveTab('roster')}
        />
      )}

      {activeTab === 'kmeans' && (
        <KMeansClusteringView
          students={students}
          onSelectStudent={() => setActiveTab('roster')}
        />
      )}

      {activeTab === 'roster' && (
        <div className="space-y-6">

      {/* 4 Quantitative KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Assigned Students</div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            {totalStudents}
          </div>
          <div className="text-[11px] text-slate-500">Semester 6 CSE Cohort</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">High Academic Risk Flags</div>
          <div className="text-2xl font-black font-mono text-rose-600 tabular-nums">
            {highRiskCount}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">Require mentor intervention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Moderate Risk Students</div>
          <div className="text-2xl font-black font-mono text-amber-600 tabular-nums">
            {moderateRiskCount}
          </div>
          <div className="text-[11px] text-slate-500">Attendance or test margin deficit</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Cohort Average Marks</div>
          <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {avgMarks}%
          </div>
          <div className="text-[11px] text-slate-500">Cohort Attendance: {avgAttendance}%</div>
        </div>
      </div>

      {/* Roster Table with Search and Risk Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
        
        {/* Controls: Search and Segmented Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name or SRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            {(['all', 'High Risk', 'Moderate Risk', 'Low Risk'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                  riskFilter === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Students' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">SRN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Attendance</th>
                <th className="py-3 px-4 text-right">Internal Marks</th>
                <th className="py-3 px-4 text-center">Backlogs</th>
                <th className="py-3 px-4 text-right">Predicted Marks</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{s.srn}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s.studentName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-bold ${s.attendancePercentage < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {s.attendancePercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{s.internalAssessmentMarks}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-bold ${s.backlogs > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {s.backlogs}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {s.finalMarks || 72}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.riskLevel === 'Low Risk'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : s.riskLevel === 'Moderate Risk'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {s.riskLevel || 'Low Risk'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenStudentModal(s)}
                      className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-[11px] transition-colors"
                    >
                      View & Predict
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    )}

      {/* Student Detail Modal */}
      {selectedStudent && modalPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedStudent(null)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-xs font-mono text-slate-500">{selectedStudent.srn} · Semester 6 CSE</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.studentName}</h2>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Predicted Marks</span>
                <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {modalPrediction.predictedMarks}% ({modalPrediction.predictedGrade})
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Risk Level</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {modalPrediction.riskLevel}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400">Model Confidence</span>
                <div className="text-xl font-bold font-mono text-cyan-500">
                  {modalPrediction.confidenceScore}%
                </div>
              </div>
            </div>

            {/* Performance Factors for this student */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Key Academic Impact Factors
              </h4>
              <div className="space-y-1.5">
                {modalPrediction.shapContributions.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-700 dark:text-slate-300">{c.label} ({c.value})</span>
                    <span className={`font-mono font-bold ${c.impact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {c.impact >= 0 ? `+${c.impact}` : c.impact} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Intervention Note */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Faculty Academic Intervention Note
              </label>
              <textarea
                rows={3}
                value={interventionNote}
                onChange={(e) => setInterventionNote(e.target.value)}
                placeholder="Log academic counselling notes, remedial session assignments, or mentor recommendations for this student..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between items-center">
                {noteSaved ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Note saved to student record
                  </span>
                ) : <span />}
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                >
                  Save Intervention Note
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
