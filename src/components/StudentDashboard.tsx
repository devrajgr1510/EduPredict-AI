import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  FolderGit2, 
  FileCheck2, 
  Bot, 
  Network, 
  User as UserIcon, 
  Lightbulb, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown, 
  MessageSquare, 
  Sparkles, 
  Download,
  Menu,
  X,
  Edit3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Heart,
  Calendar,
  Briefcase,
  Award,
  BookMarked,
  ShieldCheck,
  Check,
  Plus
} from 'lucide-react';
import { 
  User, 
  StudentAcademicRecord, 
  DailyTask, 
  ProjectRecord, 
  CertificationRecord, 
  TimeTableSlot, 
  SubjectDetails,
  LiveTest,
  NotificationItem
} from '../types/index.ts';
import { LiveClock } from './LiveClock.tsx';
import { ReferenceDashboardView } from './ReferenceDashboardView.tsx';
import { AttendanceManagerView } from './AttendanceManagerView.tsx';
import { TimeTableView } from './TimeTableView.tsx';
import { DailyTasksView } from './DailyTasksView.tsx';
import { SubjectTrackerView } from './SubjectTrackerView.tsx';
import { ProjectsCertificationsView } from './ProjectsCertificationsView.tsx';
import { LiveTestsView } from './LiveTestsView.tsx';
import { DigitalTwinView } from './DigitalTwinView.tsx';
import { KMeansClusteringView } from './KMeansClusteringView.tsx';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TIMETABLE, 
  INITIAL_LIVE_TESTS, 
  INITIAL_NOTIFICATIONS, 
  AVATARS 
} from '../utils/sampleData.ts';
import { runPrediction } from '../utils/mlEngine.ts';

interface StudentDashboardProps {
  user: User;
  studentRecord: StudentAcademicRecord;
  onStudentUpdate?: (updated: StudentAcademicRecord) => void;
  onLogout: () => void;
  onOpenAiChat: () => void;
  onDownloadZip: () => void;
}

export type NavTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'timetable' 
  | 'tasks' 
  | 'subjects' 
  | 'predictions'
  | 'projects' 
  | 'tests' 
  | 'twin' 
  | 'kmeans' 
  | 'profile';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  studentRecord: initialRecord,
  onStudentUpdate,
  onLogout,
  onOpenAiChat,
  onDownloadZip
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [userProfile, setUserProfile] = useState<User>(user);
  const [studentRecord, setStudentRecord] = useState<StudentAcademicRecord>(initialRecord);
  const [timeTableSlots, setTimeTableSlots] = useState<TimeTableSlot[]>(INITIAL_TIMETABLE);
  const [liveTests, setLiveTests] = useState<LiveTest[]>(INITIAL_LIVE_TESTS);
  const [allStudents, setAllStudents] = useState<StudentAcademicRecord[]>(INITIAL_STUDENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSuccess, setGroupSuccess] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  React.useEffect(() => {
    setUserProfile(user);
    setStudentRecord(initialRecord);
  }, [user, initialRecord]);

  // Hydrate Student Dashboard state from Python SQLite backend
  React.useEffect(() => {
    let active = true;
    const studentKey = encodeURIComponent(initialRecord.studentId || user.id || 'usr-student-1');
    (async () => {
      try {
        const [studentRes, ttRes, testsRes, notifRes, studentsRes] = await Promise.all([
          fetch(`/api/students/${studentKey}`),
          fetch('/api/timetable'),
          fetch('/api/live-tests'),
          fetch('/api/notifications'),
          fetch('/api/students')
        ]);

        if (!active) return;

        if (studentRes.ok) {
          const stData = await studentRes.json();
          if (stData && stData.studentId) {
            setStudentRecord(stData);
          }
        }
        if (ttRes.ok) {
          const ttData = await ttRes.json();
          if (Array.isArray(ttData)) setTimeTableSlots(ttData);
        }
        if (testsRes.ok) {
          const testData = await testsRes.json();
          if (Array.isArray(testData)) setLiveTests(testData);
        }
        if (notifRes.ok) {
          const nData = await notifRes.json();
          if (Array.isArray(nData)) setNotifications(nData);
        }
        if (studentsRes.ok) {
          const allData = await studentsRes.json();
          if (Array.isArray(allData.students)) setAllStudents(allData.students);
        }
      } catch {
        // Offline / fallback seed retained
      }
    })();
    return () => {
      active = false;
    };
  }, [user.id, initialRecord.studentId]);

  // Bio-Data Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: studentRecord.studentName || userProfile.name,
    gender: (studentRecord.gender || userProfile.gender || 'female') as 'male' | 'female',
    srn: studentRecord.srn || userProfile.srn || 'CS2022-084',
    department: studentRecord.department || userProfile.department || 'Computer Science & Engineering',
    semester: studentRecord.semester || userProfile.semester || 6,
    dob: studentRecord.dob || '2004-06-18',
    bloodGroup: studentRecord.bloodGroup || 'B+',
    phone: studentRecord.phone || userProfile.phone || '+1 (555) 234-8901',
    address: studentRecord.address || '422 University Crescent, Cambridge, MA',
    guardianName: studentRecord.guardianName || 'Dr. Ramesh Patel',
    guardianPhone: studentRecord.guardianPhone || '+1 (555) 890-1234',
    careerGoal: studentRecord.careerGoal || 'AI Research Scientist & Distributed Systems Architect',
    bio: studentRecord.bio || 'Passionate about deep learning algorithms, explainable models, and scalable microservices architectures.'
  });

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const studentApiId = encodeURIComponent(studentRecord.studentId || studentRecord.id || 'usr-student-1');

  // Handle Profile Save with Gender photo synchronization persisted to Python SQLite
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const chosenAvatar = profileForm.gender === 'male' ? AVATARS.men.wongLee : AVATARS.women.sarahPatel;

    const payload = {
      studentName: profileForm.name,
      gender: profileForm.gender,
      avatarUrl: chosenAvatar,
      srn: profileForm.srn,
      semester: Number(profileForm.semester),
      department: profileForm.department,
      dob: profileForm.dob,
      bloodGroup: profileForm.bloodGroup,
      phone: profileForm.phone,
      address: profileForm.address,
      guardianName: profileForm.guardianName,
      guardianPhone: profileForm.guardianPhone,
      careerGoal: profileForm.careerGoal,
      bio: profileForm.bio
    };

    try {
      const res = await fetch(`/api/students/${studentApiId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudentRecord(data.student);
          onStudentUpdate?.(data.student);
          setUserProfile(prev => ({
            ...prev,
            name: data.student.studentName,
            gender: data.student.gender,
            srn: data.student.srn,
            department: data.student.department,
            semester: data.student.semester,
            avatarUrl: data.student.avatarUrl,
            phone: data.student.phone
          }));
          setIsProfileModalOpen(false);
          return;
        }
      }
    } catch {
      // fallback below
    }

    const updatedRecord: StudentAcademicRecord = {
      ...studentRecord,
      ...payload,
      name: profileForm.name
    };
    setStudentRecord(updatedRecord);
    onStudentUpdate?.(updatedRecord);
    setIsProfileModalOpen(false);
  };

  // Timetable Handlers (Python SQLite)
  const handleAddSlot = async (slot: TimeTableSlot) => {
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot)
      });
      if (res.ok) {
        const created = await res.json();
        setTimeTableSlots(prev => [created, ...prev]);
        return;
      }
    } catch {
      // fallback
    }
    setTimeTableSlots(prev => [slot, ...prev]);
  };

  const handleDeleteSlot = async (id: string) => {
    setTimeTableSlots(prev => prev.filter(s => s.id !== id));
    try {
      await fetch(`/api/timetable/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  // Subject Tracker Handlers (Python SQLite)
  const handleAddSubject = async (newSubject: SubjectDetails) => {
    try {
      const res = await fetch(`/api/students/${studentApiId}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudentRecord(data.student);
          onStudentUpdate?.(data.student);
          return;
        }
      }
    } catch {
      // fallback
    }
    setStudentRecord(prev => ({
      ...prev,
      subjectPerformance: [newSubject, ...prev.subjectPerformance]
    }));
  };

  const handleRemoveSubject = async (code: string) => {
    try {
      const res = await fetch(`/api/students/${studentApiId}/subjects/${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudentRecord(data.student);
          onStudentUpdate?.(data.student);
          return;
        }
      }
    } catch {
      // fallback
    }
    setStudentRecord(prev => ({
      ...prev,
      subjectPerformance: prev.subjectPerformance.filter(s => s.subjectCode !== code)
    }));
  };

  // Diagnostic Test Generator (Python SQLite)
  const handleGenerateAiTest = async () => {
    try {
      const res = await fetch('/api/live-tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentRecord.studentId })
      });
      if (res.ok) {
        const newTest = await res.json();
        setLiveTests(prev => [newTest, ...prev]);
        setActiveTab('tests');
        return;
      }
    } catch {
      // fallback below
    }
    const primarySubject = studentRecord.subjectPerformance[0] || {
      subjectCode: 'CS601',
      subjectName: 'Machine Learning & Neural Networks'
    };
    const fallbackTest: LiveTest = {
      id: `test-py-${Date.now()}`,
      subjectCode: primarySubject.subjectCode,
      subjectName: primarySubject.subjectName,
      title: `Personalized Revision Exam: ${primarySubject.subjectName}`,
      durationMinutes: 12,
      totalQuestions: 2,
      completed: false,
      questions: [
        {
          id: 'q-1',
          question: `What is the required minimum attendance threshold for semester examination eligibility?`,
          options: ['75% mandatory attendance', '50% attendance', '95% attendance only', '25% attendance'],
          correctIndex: 0,
          explanation: 'University regulations mandate a minimum 75% attendance cutoff.'
        },
        {
          id: 'q-2',
          question: 'How do continuous assessment marks (/50) factor into semester grades?',
          options: ['They carry direct weighting toward the final course score', 'They have 0% influence', 'Only labs count', 'Non-credit only'],
          correctIndex: 0,
          explanation: 'Continuous internal assessments contribute directly to final semester totals.'
        }
      ]
    };
    setLiveTests(prev => [fallbackTest, ...prev]);
    setActiveTab('tests');
  };

  // Attendance logging handler (Python SQLite)
  const handleAddAttendance = async (subjectCode: string, status: 'present' | 'absent') => {
    try {
      const res = await fetch(`/api/students/${studentApiId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectCode, status })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudentRecord(data.student);
          onStudentUpdate?.(data.student);
          return;
        }
      }
    } catch {
      // fallback
    }
    setStudentRecord((prev) => {
      const isPresent = status === 'present';
      const updatedSubjects = prev.subjectPerformance.map((subj) => {
        if (subj.subjectCode === subjectCode) {
          const newAttended = isPresent ? (subj.attendedClasses || 0) + 1 : (subj.attendedClasses || 0);
          const newTotal = (subj.totalClasses || 0) + 1;
          const newPercentage = Math.round((newAttended / newTotal) * 100);
          return { ...subj, attendedClasses: newAttended, totalClasses: newTotal, attendancePercentage: newPercentage };
        }
        return subj;
      });
      const avgAttendance = Math.round(updatedSubjects.reduce((acc, s) => acc + s.attendancePercentage, 0) / (updatedSubjects.length || 1));
      return { ...prev, attendancePercentage: avgAttendance, subjectPerformance: updatedSubjects };
    });
  };

  // Internal Marks out of 50 update handler (Python SQLite)
  const handleUpdateInternals = async (subjectCode: string, marks50: number) => {
    try {
      const res = await fetch(`/api/students/${studentApiId}/internals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectCode, internalMarksOutOf50: marks50 })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudentRecord(data.student);
          onStudentUpdate?.(data.student);
          return;
        }
      }
    } catch {
      // fallback
    }
    setStudentRecord((prev) => {
      const updatedSubjects = prev.subjectPerformance.map((subj) =>
        subj.subjectCode === subjectCode ? { ...subj, internalMarksOutOf50: marks50 } : subj
      );
      const avgInternals50 = Math.round(updatedSubjects.reduce((acc, s) => acc + s.internalMarksOutOf50, 0) / (updatedSubjects.length || 1));
      return { ...prev, internalAssessmentMarks: avgInternals50, subjectPerformance: updatedSubjects };
    });
  };

  // Daily Tasks Handlers (Python SQLite)
  const handleToggleTask = async (taskId: string) => {
    setStudentRecord((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted, completed: !t.isCompleted } : t
      )
    }));
    try {
      await fetch(`/api/tasks/${encodeURIComponent(taskId)}/toggle`, { method: 'PUT' });
    } catch {
      // ignore
    }
  };

  const handleAddTask = async (newTask: Omit<DailyTask, 'id' | 'isCompleted'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, studentId: studentRecord.studentId })
      });
      if (res.ok) {
        const created = await res.json();
        setStudentRecord((prev) => ({
          ...prev,
          dailyTasks: [created, ...prev.dailyTasks]
        }));
        return;
      }
    } catch {
      // fallback
    }
    const task: DailyTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      isCompleted: false,
      completed: false
    };
    setStudentRecord((prev) => ({ ...prev, dailyTasks: [task, ...prev.dailyTasks] }));
  };

  const handleDeleteTask = async (taskId: string) => {
    setStudentRecord((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t) => t.id !== taskId)
    }));
    try {
      await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  // Projects & Certifications Handlers (Python SQLite)
  const handleAddProject = async (newProj: Omit<ProjectRecord, 'id'>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProj, studentId: studentRecord.studentId })
      });
      if (res.ok) {
        const created = await res.json();
        setStudentRecord((prev) => ({ ...prev, projects: [created, ...prev.projects] }));
        return;
      }
    } catch {
      // fallback
    }
    setStudentRecord((prev) => ({
      ...prev,
      projects: [{ ...newProj, id: `proj-${Date.now()}` }, ...prev.projects]
    }));
  };

  const handleAddCertification = async (newCert: Omit<CertificationRecord, 'id'>) => {
    try {
      const res = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCert, studentId: studentRecord.studentId })
      });
      if (res.ok) {
        const created = await res.json();
        setStudentRecord((prev) => ({ ...prev, certifications: [created, ...prev.certifications] }));
        return;
      }
    } catch {
      // fallback
    }
    setStudentRecord((prev) => ({
      ...prev,
      certifications: [{ ...newCert, id: `cert-${Date.now()}` }, ...prev.certifications]
    }));
  };

  // Live Test Completion Handler (Python SQLite)
  const handleCompleteLiveTest = async (testId: string, score: number, _total: number) => {
    setLiveTests((prev) =>
      prev.map((t) =>
        t.id === testId
          ? { ...t, completed: true, userScore: score, lastAttemptedAt: new Date().toISOString() }
          : t
      )
    );
    try {
      await fetch(`/api/live-tests/${encodeURIComponent(testId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });
    } catch {
      // ignore
    }
  };

  // Notifications Handlers (Python SQLite)
  const markAllNotifsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
    } catch {
      // ignore
    }
  };

  const handleSelectNotification = async (notif: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsNotifOpen(false);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab as NavTab);
    }
    try {
      await fetch(`/api/notifications/${encodeURIComponent(notif.id)}/read`, { method: 'PUT' });
    } catch {
      // ignore
    }
  };

  // Performance Prediction & Tailored Suggestions
  const predictionResult = runPrediction({
    attendancePercentage: studentRecord.attendancePercentage,
    previousSemesterMarks: studentRecord.previousSemesterMarks || 82,
    internalAssessmentMarksOutOf50: studentRecord.internalAssessmentMarks || 44,
    studyHoursPerDay: studentRecord.studyHoursPerDay || 4.5,
    assignmentCompletionPercentage: studentRecord.assignmentCompletionPercentage || 90,
    backlogs: studentRecord.backlogs || 0,
    classParticipationPercentage: studentRecord.classParticipationPercentage || 85
  });

  const totalClassesCount = studentRecord.subjectPerformance.reduce((acc, s) => acc + (s.totalClasses || 0), 0);
  const presentClassesCount = studentRecord.subjectPerformance.reduce((acc, s) => acc + (s.attendedClasses || 0), 0);
  const absentClassesCount = Math.max(0, totalClassesCount - presentClassesCount);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as NavTab, label: 'Attendance Manager', icon: CalendarCheck, badge: `${studentRecord.attendancePercentage}%` },
    { id: 'timetable' as NavTab, label: 'Time Table', icon: Clock },
    { id: 'tasks' as NavTab, label: 'Daily Tasks & ToDo', icon: CheckSquare, badge: `${studentRecord.dailyTasks.filter(t => !t.completed).length}` },
    { id: 'subjects' as NavTab, label: 'Subject Tracker & Internals (/50)', icon: BookOpen },
    { id: 'predictions' as NavTab, label: 'Performance Predictions & Suggestions', icon: TrendingUp },
    { id: 'projects' as NavTab, label: 'Projects & Certifications', icon: FolderGit2 },
    { id: 'tests' as NavTab, label: 'Live Study Tests', icon: FileCheck2 },
    { id: 'twin' as NavTab, label: 'Digital Student Twin', icon: Bot, isNew: true },
    { id: 'kmeans' as NavTab, label: 'Student Clustering (K-Means)', icon: Network },
    { id: 'profile' as NavTab, label: 'My Profile & Bio-Data', icon: UserIcon },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[#F6F8FC] dark:bg-slate-950 text-[#101B35] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* SIDEBAR NAVIGATION (Matching image_8178b079.png) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 hidden lg:flex p-5">
        <div className="space-y-6">
          
          {/* Logo in Sidebar */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 text-xs font-black tracking-tight">
              EP
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                <span>Edu Predict</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Academic Portal</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                      Simulation
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CARD: STUDENT GROUP (Matching image_8178b079.png) */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-slate-850 dark:to-slate-900 border border-blue-100 dark:border-slate-800 text-center space-y-3 shadow-xs">
            {/* 3D Purple Speech Bubble with yellow dots */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 relative">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Group
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1 px-1">
                Create a student group and talk with them about their doubts, notices, etc
              </p>
            </div>

            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Create Group
            </button>
          </div>

          <div className="flex items-center justify-between text-xs px-2 pt-1">
            <button
              onClick={onOpenAiChat}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Voice AI Advisor</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        
        {/* TOP HEADER BAR (Matching image_8178b079.png) */}
        <header className="h-18 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          {/* Mobile hamburger & Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input from Image */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search for Students, Programs, Assignment..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right Header items: Live Date/Time, Notifications, User Profile */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            
            {/* Live Time and Date */}
            <div className="hidden md:block">
              <LiveClock />
            </div>

            {/* Notification Bell with alert dot and Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative cursor-pointer p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="View Academic Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {unreadNotifCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Functional Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Academic Notifications</span>
                      {unreadNotifCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                          {unreadNotifCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={markAllNotifsAsRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleSelectNotification(notif)}
                        className={`p-3 rounded-2xl cursor-pointer transition-colors border ${
                          notif.read
                            ? 'bg-slate-50/60 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-slate-900 dark:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-bold ${
                            notif.type === 'warning' ? 'text-amber-600' : notif.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Info matching image with instant Edit Profile modal */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
              title="Click to view and edit student bio-data profile"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {studentRecord.studentName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {userProfile.role === 'teacher' ? 'Faculty Instructor' : `Student · Sem ${studentRecord.semester}`}
                </div>
              </div>

              <img
                src={studentRecord.avatarUrl || AVATARS.women.sarahPatel}
                alt={studentRecord.studentName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>

          </div>
        </header>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && <span className="font-mono text-[10px]">{item.badge}</span>}
              </button>
            ))}
          </div>
        )}

        {/* MAIN BODY CONTENT ROUTER */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          
          {/* TAB 1: REFERENCE DASHBOARD (Matches image_8178b079.png) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Profile Summary Strip */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={studentRecord.avatarUrl}
                    alt={studentRecord.studentName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Welcome back, {studentRecord.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Roll No: {studentRecord.srn} · {studentRecord.department} (Semester {studentRecord.semester})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Bio-Data Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('predictions')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>View Performance Insights</span>
                  </button>
                </div>
              </div>

              {/* Exact Image-Matched Dashboard */}
              <ReferenceDashboardView
                onNavigateTab={(tab) => {
                  if (tab === 'kmeans') setActiveTab('kmeans');
                  else if (tab === 'twin') setActiveTab('twin');
                  else if (tab === 'records') setActiveTab('subjects');
                  else if (tab === 'analytics') setActiveTab('predictions');
                }}
                onSelectStudent={() => setActiveTab('profile')}
              />
            </div>
          )}

          {/* TAB 2: ATTENDANCE MANAGER (Shows number of Present and Absent) */}
          {activeTab === 'attendance' && (
            <AttendanceManagerView
              subjects={studentRecord.subjectPerformance}
              overallAttendance={studentRecord.attendancePercentage}
              onAddAttendance={handleAddAttendance}
            />
          )}

          {/* TAB 3: TIMETABLE (+ Icon to add new subjects/slots) */}
          {activeTab === 'timetable' && (
            <TimeTableView 
              slots={timeTableSlots} 
              onAddSlot={handleAddSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          )}

          {/* TAB 4: DAILY TASKS */}
          {activeTab === 'tasks' && (
            <DailyTasksView
              tasks={studentRecord.dailyTasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {/* TAB 5: SUBJECT TRACKER (+ Icon to add and remove subjects) */}
          {activeTab === 'subjects' && (
            <SubjectTrackerView
              subjects={studentRecord.subjectPerformance}
              onUpdateInternals={handleUpdateInternals}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
            />
          )}

          {/* TAB 6: PERFORMANCE PREDICTION, IA MARKS /50, ATTENDANCE, STUDY HRS, BACKLOGS & SUGGESTIONS */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <span>Academic Performance Prediction & Personalized Suggestions</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Integrated analysis of continuous internals (/50), attendance records, past CGPA, study hours, and backlog recovery.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Academic Status: {predictionResult.riskLevel}</span>
                </div>
              </div>

              {/* The 5 Key Academic Drivers Requested */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                {/* 1. Internal Assessment Avg Marks (/50) */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Continuous Internals</div>
                  <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                    {studentRecord.internalAssessmentMarks} <span className="text-xs font-normal text-slate-400">/ 50</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {Math.round(((studentRecord.internalAssessmentMarks || 44) / 50) * 100)}% Equivalent
                  </div>
                </div>

                {/* 2. Attendance % with exact Present and Absent */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Attendance Aggregate</div>
                  <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {studentRecord.attendancePercentage}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {presentClassesCount} Present · {absentClassesCount} Absent
                  </div>
                </div>

                {/* 3. Previous Semester CGPA */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Previous Sem CGPA</div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {studentRecord.currentCGPA}
                  </div>
                  <div className="text-[11px] text-slate-400">Scale 0 – 10.0</div>
                </div>

                {/* 4. Daily Study Hours */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Daily Study Hours</div>
                  <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                    {studentRecord.studyHoursPerDay} <span className="text-xs font-normal text-slate-400">hrs/day</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Consistent Routine</div>
                </div>

                {/* 5. Active Backlogs */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Active Backlogs</div>
                  <div className={`text-2xl font-black font-mono ${studentRecord.backlogs === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {studentRecord.backlogs}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {studentRecord.backlogs === 0 ? 'All Cleared' : 'Needs Remedial'}
                  </div>
                </div>

              </div>

              {/* Prediction Summary Output */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-400/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Intelligent Semester Projection</span>
                    </div>
                    <h3 className="text-2xl font-black mt-2">
                      Projected Outcome: {predictionResult.predictedMarks}% (Grade {predictionResult.predictedGrade})
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Estimated Semester CGPA: <span className="font-mono font-bold text-cyan-300">{predictionResult.predictedCGPA} / 10.0</span> with a {predictionResult.passProbability}% pass probability.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Confidence Band</span>
                    <div className="text-lg font-mono font-bold text-white">
                      {predictionResult.confidenceRange.min}% – {predictionResult.confidenceRange.max}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Tailored Suggestions to Improve Student Performance */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Actionable Recommendations for Academic Excellence
                      </h3>
                      <p className="text-xs text-slate-500">Personalized study advice based on your current grades, attendance, and internal scores</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictionResult.recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {rec.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{rec.estimatedImpactMarks} Marks Projected Boost
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rec.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                        {rec.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: PROJECTS & CERTIFICATIONS */}
          {activeTab === 'projects' && (
            <ProjectsCertificationsView
              projects={studentRecord.projects}
              certifications={studentRecord.certifications}
              onAddProject={handleAddProject}
              onAddCertification={handleAddCertification}
            />
          )}

          {/* TAB 8: LIVE STUDY TESTS */}
          {activeTab === 'tests' && (
            <LiveTestsView
              tests={liveTests}
              onCompleteTest={handleCompleteLiveTest}
              onGenerateAiTest={handleGenerateAiTest}
            />
          )}

          {/* TAB 9: DIGITAL TWIN */}
          {activeTab === 'twin' && (
            <DigitalTwinView studentRecord={studentRecord} />
          )}

          {/* TAB 10: K-MEANS */}
          {activeTab === 'kmeans' && (
            <KMeansClusteringView students={allStudents} />
          )}

          {/* TAB 11: MY PROFILE & COMPLETE BIO-DATA */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Top Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-5">
                  <img
                    src={studentRecord.avatarUrl}
                    alt={studentRecord.studentName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-600 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        {studentRecord.studentName}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 capitalize">
                        {studentRecord.gender} Student
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{userProfile.email}</p>
                    <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                      Roll No: {studentRecord.srn} · Semester {studentRecord.semester} {studentRecord.department}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Bio-Data</span>
                </button>
              </div>

              {/* Bio-Data Dossier Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Official Student Bio-Data & Academic Records
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Date of Birth</span>
                    </span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.dob || '2004-06-18'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Blood Group</span>
                    </span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.bloodGroup || 'B+'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Contact Phone</span>
                    </span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.phone || '+1 (555) 234-8901'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1 sm:col-span-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Residential Address</span>
                    </span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.address || '422 University Crescent, Cambridge, MA'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1">
                    <span className="text-slate-400 font-medium">Guardian Information</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.guardianName || 'Dr. Ramesh Patel'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {studentRecord.guardianPhone || '+1 (555) 890-1234'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1 sm:col-span-3">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                      <span>Career Aspiration & Focus</span>
                    </span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {studentRecord.careerGoal || 'AI Research Scientist & Distributed Systems Architect'}
                    </div>
                    <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                      {studentRecord.bio || 'Passionate about deep learning algorithms, explainable AI models, and scalable microservices architectures.'}
                    </p>
                  </div>
                </div>

                {/* Academic Metrics Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] text-slate-400">Current CGPA</div>
                    <div className="text-lg font-black font-mono text-slate-900 dark:text-white">{studentRecord.currentCGPA}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] text-slate-400">Predicted CGPA</div>
                    <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">{studentRecord.predictedCGPA}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] text-slate-400">Attendance</div>
                    <div className="text-lg font-black font-mono text-emerald-600">{studentRecord.attendancePercentage}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] text-slate-400">Internals Avg</div>
                    <div className="text-lg font-black font-mono text-purple-600">{studentRecord.internalAssessmentMarks} / 50</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-blue-600" />
                    <span>Print Academic Transcript</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* CREATE / EDIT STUDENT PROFILE & BIO-DATA MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create & Update Student Profile
                  </h3>
                  <p className="text-xs text-slate-500">Configure student bio-data and choose male/female avatar</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Photo Preview & Gender Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-5">
                <img
                  src={profileForm.gender === 'male' ? AVATARS.men.wongLee : AVATARS.women.sarahPatel}
                  alt="Student Avatar Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                />
                <div className="space-y-1.5 flex-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Student Gender (Changes Photo)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, gender: 'female' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        profileForm.gender === 'female'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Female Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, gender: 'male' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        profileForm.gender === 'male'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Male Student
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio-Data Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Roll No / SRN</label>
                  <input
                    type="text"
                    required
                    value={profileForm.srn}
                    onChange={(e) => setProfileForm({ ...profileForm, srn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    required
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={profileForm.semester}
                    onChange={(e) => setProfileForm({ ...profileForm, semester: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Blood Group</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Residential Address</label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.guardianName}
                    onChange={(e) => setProfileForm({ ...profileForm, guardianName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Guardian Contact</label>
                  <input
                    type="text"
                    required
                    value={profileForm.guardianPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, guardianPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Career Goals & Aspirations</label>
                <input
                  type="text"
                  required
                  value={profileForm.careerGoal}
                  onChange={(e) => setProfileForm({ ...profileForm, careerGoal: e.target.value })}
                  placeholder="e.g. AI Research Scientist & Cloud Architect"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Short Bio</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Profile & Bio-Data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE STUDENT GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Launch Class Student Group
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Group Successfully Activated!</div>
                <div className="text-xs text-slate-500">All 100 students in Class A have received an invite to join.</div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  Organize peer study sessions, share timetable notices, and clear academic doubts together.
                </p>
                <div>
                  <label className="block font-semibold mb-1">Group Name</label>
                  <input
                    type="text"
                    defaultValue="Class A – Academic Collaboration & Doubt Clearing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <button
                  onClick={() => {
                    setGroupSuccess(true);
                    setTimeout(() => {
                      setGroupSuccess(false);
                      setIsGroupModalOpen(false);
                    }, 2000);
                  }}
                  className="w-full py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Create & Notify Class
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
