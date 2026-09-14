import React from 'react';
import { HealthScoreStatus } from '../../types';

interface HealthScoreGaugeProps {
  score: number;
  status: HealthScoreStatus;
  size?: number;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({ score, status, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc (three-quarter gauge)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#059669', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (s >= 70) return { stroke: '#0d9488', text: 'text-teal-700', bg: 'bg-teal-50' };
    if (s >= 50) return { stroke: '#d97706', text: 'text-amber-700', bg: 'bg-amber-50' };
    if (s >= 30) return { stroke: '#ea580c', text: 'text-orange-700', bg: 'bg-orange-50' };
    return { stroke: '#dc2626', text: 'text-red-700', bg: 'bg-red-50' };
  };

  const theme = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-135"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress active arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score readout in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">
            {score}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${theme.bg} ${theme.text}`}>
          {status}
        </span>
        <p className="text-[11px] text-slate-500 mt-1">Crop Health Score</p>
      </div>
    </div>
  );
};
