import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DiseaseKnowledge } from '../types';
import { SUPPORTED_CROPS } from '../../server/data/crops';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Shield,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Sprout
} from 'lucide-react';

interface KnowledgeBasePageProps {
  initialCrop?: string;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ initialCrop }) => {
  const [diseases, setDiseases] = useState<DiseaseKnowledge[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop || 'All');
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKnowledge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiseases();
  }, [selectedCrop]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const res = await api.getDiseases(selectedCrop === 'All' ? undefined : selectedCrop);
      setDiseases(res.diseases);
      if (res.diseases.length > 0 && !selectedDisease) {
        setSelectedDisease(res.diseases[0]);
      }
    } catch (err) {
      console.error('Failed to load diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = diseases.filter(d => {
    const q = search.toLowerCase();
    return (
      d.disease.toLowerCase().includes(q) ||
      d.crop.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Agricultural Disease & Pathology Library
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Controlled agronomic knowledge repository with verified symptoms, cultural practices, and preventive guidelines.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Crop Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setSelectedCrop('All'); setSelectedDisease(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCrop === 'All'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Crops
          </button>
          {SUPPORTED_CROPS.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedCrop(c.name); setSelectedDisease(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                selectedCrop.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, diseases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Two-Column Library Browser */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-2 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading catalog...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No diseases found.</div>
          ) : (
            filtered.map(d => {
              const isSelected = selectedDisease?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDisease(d)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {d.crop}
                    </span>
                    {d.isHealthy ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Healthy
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pathogen
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{d.disease}</div>
                  <div className="text-[11px] italic text-slate-500 truncate">{d.scientificName}</div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Pathology Entry */}
        <div className="lg:col-span-8">
          {selectedDisease ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedDisease.crop} Foliage
                  </span>
                  <span className="text-xs italic text-slate-500">
                    Causal Agent: {selectedDisease.scientificName}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedDisease.disease}
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedDisease.description}
                </p>
              </div>

              {/* Symptoms Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Primary Foliar Symptoms
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedDisease.symptoms.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Causes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Etiology & Environmental Causes
                </h3>
                <ul className="space-y-1.5">
                  {selectedDisease.causes.map((c, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Management & Prevention */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Cultural Management Practices
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {selectedDisease.management.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Long-Term Preventive Measures
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedDisease.prevention.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Advisory Warning */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Agronomic Warning:</div>
                  <p className="mt-0.5 leading-relaxed text-amber-800">{selectedDisease.warning}</p>
                </div>
              </div>

              {/* Sources */}
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Agronomic Literature Reference:</span>
                <span className="font-medium text-slate-600">{selectedDisease.sources.join(' • ')}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a disease from the left panel to inspect pathology guidelines.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
