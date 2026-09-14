import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats, ScanRecord } from '../types';
import {
  Sprout,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { HealthStatusBadge, SeverityBadge } from '../components/common/Badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardPageProps {
  onStartNewScan: () => void;
  onViewScanDetails: (scanId: string) => void;
  onCompareScans: (scanId: string) => void;
  onViewProgression: (crop: string) => void;
  onViewHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartNewScan,
  onViewScanDetails,
  onCompareScans,
  onViewProgression,
  onViewHistory
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.getDashboardStats();
        setStats(res.stats);
        setRecentScans(res.recentScans);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError('Unable to load dashboard telemetry.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading agricultural telemetry & field data...</p>
      </div>
    );
  }

  const latest = stats?.latestScan;
  const BAR_COLORS = ['#059669', '#d97706', '#dc2626', '#0284c7', '#7c3aed'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Welcome Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.fullName || 'Farmer'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {user?.role === 'admin' ? 'Pathology Lead' : 'Field Scout'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm Location: {user?.farmName || 'Valley Holdings'} • {user?.location || 'Zone 4 Field'}</span>
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onStartNewScan}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-700/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Scan
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Scans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans</span>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalScans ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Recorded field foliage logs</p>
        </div>

        {/* Card 2: Healthy Foliage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Healthy Canopies</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{stats?.healthyScans ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Free of necrotic lesions</p>
        </div>

        {/* Card 3: Diseased Foliage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Diseased Scans</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700">{stats?.diseasedScans ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under cultural mitigation</p>
        </div>

        {/* Card 4: Average Health Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Health Score</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-teal-700">{stats?.averageHealthScore ?? 0}<span className="text-base text-slate-400 font-normal">/100</span></div>
          <p className="text-[11px] text-slate-500 mt-1">Across all evaluated crops</p>
        </div>
      </div>

      {/* Latest Detection Alert Card */}
      {latest && (
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={latest.imageUrl}
              alt={latest.crop}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 uppercase tracking-wide">
                  Latest Field Detection
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(latest.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {latest.crop}: {latest.disease}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  Severity: ~{latest.severity}% ({latest.severityCategory})
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 font-medium">
                  Health Score: {latest.healthScore}/100
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  Confidence: {Math.round(latest.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onViewScanDetails(latest.id)}
              className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              View Full Diagnostic
            </button>
            <button
              onClick={() => onCompareScans(latest.id)}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-colors"
            >
              Compare Scan
            </button>
          </div>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Health Trend Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Foliar Health Score Progression
              </h3>
              <p className="text-[11px] text-slate-500">Average historical health score trend over time</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {stats && stats.healthScoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.healthScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={val => val.substring(5)}
                  />
                  <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}/100`, 'Health Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log scans to populate the progression curve.
              </div>
            )}
          </div>
        </div>

        {/* Disease Distribution Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Detected Pathology Distribution
              </h3>
              <p className="text-[11px] text-slate-500">Proportion of field classes identified</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {stats && stats.diseaseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.diseaseDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    tickFormatter={val => val.split(':')[1]?.trim() || val}
                  />
                  <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.diseaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No scan data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Crop Scans</h3>
            <p className="text-xs text-slate-500">Most recent foliar disease and severity assessments</p>
          </div>
          <button
            onClick={onViewHistory}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            View All Scans
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Leaf</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentScans.length > 0 ? (
                recentScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-6">
                      <img
                        src={scan.imageUrl}
                        alt={scan.crop}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{scan.crop}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{scan.disease}</div>
                      <div className="text-[10px] text-slate-400">{Math.round(scan.confidence * 100)}% confidence</div>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge category={scan.severityCategory} percentage={scan.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <HealthStatusBadge status={scan.healthStatus} score={scan.healthScore} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => onViewScanDetails(scan.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onCompareScans(scan.id)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md transition-colors"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No crop scans found. Upload a leaf photo to begin monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
