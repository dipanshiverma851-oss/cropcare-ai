import React, { useState } from 'react';
import { Sprout, ShieldCheck, Activity, TrendingUp, Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SAMPLE_LEAVES, SampleLeaf } from '../data/sampleLeaves';
import { SUPPORTED_CROPS } from '../../server/data/crops';

interface LandingPageProps {
  onStartScan: (sample?: SampleLeaf) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectCropLibrary: (crop: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartScan,
  onOpenAuth,
  onSelectCropLibrary
}) => {
  const [selectedSample, setSelectedSample] = useState<SampleLeaf>(SAMPLE_LEAVES[0]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-linear-to-b from-emerald-50/80 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Next-Gen Foliar Diagnostics & Field Progression Tracking
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Intelligent Crop Disease Detection & Health Monitoring
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Upload a single leaf photo to receive real-time crop identification, disease classification,
                affected area severity estimation, and dynamic Crop Health Scores backed by controlled agricultural pathology standards.
              </p>

              {/* Supported Crops Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-medium text-slate-500 mr-1">Initial Supported Crops:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs">
                  🍅 Tomato
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs">
                  🥔 Potato
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs">
                  🌽 Corn (Maize)
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => onStartScan()}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-700/20 transition-all"
                >
                  <Sprout className="w-4 h-4" />
                  Analyze a Leaf Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition-colors"
                >
                  Sign In to Dashboard
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <div className="text-xl font-bold text-slate-900">0–100</div>
                  <div className="text-xs text-slate-500 font-medium">Crop Health Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">4 Bands</div>
                  <div className="text-xs text-slate-500 font-medium">Severity Estimation</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Controlled Knowledge</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Leaf Test Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Interactive Diagnostic Preview
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                    Quick Sample Selector
                  </span>
                </div>

                <div className="mt-4">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={selectedSample.imageUrl}
                      alt={selectedSample.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {selectedSample.crop} Leaf
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-sm text-xs">
                      <div className="font-semibold text-slate-900">{selectedSample.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{selectedSample.description}</p>
                    </div>
                  </div>

                  {/* Sample Selector Buttons */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {SAMPLE_LEAVES.map(sample => (
                      <button
                        key={sample.id}
                        onClick={() => setSelectedSample(sample)}
                        className={`px-2.5 py-2 text-left rounded-lg text-xs transition-all border ${
                          selectedSample.id === sample.id
                            ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="font-medium truncate">{sample.crop}: {sample.expectedDisease}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onStartScan(selectedSample)}
                    className="w-full mt-4 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    Run Full AI Diagnostic on this Leaf
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Complete Agricultural Pathology Workflow
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From leaf inspection to disease progression curves, CropCare AI bridges laboratory-grade pathology knowledge with field-level accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Quality Validation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rejects blurry, severely underexposed, or low-resolution images before prediction to prevent misdiagnosis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Modular Inference</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MobileNetV2 transfer classification with confidence thresholds and clear dev/mock transparency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Severity & Health Score</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estimates affected surface area percentage (Healthy, Mild, Moderate, Severe) and computes a 0–100 Health Score.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Progression & Comparison</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tracks changes across Day 1, Day 7, and Day 14 scans to confirm whether crop condition is improving or worsening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Crops & Diseases Grid */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Target Crop Coverage
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Target Crops & Configurable Pathologies
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md mt-2 md:mt-0">
              We strictly bound predictions to verifiable crop-pathogen combinations rather than making unsupported diagnostic claims.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SUPPORTED_CROPS.map(c => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{c.icon}</div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Supported
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs italic text-slate-500 mb-3">{c.scientificName}</p>
                <p className="text-xs text-slate-600 mb-4">{c.description}</p>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-2">Classified Classes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.supportedDiseases.map(d => (
                      <span
                        key={d}
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          d === 'Healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectCropLibrary(c.name)}
                  className="mt-5 w-full py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                >
                  Browse Knowledge Base & Management Guides
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Controlled Knowledge Base Banner */}
      <section className="py-12 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-800 text-emerald-300 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Controlled Pathology Standards</h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                  CropCare AI recommendations derive exclusively from vetted agricultural extension literature (FAO, UC Davis IPM, USDA ARS). We do not generate unverified chemical doses or dangerous treatment claims.
                </p>
              </div>
            </div>
            <button
              onClick={() => onStartScan()}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 shrink-0 transition-colors shadow-lg shadow-black/20"
            >
              Start New Leaf Scan
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">CropCare AI</span>
            <span>- Production Plant Pathology Decision Support Platform</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Transfer Learning MobileNetV2 Architecture & Controlled Agronomic Library
          </div>
        </div>
      </footer>
    </div>
  );
};
