import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AiChatbotModal } from './components/AiChatbotModal.tsx';
import { User, StudentAcademicRecord } from './types/index.ts';
import { INITIAL_USERS, INITIAL_STUDENTS } from './utils/sampleData.ts';
import { generateEduPredictZip } from './utils/zipGenerator.ts';

export default function App() {
  // Pre-seed with Sarah Patel (Student) for immediate exploration, hydrated from Python SQLite backend
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [currentView, setCurrentView] = useState<'landing' | 'student' | 'teacher' | 'admin'>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [students, setStudents] = useState<StudentAcademicRecord[]>(INITIAL_STUDENTS);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Dark mode management
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Hydrate students & current user from Python SQLite backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.students) && data.students.length > 0) {
            setStudents(data.students);
          }
        }
      } catch {
        // Initial fallback seed remains available during offline dev
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Switch views when user logs in via Python /api/auth/login or /register
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.students) && data.students.length > 0) {
          setStudents(data.students);
        }
      }
    } catch {
      // ignore
    }
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'teacher') {
      setCurrentView('teacher');
    } else {
      setCurrentView('student');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleStudentUpdate = (updated: StudentAcademicRecord) => {
    setStudents(prev => {
      const idx = prev.findIndex(s => s.studentId === updated.studentId || s.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
    if (currentUser && (currentUser.id === updated.studentId || currentUser.srn === updated.srn)) {
      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              name: updated.studentName,
              gender: updated.gender,
              avatarUrl: updated.avatarUrl,
              srn: updated.srn,
              department: updated.department,
              semester: updated.semester,
              phone: updated.phone
            }
          : prev
      );
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      const blob = await generateEduPredictZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'EduPredict-Academic-Records.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate project zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Active student record for current student user
  const activeStudentRecord = (currentUser && currentUser.role === 'student')
    ? (students.find(s => s.studentId === currentUser.id || s.srn === currentUser.srn) || students[0])
    : students[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FC] dark:bg-slate-950 text-[#101B35] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigate={(view) => setCurrentView(view)}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {currentView === 'student' && (
          <StudentDashboard
            user={currentUser && currentUser.role === 'student' ? currentUser : INITIAL_USERS[0]}
            studentRecord={activeStudentRecord}
            onStudentUpdate={handleStudentUpdate}
            onLogout={handleLogout}
            onOpenAiChat={() => setIsAiChatOpen(true)}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard
            user={currentUser && currentUser.role === 'teacher' ? currentUser : INITIAL_USERS[1]}
            students={students}
            onLogout={handleLogout}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            user={currentUser && currentUser.role === 'admin' ? currentUser : INITIAL_USERS[2]}
            onLogout={handleLogout}
            onDownloadZip={handleDownloadZip}
          />
        )}
      </div>

      {/* Split-Screen Authentication Dialog */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* AI Academic Advisor Chatbot Modal */}
      <AiChatbotModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        studentContext={activeStudentRecord}
      />

    </div>
  );
}
