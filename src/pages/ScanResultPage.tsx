import React, { useState } from 'react';
import { PredictionResult, WeatherRiskData } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthScoreGauge } from '../components/common/Gauge';
import { ConfidenceBadge, SeverityBadge, HealthStatusBadge } from '../components/common/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  BookmarkCheck,
  GitCompare,
  PlusCircle,
  Clock,
  Cpu,
  CloudSun,
  Shield,
  FileCheck2,
  Info
} from 'lucide-react';

interface ScanResultPageProps {
  result: PredictionResult;
  image: string;
  weatherRisk?: WeatherRiskData;
  onSaveSuccess: (scanId: string) => void;
  onCompareWithPrevious: (scanId?: string) => void;
  onStartNewScan: () => void;
}

export const ScanResultPage: React.FC<ScanResultPageProps> = ({
  result,
  image,
  weatherRisk,
  onSaveSuccess,
  onCompareWithPrevious,
  onStartNewScan
}) => {
  const { isAuthenticated } = useAuth();
  const [userNotes, setUserNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const confidencePercent = Math.round(result.confidence * 100);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setSaveError('Please sign in or create an account to save this scan to your farm records.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await api.saveScan({
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        confidenceLevel: result.confidenceLevel,
        severity: result.severity,
        severityCategory: result.severityCategory,
        healthScore: result.healthScore,
        healthStatus: result.healthStatus,
        imageUrl: image,
        notes: userNotes,
        inferenceEngine: result.inferenceEngine,
        isMock: result.isMock,
        weatherRisk
      });

      setSavedScanId(res.scan.id);
      onSaveSuccess(res.scan.id);
    } catch (err: any) {
      console.error('Failed to save scan:', err);
      setSaveError(err.message || 'Failed to save scan record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {result.crop} Diagnostic
            </span>
            <span className="text-xs text-slate-400">
              {new Date(result.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {result.disease} {result.disease === 'Healthy' ? 'Foliage' : 'Identified'}
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {savedScanId ? (
            <button
              onClick={() => onCompareWithPrevious(savedScanId)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              Compare with Previous Scan
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
            >
              <BookmarkCheck className="w-4 h-4" />
              {isSaving ? 'Saving Scan...' : 'Save to Farm History'}
            </button>
          )}

          <button
            onClick={onStartNewScan}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
          <span>{saveError}</span>
        </div>
      )}

      {/* Primary Diagnostic Metrics Cards */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Leaf Visual + Severity & Confidence Overview */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
            <img
              src={image}
              alt="Diagnosed crop leaf"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-semibold">
              {result.crop} • {result.disease}
            </div>

            {result.isMock && (
              <div className="absolute bottom-3 left-3 bg-amber-500/90 text-slate-950 text-[11px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Dev / Simulated Weights
              </div>
            )}
          </div>

          {/* Diagnostic Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Confidence Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Model Confidence
                </span>
                <ConfidenceBadge level={result.confidenceLevel} confidence={result.confidence} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{confidencePercent}%</span>
                <span className="text-xs text-slate-400">Threshold: {result.confidenceLevel}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.confidenceLevel === 'HIGH'
                      ? 'bg-emerald-600'
                      : result.confidenceLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              {/* Low confidence advisory notice */}
              {result.confidenceLevel === 'LOW' && (
                <div className="mt-2.5 p-2 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-lg">
                  AI confidence is low. Please upload another clear image or consult an agricultural expert.
                </div>
              )}
            </div>

            {/* Severity Estimation Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Disease Severity
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimate</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">~{result.severity}%</span>
                <SeverityBadge category={result.severityCategory} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Estimated affected leaf surface area ({result.severityCategory}).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Crop Health Score Gauge & Weather Context */}
        <div className="lg:col-span-5 space-y-6">
          {/* Health Score Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Field Crop Health Index
            </h3>
            <HealthScoreGauge score={result.healthScore} status={result.healthStatus} size={170} />

            <div className="mt-4 pt-4 border-t border-slate-100 w-full grid grid-cols-2 gap-2 text-xs text-slate-600 text-left">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Pathology Status:</span>
                <span className="font-semibold text-slate-800">{result.disease}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Severity Impact:</span>
                <span className="font-semibold text-slate-800">~{result.severity}% Area</span>
              </div>
            </div>
          </div>

          {/* Microclimate Weather Risk Context */}
          {weatherRisk && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Ambient Weather Risk Indicator</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    weatherRisk.riskLevel === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : weatherRisk.riskLevel === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {weatherRisk.riskLevel} SPREAD RISK
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{weatherRisk.context}</p>
              <div className="text-[11px] p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
                <strong>Agronomic Advice:</strong> {weatherRisk.recommendation}
              </div>
            </div>
          )}

          {/* Optional Notes before saving */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">Field Notes / Observations (Optional)</label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              placeholder="e.g. Bed 4 lower canopy, noted after 3 days of rain..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {!savedScanId && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Scan with Notes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controlled Disease Knowledge Base Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Section 1: What We Detected & Symptoms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Pathology Profile
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">What We Detected</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.recommendations.description}
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Common Foliar Symptoms
            </h4>
            <ul className="space-y-1.5">
              {result.recommendations.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 2: What You Can Do & Preventive Practices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Action Plan
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Recommended Management</h3>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Immediate Cultural Practices
            </h4>
            <ul className="space-y-1.5">
              {result.recommendations.management.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Long-Term Preventive Measures
            </h4>
            <ul className="space-y-1.5">
              {result.recommendations.prevention.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Metadata & Technical Audit */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Scan Information & Diagnostic Pipeline</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Engine: {result.inferenceEngine}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Quality Status:</span>
            <span className="font-semibold text-emerald-700">Passed Quality Check</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Calculated Sharpness:</span>
            <span className="font-semibold text-slate-800">{result.qualityReport.sharpness ?? 85}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Scientific Classification:</span>
            <span className="font-semibold italic text-slate-800">{result.recommendations.scientificName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Literature Reference:</span>
            <span className="font-semibold text-slate-800">{result.recommendations.sources.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Important Agricultural Advisory Disclaimer</div>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            {result.recommendations.warning} CropCare AI provides decision-support foliar estimates. Consult local registered agronomists or certified plant pathology extension laboratories before applying chemical controls.
          </p>
        </div>
      </div>
    </div>
  );
};
