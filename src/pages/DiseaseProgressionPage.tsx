import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProgressionData } from '../types';
import { SUPPORTED_CROPS } from '../../server/data/crops';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sprout
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

interface DiseaseProgressionPageProps {
  initialCrop?: string;
  onViewScanDetails: (scanId: string) => void;
  onCompareScans: (id1: string, id2: string) => void;
}

export const DiseaseProgressionPage: React.FC<DiseaseProgressionPageProps> = ({
  initialCrop = 'Tomato',
  onViewScanDetails,
  onCompareScans
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgression();
  }, [selectedCrop]);

  const fetchProgression = async () => {
    setLoading(true);
    try {
      const data = await api.getProgression(selectedCrop);
      setProgression(data);
    } catch (err) {
      console.error('Failed to load progression:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Disease Progression & Recovery Timeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate multi-day foliar recovery, lesion spread rates, and cultural practice efficacy.
        </p>
      </div>

      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {SUPPORTED_CROPS.map(c => {
          const isSelected = selectedCrop.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCrop(c.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name} Foliage</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Calculating longitudinal progression models...
        </div>
      ) : !progression || progression.timelineData.length < 2 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Insufficient Scans for Longitudinal Trend</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            At least two scans of {selectedCrop} are required to calculate multi-point disease progression curves.
          </p>
        </div>
      ) : (
        <>
          {/* Trend Evaluation Banner */}
          <div
            className={`p-6 rounded-2xl border shadow-xs flex items-start gap-4 ${
              progression.improving
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : progression.progressionDetected
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0">
              {progression.improving ? (
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              ) : progression.progressionDetected ? (
                <TrendingDown className="w-6 h-6 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-slate-500" />
              )}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Longitudinal Status: {progression.improving ? 'IMPROVING' : progression.progressionDetected ? 'PROGRESSION DETECTED' : 'STABLE'}
              </div>
              <h2 className="text-lg font-extrabold mt-0.5">{progression.trendMessage}</h2>
              <p className="text-xs mt-1 text-slate-600">
                Tracked across {progression.totalScans} archived field evaluations for {selectedCrop}.
              </p>
            </div>
          </div>

          {/* Dual Progression Curves Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Severity vs Health Score Longitudinal Timeline
              </h3>
              <p className="text-[11px] text-slate-500">
                Inverse correlation curve showing lesion severity reduction vs canopy health restoration
              </p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progression.timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="severity"
                    name="Severity (% Area)"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    name="Health Score (/100)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chronological Step Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Chronological Inspection Timeline</h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {progression.timelineData.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        Checkpoint #{step.index}
                      </span>
                      <span>{step.displayDate}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{step.disease}</h4>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Severity:</span>
                        <span className="font-bold text-red-600">~{step.severity}% Area</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Health Score:</span>
                        <span className="font-bold text-emerald-700">{step.healthScore}/100</span>
                      </div>
                    </div>

                    {step.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-2">
                        "{step.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onViewScanDetails(step.id)}
                    className="w-full mt-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    View Diagnostic Checkpoint
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
