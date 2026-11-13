import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckSquare, 
  Calendar, 
  GraduationCap, 
  Award, 
  HeartHandshake, 
  Compass, 
  Quote,
  Target
} from 'lucide-react';
import { runPrediction } from '../utils/mlEngine.ts';
import { PredictionInput, PredictionResult } from '../types/index.ts';

interface LandingPageProps {
  onOpenAuth: () => void;
  onNavigate: (view: 'landing' | 'student' | 'teacher' | 'admin') => void;
  onDownloadZip: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onNavigate
}) => {
  // Interactive Live Semester Progress Estimator State
  const [demoInput, setDemoInput] = useState<PredictionInput>({
    attendancePercentage: 84,
    previousSemesterMarks: 78,
    internalAssessmentMarksOutOf50: 39,
    studyHoursPerDay: 3.5,
    assignmentCompletionPercentage: 92,
    backlogs: 0,
    classParticipationPercentage: 85
  });

  const [demoResult, setDemoResult] = useState<PredictionResult | null>(() => {
    return runPrediction({
      attendancePercentage: 84,
      previousSemesterMarks: 78,
      internalAssessmentMarksOutOf50: 39,
      studyHoursPerDay: 3.5,
      assignmentCompletionPercentage: 92,
      backlogs: 0,
      classParticipationPercentage: 85
    });
  });

  const [isCalculating, setIsCalculating] = useState(false);

  const handlePredict = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: demoInput })
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResult(data);
        return;
      }
    } catch {
      // Fallback to deterministic computation
    } finally {
      setIsCalculating(false);
    }
    const res = runPrediction(demoInput);
    setDemoResult(res);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Hero Section: Human-crafted, Warm, Campus Experience */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D182E] via-[#132247] to-[#1E3A8A] text-white py-16 sm:py-24">
        {/* Campus Atmosphere Photographic Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_campus_analytics_1793977635117.jpg"
            alt="University students studying collaboratively on campus"
            className="w-full h-full object-cover object-center opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D182E] via-[#0D182E]/90 to-[#172554]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Human Student Story & Invitation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <span>Semester 2026 Academic Companion</span>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span className="text-slate-200">Continuous Assessment & Study Mentorship</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
                Master Your Semester with <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Confidence</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal">
                Never fall behind on attendance or surprise exams again. Edu Predict connects your day-to-day lectures, internal marks out of 50, interactive timetable, and peer study groups into one empowering student portal.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('student')}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 transform active:scale-95"
                >
                  <span>Open Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all flex items-center gap-2 backdrop-blur-xs"
                >
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>Student Sign In</span>
                </button>
              </div>

              {/* Trust Badges - Human, authentic university credentials */}
              <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>75% Minimum Attendance Safeguard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  <span>Continuous 50-Mark Assessment Tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-300" />
                  <span>Peer Study Doubts & Mentorship</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Semester Progress Estimator Widget */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Semester Progress Estimator</span>
                    </h2>
                    <p className="text-xs text-slate-400">Simulate attendance and test scores to see projected grade</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    Live Calculator
                  </span>
                </div>

                <div className="space-y-4 py-4 text-xs">
                  {/* Slider 1: Attendance */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Current Attendance</span>
                      </span>
                      <span className={`font-mono font-bold ${demoInput.attendancePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {demoInput.attendancePercentage}% {demoInput.attendancePercentage >= 75 ? '(Safe)' : '(At Risk)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="100"
                      value={demoInput.attendancePercentage}
                      onChange={(e) => setDemoInput({ ...demoInput, attendancePercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Slider 2: Internal Assessment Marks (/50) */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Internal Assessment Score</span>
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">{demoInput.internalAssessmentMarksOutOf50} / 50</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="50"
                      value={demoInput.internalAssessmentMarksOutOf50}
                      onChange={(e) => setDemoInput({ ...demoInput, internalAssessmentMarksOutOf50: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Grid for Study Hours & Backlogs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Daily Study Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={demoInput.studyHoursPerDay}
                        onChange={(e) => setDemoInput({ ...demoInput, studyHoursPerDay: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Backlogs / Carryovers</label>
                      <input
                        type="number"
                        min="0"
                        max="6"
                        value={demoInput.backlogs}
                        onChange={(e) => setDemoInput({ ...demoInput, backlogs: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Calculate Projection Button */}
                  <button
                    onClick={handlePredict}
                    disabled={isCalculating}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isCalculating ? 'Calculating...' : 'Calculate Semester Projection'}</span>
                  </button>
                </div>

                {/* Projection Output Card */}
                {demoResult && (
                  <div className="mt-2 p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">Projected Final Grade</div>
                        <div className="text-2xl font-black font-mono text-white flex items-baseline gap-2">
                          <span>{demoResult.predictedMarks}%</span>
                          <span className="text-sm font-bold text-cyan-400">Grade {demoResult.predictedGrade}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide">Academic Standing</div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          demoResult.riskLevel === 'Low Risk'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : demoResult.riskLevel === 'Moderate Risk'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}>
                          {demoResult.riskLevel === 'Low Risk' ? 'Dean\'s Honor Track' : demoResult.riskLevel === 'Moderate Risk' ? 'Needs Routine Review' : 'Critical Catch-up Needed'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
                      <div className="font-semibold text-cyan-300 mb-1">Tailored Student Action:</div>
                      <p className="leading-relaxed text-slate-300">
                        {demoResult.recommendations?.[0]?.description || 'Keep regular attendance and attend your peer study circle twice weekly.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Human-Centered 4-Pillar Vitality Metrics */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-cyan-400">75% Safeguard</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Attendance Buffer</div>
              <p className="text-xs text-slate-500">Live tracker prevents end-term exam debarment</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">50 Marks</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Continuous Assessment</div>
              <p className="text-xs text-slate-500">Track mid-terms, labs & assignments out of 50</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">6 Core Courses</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Subject-wise Mastery</div>
              <p className="text-xs text-slate-500">Add custom subjects, professors & timetable slots</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">Zero Surprises</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Personalized Guidance</div>
              <p className="text-xs text-slate-500">Timely gentle nudges before exam deadlines</p>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Centered Academic Pillars Grid */}
      <section id="academic-pillars" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Designed For Real College Life
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Succeed Each Semester
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built by educators and students who know the stress of exam weeks, surprise attendance roll-calls, and balancing lab deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1: Attendance Ledger */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Attendance Ledger with Present & Absent Counts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log every class session. Automatically tracks exact days present versus absent, so you know exactly how many lectures you can miss without dropping below 75%.
              </p>
              <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>One-tap Present/Absent marking</span>
              </div>
            </div>

            {/* Pillar 2: CIA /50 Tracker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Continuous Internal Assessment (/50)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Never wait for final transcripts. Monitor individual subject test scores out of 50, lab viva records, and see which courses need an extra revision weekend.
              </p>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Subject-wise /50 adjustment</span>
              </div>
            </div>

            {/* Pillar 3: Interactive Timetable */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Custom Timetable with (+) Subject Additions
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Organize your weekly lectures from Monday to Friday. Add elective classes, remove dropped courses, and assign classroom numbers with single-click ease.
              </p>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Day-by-day lecture scheduler</span>
              </div>
            </div>

            {/* Pillar 4: Daily Tasks & To-Do Tracker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Task Tracker & Assignment Checklist
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay on top of submissions, lab journals, and readings. Mark completed assignments with joyful check animations and celebratory progress rings.
              </p>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant completion status tracking</span>
              </div>
            </div>

            {/* Pillar 5: Voice Academic Advisor & Doubt Chat */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Friendly Academic Advisor & Speech Synthesis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask how to prepare for algorithms exams, clarify engineering concepts, or listen to audible study suggestions generated specifically for your course load.
              </p>
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Empathetic voice guidance</span>
              </div>
            </div>

            {/* Pillar 6: Projects, Certifications & Live Tests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Projects, Certifications & Live Mock Tests
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Showcase your portfolio, record completed industry certifications, and take personalized timed tests to sharpen concepts before finals.
              </p>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Comprehensive student portfolio</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Humanoid 16-Week Semester Journey Milestone Roadmap */}
      <section id="student-journey" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span>Roadmap to Honors</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The 16-Week Semester Journey
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              How everyday habits build effortless grades without last-minute all-nighters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Weeks 1–4
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Syllabus & Routine Setup
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Import your course syllabus, create your profile bio-data, and lock in your lecture timetable with morning reminder notifications.
              </p>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Target: 90%+ attendance baseline
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Weeks 5–8
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mid-Term Assessment 1
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Record your first CIA scores out of 50. Edu Predict identifies any weak topics early so you can consult professors during office hours.
              </p>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Target: 38+/50 in core theory
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Weeks 9–13
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lab Viva & Projects
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log practical repository completions and peer study circle discussions. Clear backlog doubt items in collaborative doubt hubs.
              </p>
              <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                Target: 100% lab assignments submitted
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                4
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Weeks 14–16
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Final Exam Sprint & Honors
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Take tailored mock quizzes, review formulas, and walk into end-semester university exams relaxed with a secured attendance buffer.
              </p>
              <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Target: 8.5+ SGPA Achievement
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Human Student Stories & Experiences */}
      <section id="community-stories" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Student Reflections
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Trusted by Campus Learners
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Real reflections on staying eligible, tracking internal marks, and graduating with pride
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Story 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-blue-400/40" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "In 3rd semester, I almost got debarred in Computer Networks because I lost count of my absences. The attendance ledger with explicit Present vs. Absent counts saved my semester eligibility."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src="/src/assets/images/avatar_student_sarah_1793977638044.jpg"
                  alt="Sarah Patel"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sarah Patel</h4>
                  <p className="text-[11px] text-slate-500">6th Sem Computer Science · SRN CS2022-084</p>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-emerald-400/40" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "Being able to customize internal assessment scores out of 50 and simulate my final exam score helped me understand exactly where I needed 5 more marks before the semester ended."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                  alt="Rahul Verma"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rahul Verma</h4>
                  <p className="text-[11px] text-slate-500">4th Sem Information Science · SRN IS2023-042</p>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <Quote className="w-6 h-6 text-purple-400/40" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "The interactive timetable with the (+) add subject button let me schedule my robotics lab elective alongside regular classes. Our study circle doubt sessions are so much more organized now."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Ananya Roy"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ananya Roy</h4>
                  <p className="text-[11px] text-slate-500">6th Sem Electronics & Comm · SRN EC2022-119</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Campus Portal Call to Action Banner */}
      <section className="py-14 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Command of Your Academic Success?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Log in to your personalized student dashboard, check your live attendance stats, adjust your CIA marks, and take your first revision test.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('student')}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-800 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all"
            >
              Enter Student Dashboard
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white font-semibold text-sm border border-blue-400/40 transition-all"
            >
              Update Student Profile
            </button>
          </div>
        </div>
      </section>

      {/* Humanoid Educational Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-white font-bold text-base">Edu Predict</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Comprehensive student academic portal dedicated to transparent attendance tracking, continuous internal evaluations, and personalized study roadmaps.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Student Features</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">Attendance Ledger</button></li>
                <li><button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">CIA /50 Internal Marks</button></li>
                <li><button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">Weekly Timetable Planner</button></li>
                <li><button onClick={() => onNavigate('student')} className="hover:text-white transition-colors">Certifications & Projects</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Campus Support</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><span className="hover:text-white cursor-pointer transition-colors">Academic Advisory Cell</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">75% Attendance Regulation Office</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Examination Branch Portal</span></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Student Mentorship Forum</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Campus Integrity</div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Edu Predict operates under institutional student privacy charters. All academic records are maintained securely in accordance with university academic bylaws.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-500">
            <div>
              © 2026 Edu Predict Student Academic Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Campus Directory</span>
              <span>·</span>
              <span>Student Council</span>
              <span>·</span>
              <span>Privacy & Ethics</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
