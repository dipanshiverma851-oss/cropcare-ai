import React from 'react';
import { ConfidenceLevel, SeverityCategory, HealthScoreStatus } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  confidence: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, confidence }) => {
  const percent = Math.round(confidence * 100);

  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        High Confidence ({percent}%)
      </span>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Moderate Confidence ({percent}%)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      Low Confidence ({percent}%)
    </span>
  );
};

interface SeverityBadgeProps {
  category: SeverityCategory;
  percentage?: number;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ category, percentage }) => {
  const percentText = percentage !== undefined ? ` (~${percentage}%)` : '';

  switch (category) {
    case 'Healthy':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          Healthy{percentText}
        </span>
      );
    case 'Mild':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
          Mild Severity{percentText}
        </span>
      );
    case 'Moderate':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
          Moderate Severity{percentText}
        </span>
      );
    case 'Severe':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-900 border border-red-300">
          Severe Foliar Defoliation{percentText}
        </span>
      );
  }
};

interface HealthStatusBadgeProps {
  status: HealthScoreStatus;
  score?: number;
}

export const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({ status, score }) => {
  const scoreText = score !== undefined ? ` (${score}/100)` : '';

  switch (status) {
    case 'Healthy':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
          Healthy{scoreText}
        </span>
      );
    case 'Good':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white shadow-sm">
          Good Condition{scoreText}
        </span>
      );
    case 'Needs Attention':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
          Needs Attention{scoreText}
        </span>
      );
    case 'High Risk':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-600 text-white shadow-sm">
          High Risk{scoreText}
        </span>
      );
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
          Critical Yield Risk{scoreText}
        </span>
      );
  }
};
