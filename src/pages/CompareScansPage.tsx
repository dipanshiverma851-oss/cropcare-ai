import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScanRecord, ScanComparison } from '../types';
import { SeverityBadge, HealthStatusBadge } from '../components/common/Badge';
import {
  ArrowLeft,
  GitCompare,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CompareScansPageProps {
  initialScanId?: string;
  targetScanId?: string;
  onBack: () => void;
  onViewScanDetails: (id: string) => void;
}

export const CompareScansPage: React.FC<CompareScansPageProps> = ({
  initialScanId,
  targetScanId,
  onBack,
  onViewScanDetails
}) => {
  const [allScans, setAllScans] = useState<ScanRecord[]>([]);
  const [scan1Id, setScan1Id] = useState<string>(initialScanId || '');
  const [scan2Id, setScan2Id] = useState<string>(targetScanId || '');
  const [comparison, setComparison] = useState<ScanComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all user scans for the comparison dropdown selector
  useEffect(() => {
    const loadScans = async () => {
      try {
        const res = await api.getScanHistory();
        setAllScans(res.scans);

        // Auto-select if not set
        if (!scan1Id && res.scans.length > 0) {
          setScan1Id(res.scans[0].id);
        }
        if (!scan2Id && res.scans.length > 1) {
          setScan2Id(res.scans[1].id);
        }
      } catch (err) {
        console.error('Failed to load scans for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  // Whenever scan1Id or scan2Id changes, fetch comparison
  useEffect(() => {
    if (!scan1Id || !scan2Id) return;
    if (scan1Id === scan2Id) {
      setError('Please select two distinct scans to evaluate crop progression.');
      setComparison(null);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.compareScans(scan1Id, scan2Id);
        setComparison(res.comparison);
      } catch (err: any) {
        console.error('Comparison error:', err);
        setError(err.message || 'Unable to compute side-by-side comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [scan1Id, scan2Id]);

  const scan1 = allScans.find(s => s.id === scan1Id);
  const scan2 = allScans.find(s => s.id === scan2Id);

  // Chart data
  const chartData = comparison ? [
    {
      metric: 'Severity (% Area)',
      Scan1: comparison.previousScan.severity,
      Scan2: comparison.currentScan.severity
    },
    {
      metric: 'Health Score (/100)',
      Scan1: comparison.previousScan.healthScore,
      Scan2: comparison.currentScan.healthScore
    }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        <span className="text-xs text-slate-500 flex items-center gap-1">
          <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
          Before-vs-After Comparative Pathology
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Side-by-Side Crop Scan Comparison
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Examine changes in necrotic foliar lesions, disease severity deltas, and crop health recovery.
        </p>
      </div>

      {/* Scan Selectors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Baseline / Earlier Scan (Scan A)
          </label>
          <select
            value={scan1Id}
            onChange={e => setScan1Id(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select First Scan...</option>
            {allScans.map(s => (
              <option key={s.id} value={s.id}>
                {s.crop} ({s.disease}) - {new Date(s.createdAt).toLocaleDateString()} [Score: {s.healthScore}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Follow-Up / Recent Scan (Scan B)
          </label>
          <select
            value={scan2Id}
            onChange={e => setScan2Id(e.target.value)}
            className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select Second Scan...</option>
            {allScans.map(s => (
              <option key={s.id} value={s.id}>
                {s.crop} ({s.disease}) - {new Date(s.createdAt).toLocaleDateString()} [Score: {s.healthScore}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
          {error}
        </div>
      )}

      {comparison && (
        <>
          {/* Summary Status Banner */}
          <div
            className={`p-6 rounded-2xl border shadow-xs flex items-start gap-4 ${
              comparison.progressionStatus === 'improving'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : comparison.progressionStatus === 'worsening'
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0">
              {comparison.progressionStatus === 'improving' ? (
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              ) : comparison.progressionStatus === 'worsening' ? (
                <TrendingDown className="w-6 h-6 text-rose-600" />
              ) : (
                <Minus className="w-6 h-6 text-slate-500" />
              )}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Progression Assessment: {comparison.progressionStatus.toUpperCase()}
              </div>
              <h2 className="text-lg font-extrabold mt-0.5">{comparison.summaryMessage}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium">
                <span>
                  Severity Delta:{' '}
                  <strong>
                    {comparison.severityDelta > 0 ? `+${comparison.severityDelta}%` : `${comparison.severityDelta}%`}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Health Score Delta:{' '}
                  <strong>
                    {comparison.healthScoreDelta > 0 ? `+${comparison.healthScoreDelta}` : `${comparison.healthScoreDelta}`} pts
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Visual Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scan 1 Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scan A (Earlier)</span>
                <span className="text-xs text-slate-400">
                  {new Date(comparison.previousScan.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center">
                <img
                  src={comparison.previousScan.imageUrl}
                  alt="Scan A leaf"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/75 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {comparison.previousScan.crop}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{comparison.previousScan.disease}</h3>
                  <HealthStatusBadge status={comparison.previousScan.healthStatus} score={comparison.previousScan.healthScore} />
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge category={comparison.previousScan.severityCategory} percentage={comparison.previousScan.severity} />
                  <span className="text-xs text-slate-500">
                    Confidence: {Math.round(comparison.previousScan.confidence * 100)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewScanDetails(comparison.previousScan.id)}
                className="w-full py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Inspect Scan A Details
              </button>
            </div>

            {/* Scan 2 Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scan B (Follow-up)</span>
                <span className="text-xs text-slate-400">
                  {new Date(comparison.currentScan.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center">
                <img
                  src={comparison.currentScan.imageUrl}
                  alt="Scan B leaf"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/75 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {comparison.currentScan.crop}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{comparison.currentScan.disease}</h3>
                  <HealthStatusBadge status={comparison.currentScan.healthStatus} score={comparison.currentScan.healthScore} />
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge category={comparison.currentScan.severityCategory} percentage={comparison.currentScan.severity} />
                  <span className="text-xs text-slate-500">
                    Confidence: {Math.round(comparison.currentScan.confidence * 100)}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => onViewScanDetails(comparison.currentScan.id)}
                className="w-full py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Inspect Scan B Details
              </button>
            </div>
          </div>

          {/* Comparative Metrics Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Comparative Foliar Indicators</h3>
            <p className="text-[11px] text-slate-500 mb-4">Direct numerical variance between baseline and follow-up scans</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Scan1" name="Scan A (Earlier)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Scan2" name="Scan B (Follow-up)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
