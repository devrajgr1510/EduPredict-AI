import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Target, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';
import { StudentAcademicRecord, KMeansClusterData } from '../types/index.ts';
import { computeKMeansClusters } from '../utils/mlEngine.ts';

interface KMeansClusteringViewProps {
  students: StudentAcademicRecord[];
  onSelectStudent?: (studentId: string) => void;
}

export const KMeansClusteringView: React.FC<KMeansClusteringViewProps> = ({
  students,
  onSelectStudent
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<number | 'all'>('all');

  const clusters: KMeansClusterData[] = useMemo(() => {
    return computeKMeansClusters(students);
  }, [students]);

  const activeCluster = selectedClusterId === 'all' 
    ? null 
    : clusters.find(c => c.clusterId === selectedClusterId);

  const displayedStudents = useMemo(() => {
    if (selectedClusterId === 'all') {
      return clusters.flatMap(c => c.students.map(s => ({ ...s, clusterName: c.label, clusterColor: c.badgeColor })));
    }
    const targetCluster = clusters.find(c => c.clusterId === selectedClusterId);
    return targetCluster ? targetCluster.students.map(s => ({ ...s, clusterName: targetCluster.label, clusterColor: targetCluster.badgeColor })) : [];
  }, [clusters, selectedClusterId]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Unsupervised K-Means Student Cohort Clustering
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Machine learning segmentation grouping students by multi-dimensional academic vectors: Attendance, Internal Marks (/50), and Study Hours.
          </p>
        </div>

        {/* Filter buttons for clusters */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedClusterId('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedClusterId === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Clusters ({students.length})
          </button>
          {clusters.map((c) => (
            <button
              key={c.clusterId}
              onClick={() => setSelectedClusterId(c.clusterId)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedClusterId === c.clusterId
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cluster {c.clusterId + 1} ({c.percentage}%)
            </button>
          ))}
        </div>
      </div>

      {/* 3 Cluster Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {clusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.clusterId;

          return (
            <div
              key={cluster.clusterId}
              onClick={() => setSelectedClusterId(cluster.clusterId)}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-4 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Cluster {cluster.clusterId + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {cluster.label}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  cluster.clusterId === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : cluster.clusterId === 1
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {cluster.percentage}% ({cluster.studentCount} students)
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {cluster.description}
              </p>

              {/* Centroid Vector */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cluster Centroid Mean</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Avg Attendance</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cluster.centroid.attendance}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Avg Internals</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cluster.centroid.internalMarksOutOf50}/50</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Avg Study Hours</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cluster.centroid.studyHours}h/day</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Predicted Score</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cluster.centroid.overallScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2D Scatter Vector Representation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2D Cluster Feature Projection (Attendance % vs. Internal Marks / 50)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizes natural mathematical boundaries discovered by K-Means with Euclidean convergence.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Advanced (50%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Proficient (30%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>At-Risk (20%)</span>
            </span>
          </div>
        </div>

        {/* SVG Scatter Plot */}
        <div className="relative w-full h-64 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
          <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="50" y1="20" x2="50" y2="180" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
            <line x1="50" y1="180" x2="580" y2="180" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="50" y1="100" x2="580" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2" />
            <line x1="50" y1="20" x2="580" y2="20" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2" />

            {/* Axes Labels */}
            <text x="300" y="210" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
              Attendance Percentage (50% → 100%)
            </text>
            <text x="15" y="100" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600" transform="rotate(-90, 15, 100)">
              Internal Marks / 50 (20 → 50)
            </text>

            {/* Student Points */}
            {clusters.map((cluster, cIdx) => {
              const color = cIdx === 0 ? '#10b981' : cIdx === 1 ? '#3867F6' : '#ef4444';
              return cluster.students.map((st, sIdx) => {
                // X: attendance 50 to 100 mapped to 60 to 560
                const x = 60 + Math.max(0, Math.min(1, (st.attendance - 50) / 50)) * 480;
                // Y: marks/50 mapped to 170 down to 30
                const internalEst = (st.marks / 100) * 50;
                const y = 175 - Math.max(0, Math.min(1, (internalEst - 20) / 30)) * 140;

                return (
                  <g key={`${cIdx}-${sIdx}`} className="cursor-pointer group">
                    <circle
                      cx={x}
                      cy={y}
                      r="7"
                      fill={color}
                      opacity={selectedClusterId === 'all' || selectedClusterId === cluster.clusterId ? '0.9' : '0.2'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#1e293b"
                      className="opacity-0 group-hover:opacity-100 font-bold transition-opacity"
                    >
                      {st.name} ({st.marks}%)
                    </text>
                  </g>
                );
              });
            })}

            {/* Centroid Stars */}
            {clusters.map((cluster, cIdx) => {
              const x = 60 + Math.max(0, Math.min(1, (cluster.centroid.attendance - 50) / 50)) * 480;
              const y = 175 - Math.max(0, Math.min(1, (cluster.centroid.internalMarksOutOf50 - 20) / 30)) * 140;
              const color = cIdx === 0 ? '#059669' : cIdx === 1 ? '#1d4ed8' : '#b91c1c';

              return (
                <g key={`centroid-${cIdx}`}>
                  <polygon
                    points={`${x},${y-9} ${x+3},${y-2} ${x+9},${y-2} ${x+4},${y+3} ${x+6},${y+9} ${x},${y+5} ${x-6},${y+9} ${x-4},${y+3} ${x-9},${y-2} ${x-3},${y-2}`}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text x={x} y={y + 20} textAnchor="middle" fontSize="10" fill={color} fontWeight="bold">
                    Centroid C{cIdx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Cluster Students Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Students in Selected Cluster ({displayedStudents.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Separate gender-specific verified photos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedStudents.map((st) => (
            <div
              key={st.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-sm transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={st.avatarUrl}
                  alt={st.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{st.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">({st.gender})</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">{st.srn}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Attd: <span className="font-semibold text-slate-800 dark:text-slate-200">{st.attendance}%</span> · Marks: <span className="font-semibold text-slate-800 dark:text-slate-200">{st.marks}%</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  st.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : st.status === 'Ahead'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : st.status === 'On Track'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {st.status}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">{st.clusterName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
