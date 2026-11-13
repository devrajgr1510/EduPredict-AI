import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  Star, 
  Trophy, 
  Rocket, 
  Users, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  X,
  Mail,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { StudentAcademicRecord } from '../types/index.ts';

interface ReferenceDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  onSelectStudent?: (studentName: string) => void;
}

export const ReferenceDashboardView: React.FC<ReferenceDashboardViewProps> = ({
  onNavigateTab,
  onSelectStudent
}) => {
  const [selectedClass, setSelectedClass] = useState('Class A');
  const [selectedMonth, setSelectedMonth] = useState('April 2022');
  const [activeStudentModal, setActiveStudentModal] = useState<{
    name: string;
    gender: 'male' | 'female';
    avatarUrl: string;
    subjects: string;
    status: string;
    risk: string;
    score: number;
    attendance: number;
  } | null>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubject, setGroupSubject] = useState('Machine Learning Doubt Clearing');
  const [groupCreatedNotice, setGroupCreatedNotice] = useState(false);

  const handleOpenStudent = (
    name: string, 
    gender: 'male' | 'female', 
    avatarUrl: string, 
    subjects: string, 
    status: string, 
    risk: string,
    score: number,
    attendance: number
  ) => {
    setActiveStudentModal({
      name,
      gender,
      avatarUrl,
      subjects,
      status,
      risk,
      score,
      attendance
    });
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setGroupCreatedNotice(true);
    setTimeout(() => {
      setGroupCreatedNotice(false);
      setIsGroupModalOpen(false);
      setGroupName('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Bar: Dashboard Title & Class Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Dashboard
        </h1>

        <div className="relative">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-blue-600 dark:text-blue-400 font-extrabold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors">
            <span>{selectedClass}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns Matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Class Statistics + Struggling & Excelling) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CARD 1: Class Statistics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Class Statistics
              </h2>

              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <span>{selectedMonth}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Metrics with 3D-styled illustrations */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-1 text-center">
              
              {/* Total Students (Rocket) */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-100 via-orange-50 to-amber-100 dark:from-rose-950/50 dark:to-amber-950/40 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform">
                  {/* Stylized Rocket SVG */}
                  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                    <path d="M42 6C30 10 22 22 20 34L30 44C42 42 54 34 58 22C58 14 50 6 42 6Z" fill="#F87171" />
                    <circle cx="38" cy="22" r="5" fill="#FFFFFF" />
                    <circle cx="38" cy="22" r="2.5" fill="#3867F6" />
                    <path d="M20 34L12 40C10 42 10 46 12 48L16 52C18 54 22 54 24 52L30 44" fill="#FCA5A5" />
                    <path d="M12 52L6 58C5 59 7 61 8 60L16 54" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="48" cy="46" r="3" fill="#FBBF24" />
                    <circle cx="14" cy="20" r="2" fill="#FBBF24" />
                  </svg>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-3">
                  100
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Total Students
                </div>
              </div>

              {/* Struggling (Backpack walking) */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-100 via-blue-50 to-indigo-100 dark:from-sky-950/50 dark:to-indigo-950/40 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform">
                  {/* Stylized Student walking with backpack SVG */}
                  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                    <circle cx="32" cy="14" r="8" fill="#FDBA74" />
                    <path d="M28 22H36V36H28Z" fill="#3867F6" />
                    <rect x="22" y="24" width="8" height="12" rx="3" fill="#F97316" />
                    <path d="M26 36L22 54" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                    <path d="M34 36L38 54" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="32" cy="12" r="7" fill="#92400E" />
                    <circle cx="34" cy="14" r="5" fill="#FDBA74" />
                  </svg>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-3">
                  40
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Struggling
                </div>
              </div>

              {/* Excelling (Trophy/Flag winner) */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/50 dark:to-cyan-950/40 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform">
                  {/* Stylized Student holding trophy SVG */}
                  <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                    <circle cx="34" cy="14" r="8" fill="#FDBA74" />
                    <path d="M28 22H40V36H28Z" fill="#10B981" />
                    <path d="M22 18L18 10L14 18Z" fill="#F59E0B" />
                    <rect x="16" y="16" width="4" height="14" fill="#B45309" />
                    <path d="M30 36L28 54" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                    <path d="M38 36L42 54" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                    <path d="M22 48L46 54L34 58Z" fill="#34D399" />
                  </svg>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-3">
                  60
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Excelling
                </div>
              </div>

            </div>

            {/* Class Progress Sub-Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4 sm:gap-5">
              {/* A to Z 3D blocks icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex flex-col items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <span className="text-xs font-black tracking-widest uppercase">A to Z</span>
                <span className="text-[10px] opacity-80 font-mono">Blocks</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Class Progress</span>
                  <span className="font-semibold text-slate-500">30% of the progress</span>
                </div>

                {/* Blue progress bar */}
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '30%' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* CARD 2: Struggling & Excelling */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Struggling & Excelling
              </h2>

              <button 
                onClick={() => onNavigateTab('kmeans')}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom 3 Struggling Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                  !
                </span>
                <span>Bottom 3 Struggling</span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Wong Lee',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_wong_1794449958557.jpg',
                    subjects: 'Political Science, Math',
                    status: 'Lagging',
                    risk: 'High Risk',
                    score: 48,
                    attendance: 62
                  },
                  {
                    name: 'Sarah Nancy',
                    gender: 'female' as const,
                    avatarUrl: '/src/assets/images/avatar_female_student_emma_1794449959684.jpg',
                    subjects: 'Science, Biology',
                    status: 'Lagging',
                    risk: 'High Risk',
                    score: 52,
                    attendance: 64
                  },
                  {
                    name: 'Nate Gill',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_max_1794449957569.jpg',
                    subjects: 'Math, Biology',
                    status: 'Lagging',
                    risk: 'Moderate Risk',
                    score: 56,
                    attendance: 68
                  }
                ].map((st) => (
                  <div
                    key={st.name}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{st.name}</span>
                          <span className="text-[10px] font-normal text-slate-400 capitalize">({st.gender})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{st.subjects}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenStudent(st.name, st.gender, st.avatarUrl, st.subjects, st.status, st.risk, st.score, st.attendance)}
                      className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Excelling Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Top 3 Excelling</span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Post Malone',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_wong_1794449958557.jpg',
                    subjects: 'History, English',
                    status: 'Completed',
                    risk: 'Low Risk',
                    score: 94,
                    attendance: 96
                  },
                  {
                    name: 'Clara Garcia',
                    gender: 'female' as const,
                    avatarUrl: '/src/assets/images/avatar_female_student_clara_1794449960604.jpg',
                    subjects: 'Science, Hindi',
                    status: 'Ahead',
                    risk: 'Low Risk',
                    score: 91,
                    attendance: 93
                  },
                  {
                    name: 'Sarah Patel',
                    gender: 'female' as const,
                    avatarUrl: '/src/assets/images/avatar_student_sarah_1793977638044.jpg',
                    subjects: 'Computer Science, AI',
                    status: 'Completed',
                    risk: 'Low Risk',
                    score: 92,
                    attendance: 95
                  }
                ].map((st) => (
                  <div
                    key={st.name}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{st.name}</span>
                          <span className="text-[10px] font-normal text-slate-400 capitalize">({st.gender})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{st.subjects}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenStudent(st.name, st.gender, st.avatarUrl, st.subjects, st.status, st.risk, st.score, st.attendance)}
                      className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (Overall Class Performance + Performance Summary) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 3: Overall Class Performance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Overall Class Performance
              </h2>

              <button 
                onClick={() => onNavigateTab('analytics')}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Skill Proficiency
            </div>

            {/* Donut Chart & Legend Row */}
            <div className="flex items-center justify-between gap-4">
              
              {/* Segmented Donut Chart SVG */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Green segment: 50% (dasharray 157.08 157.08) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="14"
                    strokeDasharray="113.1 226.2"
                    strokeDashoffset="0"
                  />
                  {/* Pink/Red segment: 30% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#F43F5E"
                    strokeWidth="14"
                    strokeDasharray="67.86 226.2"
                    strokeDashoffset="-113.1"
                  />
                  {/* Cyan/Blue segment: 20% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#06B6D4"
                    strokeWidth="14"
                    strokeDasharray="45.24 226.2"
                    strokeDashoffset="-180.96"
                  />
                  {/* Orange segment: 10% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#F97316"
                    strokeWidth="14"
                    strokeDasharray="22.62 226.2"
                    strokeDashoffset="-226.2"
                  />
                </svg>

                {/* Inner percentage labels */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                    <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">50%</span>
                  </div>
                </div>
              </div>

              {/* 2x2 Legend */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Advanced</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    50%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Intermediate</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    30%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                    <span>Basic</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    10%
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                    <span>Proficient</span>
                  </div>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    20%
                  </div>
                </div>
              </div>

            </div>

            {/* Top Students Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Top Students
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Max Stem',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_max_1794449957569.jpg',
                    tier: 'Basic',
                    status: 'Lagging',
                    pillBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  },
                  {
                    name: 'Orville Nilo',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_wong_1794449958557.jpg',
                    tier: 'Intermediate',
                    status: 'On Track',
                    pillBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  },
                  {
                    name: 'Emma Garfield',
                    gender: 'female' as const,
                    avatarUrl: '/src/assets/images/avatar_female_student_emma_1794449959684.jpg',
                    tier: 'Proficient',
                    status: 'Ahead',
                    pillBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                  },
                  {
                    name: 'Nate Hems',
                    gender: 'male' as const,
                    avatarUrl: '/src/assets/images/avatar_male_student_max_1794449957569.jpg',
                    tier: 'Advanced',
                    status: 'Completed',
                    pillBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }
                ].map((st) => (
                  <div key={st.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatarUrl}
                        alt={st.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal capitalize">({st.gender})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{st.tier}</div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.pillBg}`}>
                      {st.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CARD 4: Performance Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Performance Summary
              </h2>

              <button 
                onClick={() => onNavigateTab('records')}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 transition-colors"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gauge and Trophy Row */}
            <div className="flex items-center justify-between gap-4 pt-1">
              
              {/* Semi-circle Gauge SVG */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-20 overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-36 h-20">
                    {/* Background Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="12"
                    />
                    {/* Green Segment 60% */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 75 16"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {/* Orange accent slice */}
                    <path
                      d="M 75 16 A 40 40 0 0 1 85 30"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="12"
                    />
                    {/* Pink accent slice */}
                    <path
                      d="M 85 30 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="12"
                    />
                  </svg>
                </div>
                <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  60%
                </div>
              </div>

              {/* Trophy and Average Proficiency */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100/70 dark:bg-amber-950/50 flex items-center justify-center p-2.5">
                  <Trophy className="w-8 h-8 text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Proficient
                  </div>
                  <div className="text-xs text-slate-500">
                    Average Proficiency
                  </div>
                </div>
              </div>

            </div>

            {/* 4 Bottom Metric Pills */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <div>
                <div className="text-xs font-bold text-orange-500">Lagging</div>
                <div className="text-[11px] text-slate-500 mt-0.5">20 Students/20%</div>
              </div>
              <div>
                <div className="text-xs font-bold text-rose-500">On Track</div>
                <div className="text-[11px] text-slate-500 mt-0.5">20 Students/20%</div>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600">Completed</div>
                <div className="text-[11px] text-slate-500 mt-0.5">60 Students/60%</div>
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-600">Ahead</div>
                <div className="text-[11px] text-slate-500 mt-0.5">20 Students/20%</div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* STUDENT DETAIL MODAL */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Profile Dossier
              </h3>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={activeStudentModal.avatarUrl}
                  alt={activeStudentModal.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                />
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {activeStudentModal.name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">Gender: {activeStudentModal.gender}</div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {activeStudentModal.subjects}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Predicted Marks</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {activeStudentModal.score}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Attendance Rate</span>
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {activeStudentModal.attendance}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Academic Risk Tier</span>
                  <span className={`font-bold ${
                    activeStudentModal.risk === 'Low Risk' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {activeStudentModal.risk}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cohort Status</span>
                  <span className="font-bold text-blue-600">
                    {activeStudentModal.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setActiveStudentModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveStudentModal(null);
                    onNavigateTab('twin');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Run Digital Twin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE STUDENT GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Create Student Study Group</span>
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupCreatedNotice ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Group Created!
                </h4>
                <p className="text-xs text-slate-500">
                  Invitations sent to 24 students in Class A for peer academic doubt-clearing and group study.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateGroup} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Group Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. CS601 Operating Systems Doubt Clearing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Subject / Scope
                  </label>
                  <input
                    type="text"
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <p className="leading-relaxed">
                    Students will receive automatic notices and live chat access with their classmates.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                  >
                    Confirm & Launch Group
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
