import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScanRecord } from '../types';
import { ConfidenceBadge, SeverityBadge, HealthStatusBadge } from '../components/common/Badge';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  GitCompare,
  Eye,
  PlusCircle,
  Calendar,
  Layers,
  Sprout
} from 'lucide-react';

interface ScanHistoryPageProps {
  onViewScanDetails: (scanId: string) => void;
  onCompareScans: (scanId1: string, scanId2?: string) => void;
  onStartNewScan: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  onViewScanDetails,
  onCompareScans,
  onStartNewScan
}) => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Filters & search
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Multi-select for side-by-side comparison
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [cropFilter, diseaseFilter, statusFilter, sortBy]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getScanHistory({
        crop: cropFilter || undefined,
        disease: diseaseFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        sortBy
      });
      setScans(res.scans);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const toggleSelectForComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(prev => prev.filter(i => i !== id));
    } else {
      if (selectedForComparison.length >= 2) {
        // Replace oldest selection
        setSelectedForComparison([selectedForComparison[1], id]);
      } else {
        setSelectedForComparison(prev => [...prev, id]);
      }
    }
  };

  const handleLaunchComparison = () => {
    if (selectedForComparison.length === 2) {
      onCompareScans(selectedForComparison[0], selectedForComparison[1]);
    } else if (selectedForComparison.length === 1) {
      onCompareScans(selectedForComparison[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & New Scan CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Foliar Scan History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived leaf inspections, severity readings, and historical progression data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForComparison.length > 0 && (
            <button
              onClick={handleLaunchComparison}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
            >
              <GitCompare className="w-4 h-4" />
              Compare Selected ({selectedForComparison.length}/2)
            </button>
          )}

          <button
            onClick={onStartNewScan}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Leaf Scan
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by crop, disease, or field notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </form>

          {/* Crop Filter */}
          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Crops</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Corn">Corn</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Health Scores</option>
            <option value="Healthy">Healthy (90-100)</option>
            <option value="Good">Good (70-89)</option>
            <option value="Needs Attention">Needs Attention (50-69)</option>
            <option value="High Risk">High Risk (30-49)</option>
            <option value="Critical">Critical (0-29)</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="healthScore-desc">Health Score (High to Low)</option>
              <option value="healthScore-asc">Health Score (Low to High)</option>
              <option value="severity-desc">Severity (High to Low)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-400'}`}
                title="Card Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-400'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scans Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading scan records...</div>
      ) : scans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No scans match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or search keywords, or run a new crop leaf diagnostic.
          </p>
          <button
            onClick={onStartNewScan}
            className="mt-2 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
          >
            Start New Scan
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map(scan => {
            const isSelected = selectedForComparison.includes(scan.id);
            return (
              <div
                key={scan.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden flex flex-col justify-between ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="relative aspect-16/10 bg-slate-900">
                    <img
                      src={scan.imageUrl}
                      alt={scan.crop}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                      {scan.crop}
                    </div>

                    <button
                      onClick={() => toggleSelectForComparison(scan.id)}
                      className={`absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-black/60 hover:bg-black/80 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : '+ Compare'}
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{scan.disease}</h3>
                        <p className="text-[11px] text-slate-400">
                          {new Date(scan.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <HealthStatusBadge status={scan.healthStatus} score={scan.healthScore} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <ConfidenceBadge level={scan.confidenceLevel} confidence={scan.confidence} />
                      <SeverityBadge category={scan.severityCategory} percentage={scan.severity} />
                    </div>

                    {scan.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                        "{scan.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onViewScanDetails(scan.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    Full Details
                  </button>

                  <button
                    onClick={() => onCompareScans(scan.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Compare
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">Select</th>
                  <th className="py-3 px-4">Leaf</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Health Score</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {scans.map(scan => {
                  const isSelected = selectedForComparison.includes(scan.id);
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectForComparison(scan.id)}
                          className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">
                        <ConfidenceBadge level={scan.confidenceLevel} confidence={scan.confidence} />
                      </td>
                      <td className="py-3 px-4">
                        <SeverityBadge category={scan.severityCategory} percentage={scan.severity} />
                      </td>
                      <td className="py-3 px-4">
                        <HealthStatusBadge status={scan.healthStatus} score={scan.healthScore} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-right space-x-2">
                        <button
                          onClick={() => onViewScanDetails(scan.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onCompareScans(scan.id)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md"
                        >
                          Compare
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
