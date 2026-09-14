import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScanRecord, DiseaseKnowledge } from '../types';
import { HealthScoreGauge } from '../components/common/Gauge';
import { ConfidenceBadge, SeverityBadge } from '../components/common/Badge';
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Shield,
  FileText,
  Cpu,
  Clock
} from 'lucide-react';

interface ScanDetailsPageProps {
  scanId: string;
  onBack: () => void;
  onCompare: (scanId: string) => void;
  onViewProgression: (crop: string) => void;
}

export const ScanDetailsPage: React.FC<ScanDetailsPageProps> = ({
  scanId,
  onBack,
  onCompare,
  onViewProgression
}) => {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [recommendations, setRecommendations] = useState<DiseaseKnowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getScanDetails(scanId);
        setScan(res.scan);
        setRecommendations(res.recommendations);
      } catch (err: any) {
        console.error('Error fetching scan details:', err);
        setError('Could not find or load the requested scan record.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [scanId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Retrieving pathology inspection record...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Scan not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          Return to Scan History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompare(scan.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Compare with Another Scan
          </button>

          <button
            onClick={() => onViewProgression(scan.crop)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            View {scan.crop} Progression
          </button>
        </div>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {scan.crop}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(scan.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {scan.disease} Foliar Record
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal Scan Reference: <span className="font-mono text-slate-700">{scan.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ConfidenceBadge level={scan.confidenceLevel} confidence={scan.confidence} />
          <SeverityBadge category={scan.severityCategory} percentage={scan.severity} />
        </div>
      </div>

      {/* Visual & Gauge Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center">
            <img
              src={scan.imageUrl}
              alt={scan.crop}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {scan.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Field Scout Notes:
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">{scan.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
            <HealthScoreGauge score={scan.healthScore} status={scan.healthStatus} size={180} />

            <div className="w-full mt-4 pt-4 border-t border-slate-100 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Engine:</span>
                <span className="font-semibold text-slate-800">{scan.inferenceEngine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Precision:</span>
                <span className="font-semibold text-slate-800">{Math.round(scan.confidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Severity Impact:</span>
                <span className="font-semibold text-slate-800">~{scan.severity}% Area</span>
              </div>
            </div>
          </div>

          {scan.weatherRisk && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="font-bold text-slate-900">Weather Risk Context at Scan Time:</div>
              <p className="text-slate-600">{scan.weatherRisk.context}</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-100">
                {scan.weatherRisk.recommendation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disease Recommendations if available */}
      {recommendations && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Pathology Symptoms Checklist</h3>
            <p className="text-xs text-slate-600">{recommendations.description}</p>
            <ul className="space-y-1.5 pt-2">
              {recommendations.symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Preventive & Management Guidance</h3>
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase">Immediate Practices</h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {recommendations.management.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase">Long-Term Prevention</h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {recommendations.prevention.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
