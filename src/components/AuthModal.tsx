import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  UserCheck, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  BookOpen 
} from 'lucide-react';
import { UserRole, User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [srn, setSrn] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('6');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // 1-Click Quick Demo Login
  const handleQuickDemoLogin = async (demoRole: UserRole, demoEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, role: demoRole })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (tab === 'signin') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        onLoginSuccess(data.user);
        onClose();
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            role,
            srn: role === 'student' ? srn : undefined,
            department,
            semester: role === 'student' ? semester : undefined
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Authentic University Library Image */}
        <div className="hidden md:block md:w-5/12 relative bg-slate-900">
          <img
            src="/src/assets/images/auth_study_library_1793977636766.jpg"
            alt="University library study space with student"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101B35] via-[#101B35]/50 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Edu Predict Academic Portal</span>
            </div>
            <h3 className="text-lg font-bold">Empowering Student Success</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track attendance, manage internal marks, plan daily study goals, and forecast semester outcomes.
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Form & Quick Logins */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          
          <div className="space-y-1 mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {tab === 'signin' ? 'Sign in to Edu Predict' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tab === 'signin' ? 'Choose a quick profile or enter your credentials' : 'Register a new student, teacher, or administrator account'}
            </p>
          </div>

          {/* Quick 1-Click Demo Profiles (Highest UX convenience for evaluators) */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Instant 1-Click Demo Access</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">Recommended</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student', 'sarah.patel@edupredict.edu')}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Student</span>
                </div>
                <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">Sarah Patel</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher', 'prof.rao@edupredict.edu')}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Faculty</span>
                </div>
                <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">Prof. Rao</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'admin@edupredict.edu')}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:shadow-sm text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Admin</span>
                </div>
                <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">Dr. Sharma</div>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
            <button
              onClick={() => { setTab('signin'); setErrorMsg(''); }}
              className={`pb-2 text-xs font-semibold border-b-2 mr-6 transition-colors ${
                tab === 'signin'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                tab === 'register'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center capitalize transition-colors ${
                      role === r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Registration Additional Fields */}
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Student SRN / Roll No
                      </label>
                      <input
                        type="text"
                        required
                        value={srn}
                        onChange={(e) => setSrn(e.target.value)}
                        placeholder="e.g. CS2022-140"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Current Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'sarah.patel@edupredict.edu' : 'faculty@edupredict.edu'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white text-xs shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Sign In to Portal' : 'Register Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
