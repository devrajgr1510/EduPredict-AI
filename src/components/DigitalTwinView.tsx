import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { StudentAcademicRecord, DigitalStudentTwinSimulation } from '../types/index.ts';
import { simulateDigitalStudentTwin } from '../utils/mlEngine.ts';

interface DigitalTwinViewProps {
  studentRecord: StudentAcademicRecord;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ studentRecord }) => {
  // Current baseline values
  const baselineInternals = Math.round(
    studentRecord.subjectPerformance.reduce((acc, s) => acc + s.internalMarksOutOf50, 0) /
    (studentRecord.subjectPerformance.length || 1)
  );

  // Twin delta states
  const [targetAttendance, setTargetAttendance] = useState<number>(studentRecord.attendancePercentage);
  const [targetInternals50, setTargetInternals50] = useState<number>(baselineInternals);
  const [targetStudyHours, setTargetStudyHours] = useState<number>(studentRecord.studyHoursPerDay);
  const [targetBacklogs, setTargetBacklogs] = useState<number>(studentRecord.backlogs);

  // Simulation run
  const simulation: DigitalStudentTwinSimulation = useMemo(() => {
    return simulateDigitalStudentTwin(studentRecord, {
      attendance: targetAttendance,
      internalsOutOf50: targetInternals50,
      studyHours: targetStudyHours,
      backlogs: targetBacklogs
    });
  }, [studentRecord, targetAttendance, targetInternals50, targetStudyHours, targetBacklogs]);

  // Preset Scenario Handlers
  const handleApplyPreset = (preset: 'optimal' | 'remedial' | 'crunch' | 'reset') => {
    if (preset === 'reset') {
      setTargetAttendance(studentRecord.attendancePercentage);
      setTargetInternals50(baselineInternals);
      setTargetStudyHours(studentRecord.studyHoursPerDay);
      setTargetBacklogs(studentRecord.backlogs);
    } else if (preset === 'optimal') {
      setTargetAttendance(95);
      setTargetInternals50(46);
      setTargetStudyHours(5.5);
      setTargetBacklogs(0);
    } else if (preset === 'remedial') {
      setTargetAttendance(85);
      setTargetInternals50(38);
      setTargetStudyHours(4.0);
      setTargetBacklogs(0);
    } else if (preset === 'crunch') {
      setTargetAttendance(studentRecord.attendancePercentage);
      setTargetInternals50(Math.min(50, baselineInternals + 5));
      setTargetStudyHours(6.0);
      setTargetBacklogs(studentRecord.backlogs);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Digital Student Twin – Academic What-If Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate future CGPA, semester grade trajectories, and risk mitigations under counterfactual academic behaviors.
          </p>
        </div>

        {/* Preset scenario shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleApplyPreset('optimal')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal 9.0+ CGPA</span>
          </button>
          <button
            onClick={() => handleApplyPreset('remedial')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Clear Backlogs</span>
          </button>
          <button
            onClick={() => handleApplyPreset('reset')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Simulation Twin on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Delta Controls */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Simulate Counterfactual Parameters</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Live ML inference</span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Target Attendance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                <span>Simulated Attendance Percentage</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {targetAttendance}% 
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({targetAttendance >= studentRecord.attendancePercentage ? '+' : ''}{targetAttendance - studentRecord.attendancePercentage}%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Baseline: {studentRecord.attendancePercentage}%</span>
                <span>Requirement: 75%</span>
                <span>Max: 100%</span>
              </div>
            </div>

            {/* Target Internal Marks / 50 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                <span>Target Internal Marks (out of 50)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {targetInternals50} / 50
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({targetInternals50 >= baselineInternals ? '+' : ''}{targetInternals50 - baselineInternals} marks)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={targetInternals50}
                onChange={(e) => setTargetInternals50(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Baseline: {baselineInternals}/50</span>
                <span>Passing: 25/50</span>
                <span>Top tier: 45+/50</span>
              </div>
            </div>

            {/* Target Study Hours */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                <span>Daily Self-Study Hours</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {targetStudyHours} hrs/day
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({targetStudyHours >= studentRecord.studyHoursPerDay ? '+' : ''}{(targetStudyHours - studentRecord.studyHoursPerDay).toFixed(1)}h)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={targetStudyHours}
                onChange={(e) => setTargetStudyHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Baseline: {studentRecord.studyHoursPerDay} hrs</span>
                <span>Target: 4.5 hrs</span>
                <span>Intense: 8.0 hrs</span>
              </div>
            </div>

            {/* Target Backlogs */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                <span>Unresolved Backlog Courses</span>
                <span className={`font-mono text-sm font-bold ${targetBacklogs === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {targetBacklogs} backlogs
                </span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setTargetBacklogs(cnt)}
                    className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors ${
                      targetBacklogs === cnt
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cnt === 0 ? '0 (Clear)' : cnt}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Comparative Twin Visualization */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Side-by-Side Comparison Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Baseline Student vs. Digital Twin
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
                {simulation.simulated.marksDelta >= 0 ? '+' : ''}{simulation.simulated.marksDelta}% Marks
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Baseline Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Baseline
                </div>

                <div>
                  <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200">
                    {simulation.baseline.predictedMarks}%
                  </div>
                  <div className="text-xs text-slate-500">CGPA: {simulation.baseline.predictedCGPA} / 10.0</div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <span className="font-mono font-semibold">{simulation.baseline.attendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internals:</span>
                    <span className="font-mono font-semibold">{simulation.baseline.internalsOutOf50}/50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Study Hours:</span>
                    <span className="font-mono font-semibold">{simulation.baseline.studyHours}h/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Status:</span>
                    <span className="font-semibold text-amber-600">{simulation.baseline.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Digital Twin Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-500/80 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Digital Twin</span>
                  </span>
                  {simulation.simulated.marksDelta >= 0 ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      +{simulation.simulated.marksDelta}%
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-rose-600">
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                      {simulation.simulated.marksDelta}%
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-3xl font-black font-mono text-blue-700 dark:text-blue-300">
                    {simulation.simulated.predictedMarks}%
                  </div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Projected CGPA: {simulation.simulated.predictedCGPA} / 10.0
                    <span className="font-normal text-slate-500 ml-1">
                      ({simulation.simulated.cgpaDelta >= 0 ? '+' : ''}{simulation.simulated.cgpaDelta})
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 border-t border-blue-200 dark:border-blue-900/60 pt-2">
                  <div className="flex justify-between">
                    <span>Simulated Attendance:</span>
                    <span className="font-mono font-bold">{simulation.simulated.attendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulated Internals:</span>
                    <span className="font-mono font-bold">{simulation.simulated.internalsOutOf50}/50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Study Hours:</span>
                    <span className="font-mono font-bold">{simulation.simulated.studyHours}h/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulated Risk:</span>
                    <span className={`font-bold ${
                      simulation.simulated.riskLevel === 'Low Risk' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {simulation.simulated.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* AI Insights from Twin Simulation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Digital Twin Scenario Insights</span>
            </h4>

            <div className="space-y-2">
              {simulation.scenarioInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
