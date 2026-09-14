import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, ScanRecord, DiseaseKnowledge } from '../types';
import { ConfidenceBadge, SeverityBadge, HealthStatusBadge } from '../components/common/Badge';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Edit,
  Save,
  X,
  Layers,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'low-conf' | 'knowledge'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [lowConfScans, setLowConfScans] = useState<ScanRecord[]>([]);
  const [auditRatio, setAuditRatio] = useState<number>(0);
  const [diseases, setDiseases] = useState<DiseaseKnowledge[]>([]);
  const [editingDisease, setEditingDisease] = useState<DiseaseKnowledge | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    setSaveSuccessMsg(null);
    try {
      if (activeTab === 'users') {
        const res = await api.getAdminUsers();
        setUsers(res.users);
      } else if (activeTab === 'low-conf') {
        const res = await api.getAdminLowConfidenceScans();
        setLowConfScans(res.lowConfidenceScans);
        setAuditRatio(res.auditRatio);
      } else if (activeTab === 'knowledge') {
        const res = await api.getDiseases();
        setDiseases(res.diseases);
      }
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisease) return;

    try {
      await api.updateDiseaseKnowledge(editingDisease.id, editingDisease);
      setSaveSuccessMsg(`Knowledge base record for '${editingDisease.disease}' updated.`);
      setEditingDisease(null);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update disease:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Administrative Control Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Plant Pathology & System Administration
          </h1>
          <p className="text-xs text-slate-500">
            Audit low-confidence inferences, manage certified disease literature, and inspect active user records.
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('low-conf')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'low-conf' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Low-Confidence Scan Audit ({lowConfScans.length})
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'knowledge' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Disease Knowledge Editor ({diseases.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading admin dataset...</div>
      ) : activeTab === 'users' ? (
        /* Users List */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">User Registry</h3>
            <span className="text-xs text-slate-500">Total: {users.length} accounts</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-semibold">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Farm / Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-6">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/75">
                  <td className="py-3 px-6 font-semibold text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-4 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">{u.farmName || '—'}</td>
                  <td className="py-3 px-4">{u.location || '—'}</td>
                  <td className="py-3 px-6 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'low-conf' ? (
        /* Low Confidence Audit */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Low-Confidence Scans (Confidence &lt; 70% or LOW label): {lowConfScans.length} scans flagged for review.
              </span>
            </div>
            <span className="font-bold">Audit Ratio: {Math.round(auditRatio * 100)}% of total system scans</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-semibold">
                  <th className="py-3 px-6">Leaf</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Predicted Class</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-6">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lowConfScans.length > 0 ? (
                  lowConfScans.map(scan => (
                    <tr key={scan.id} className="hover:bg-slate-50/75">
                      <td className="py-3 px-6">
                        <img
                          src={scan.imageUrl}
                          alt={scan.crop}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{scan.crop}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{scan.disease}</td>
                      <td className="py-3 px-4">
                        <ConfidenceBadge level={scan.confidenceLevel} confidence={scan.confidence} />
                      </td>
                      <td className="py-3 px-4">
                        <SeverityBadge category={scan.severityCategory} percentage={scan.severity} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{new Date(scan.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-6 font-mono text-[11px] text-slate-400">{scan.userId}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No low-confidence scans detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Knowledge Base Editor */
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Disease List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {diseases.map(d => (
              <button
                key={d.id}
                onClick={() => setEditingDisease(d)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  editingDisease?.id === d.id
                    ? 'border-purple-500 bg-purple-50/60 font-semibold'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-bold">{d.crop}</div>
                <div className="text-xs font-bold text-slate-900">{d.disease}</div>
                <div className="text-[11px] italic text-slate-500 truncate">{d.scientificName}</div>
              </button>
            ))}
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-8">
            {editingDisease ? (
              <form onSubmit={handleSaveDisease} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-700">Editing Pathology Entry</span>
                    <h3 className="text-base font-bold text-slate-900">{editingDisease.crop}: {editingDisease.disease}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingDisease(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingDisease.description}
                    onChange={e => setEditingDisease({ ...editingDisease, description: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agronomic Warning (Disclaimer)</label>
                  <textarea
                    rows={2}
                    value={editingDisease.warning}
                    onChange={e => setEditingDisease({ ...editingDisease, warning: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Literature Sources (comma-separated)</label>
                  <input
                    type="text"
                    value={editingDisease.sources.join(', ')}
                    onChange={e => setEditingDisease({
                      ...editingDisease,
                      sources: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDisease(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    Save Knowledge Base Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                Select a disease to inspect or edit certified agronomic management entries.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
