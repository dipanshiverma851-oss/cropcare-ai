import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanResultPage } from './pages/ScanResultPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ScanDetailsPage } from './pages/ScanDetailsPage';
import { CompareScansPage } from './pages/CompareScansPage';
import { DiseaseProgressionPage } from './pages/DiseaseProgressionPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AdminPage } from './pages/AdminPage';

import { PredictionResult, WeatherRiskData } from './types';
import { SampleLeaf } from './data/sampleLeaves';

function MainLayout() {
  const { isAuthenticated, user } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Page parameters
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [compareTargetId, setCompareTargetId] = useState<string | null>(null);
  const [selectedProgressionCrop, setSelectedProgressionCrop] = useState<string>('Tomato');
  const [selectedLibraryCrop, setSelectedLibraryCrop] = useState<string>('All');
  const [activeSampleLeaf, setActiveSampleLeaf] = useState<SampleLeaf | null>(null);

  // Active scan analysis result state
  const [activeResult, setActiveResult] = useState<{
    result: PredictionResult;
    image: string;
    weatherRisk?: WeatherRiskData;
  } | null>(null);

  // Auto-switch to dashboard when user logs in if currently on landing
  React.useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartScanFromLanding = (sample?: SampleLeaf) => {
    setActiveSampleLeaf(sample || null);
    setCurrentView('new-scan');
  };

  const handleAnalysisComplete = (
    result: PredictionResult,
    image: string,
    weatherRisk?: WeatherRiskData
  ) => {
    setActiveResult({ result, image, weatherRisk });
    setCurrentView('scan-result');
  };

  const handleViewScanDetails = (scanId: string) => {
    setSelectedScanId(scanId);
    setCurrentView('scan-details');
  };

  const handleCompareScans = (scanId1: string, scanId2?: string) => {
    setSelectedScanId(scanId1);
    setCompareTargetId(scanId2 || null);
    setCurrentView('compare');
  };

  const handleViewProgression = (crop: string) => {
    setSelectedProgressionCrop(crop);
    setCurrentView('progression');
  };

  const handleSelectCropLibrary = (crop: string) => {
    setSelectedLibraryCrop(crop);
    setCurrentView('library');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'new-scan') {
            setActiveSampleLeaf(null);
          }
          setCurrentView(view);
        }}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartScan={handleStartScanFromLanding}
            onOpenAuth={handleOpenAuth}
            onSelectCropLibrary={handleSelectCropLibrary}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onStartNewScan={() => {
              setActiveSampleLeaf(null);
              setCurrentView('new-scan');
            }}
            onViewScanDetails={handleViewScanDetails}
            onCompareScans={(scanId) => handleCompareScans(scanId)}
            onViewProgression={handleViewProgression}
            onViewHistory={() => setCurrentView('history')}
          />
        )}

        {currentView === 'new-scan' && (
          <NewScanPage
            initialSample={activeSampleLeaf}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'scan-result' && activeResult && (
          <ScanResultPage
            result={activeResult.result}
            image={activeResult.image}
            weatherRisk={activeResult.weatherRisk}
            onSaveSuccess={(scanId) => {
              setSelectedScanId(scanId);
            }}
            onCompareWithPrevious={(scanId) => {
              handleCompareScans(scanId || selectedScanId || '');
            }}
            onStartNewScan={() => {
              setActiveSampleLeaf(null);
              setCurrentView('new-scan');
            }}
          />
        )}

        {currentView === 'history' && (
          <ScanHistoryPage
            onViewScanDetails={handleViewScanDetails}
            onCompareScans={handleCompareScans}
            onStartNewScan={() => {
              setActiveSampleLeaf(null);
              setCurrentView('new-scan');
            }}
          />
        )}

        {currentView === 'scan-details' && selectedScanId && (
          <ScanDetailsPage
            scanId={selectedScanId}
            onBack={() => setCurrentView('history')}
            onCompare={(id) => handleCompareScans(id)}
            onViewProgression={handleViewProgression}
          />
        )}

        {currentView === 'compare' && (
          <CompareScansPage
            initialScanId={selectedScanId || undefined}
            targetScanId={compareTargetId || undefined}
            onBack={() => setCurrentView('history')}
            onViewScanDetails={handleViewScanDetails}
          />
        )}

        {currentView === 'progression' && (
          <DiseaseProgressionPage
            initialCrop={selectedProgressionCrop}
            onViewScanDetails={handleViewScanDetails}
            onCompareScans={handleCompareScans}
          />
        )}

        {currentView === 'library' && (
          <KnowledgeBasePage initialCrop={selectedLibraryCrop} />
        )}

        {currentView === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
