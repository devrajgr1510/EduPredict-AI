import React from 'react';
import { 
  GraduationCap, 
  LogOut, 
  LayoutDashboard, 
  Sun, 
  Moon,
  Sparkles,
  Bell,
  Compass,
  CalendarDays,
  Users2
} from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'student' | 'teacher' | 'admin') => void;
  currentView: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigate,
  currentView,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 py-2.5 sm:py-3">
        
        {/* Brand Wordmark matching reference design */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-hidden shrink-0"
          aria-label="Edu Predict Home"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              <span>Edu</span>
              <span className="text-blue-600 dark:text-cyan-400">Predict</span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 tracking-wider">
                Student
              </span>
            </span>
          </div>
        </button>

        {/* Humanoid Navigation Links (No ML/Python/Codebase artifacts) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors flex items-center gap-1.5 ${
              currentView === 'landing' 
                ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>Campus Home</span>
          </button>

          <a
            href="#academic-pillars"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('academic-pillars')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Academic Features
          </a>

          <a
            href="#student-journey"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('student-journey')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <span>Semester Journey</span>
          </a>

          <a
            href="#community-stories"
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('community-stories')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Users2 className="w-4 h-4 text-purple-500" />
            <span>Student Stories</span>
          </a>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Notifications Indicator */}
          <button
            onClick={() => onNavigate('student')}
            aria-label="View notifications"
            className="hidden sm:inline-flex relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={() => {
                  if (currentUser.role === 'admin') onNavigate('admin');
                  else if (currentUser.role === 'teacher') onNavigate('teacher');
                  else onNavigate('student');
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">
                  {currentUser.role === 'admin' ? 'Faculty Admin' : currentUser.role === 'teacher' ? 'Faculty Console' : 'My Dashboard'}
                </span>
                <span className="sm:hidden">Portal</span>
              </button>

              <button 
                onClick={() => onNavigate('student')}
                className="flex items-center gap-2 p-0.5 sm:p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500/30 transition-all shrink-0"
                aria-label="Student Account Menu"
              >
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign out"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/25"
              >
                Student Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
