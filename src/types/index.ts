export type Role = 'user' | 'admin' | 'expert';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  farmName?: string;
  location?: string;
  createdAt: string;
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  supportedDiseases: string[];
  icon: string;
}

export interface DiseaseKnowledge {
  id: string;
  crop: string;
  disease: string;
  scientificName: string;
  isHealthy: boolean;
  description: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  management: string[];
  warning: string;
  sources: string[];
  typicalSeverityRange: [number, number];
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SeverityCategory = 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
export type HealthScoreStatus = 'Healthy' | 'Good' | 'Needs Attention' | 'High Risk' | 'Critical';

export interface ImageQualityReport {
  valid: boolean;
  fileSize: number;
  width?: number;
  height?: number;
  brightness?: number;
  sharpness?: number;
  issues: string[];
  userFriendlyMessage?: string;
}

export interface WeatherRiskData {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  context: string;
  recommendation: string;
  temperatureAvg?: number;
  humidityAvg?: number;
}

export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  severity: number;
  severityCategory: SeverityCategory;
  healthScore: number;
  healthStatus: HealthScoreStatus;
  inferenceEngine: string;
  isMock: boolean;
  qualityReport: ImageQualityReport;
  recommendations: DiseaseKnowledge;
  analyzedAt: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  userFullName?: string;
  crop: string;
  disease: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  severity: number;
  severityCategory: SeverityCategory;
  healthScore: number;
  healthStatus: HealthScoreStatus;
  imageUrl: string;
  notes?: string;
  inferenceEngine: string;
  isMock: boolean;
  weatherRisk?: WeatherRiskData;
  createdAt: string;
}

export interface ScanComparison {
  id: string;
  previousScan: ScanRecord;
  currentScan: ScanRecord;
  severityDelta: number;
  healthScoreDelta: number;
  progressionStatus: 'improving' | 'stable' | 'worsening';
  summaryMessage: string;
  createdAt: string;
}

export interface ProgressionData {
  crop: string;
  totalScans: number;
  progressionDetected: boolean;
  improving: boolean;
  trendMessage: string;
  timelineData: {
    index: number;
    id: string;
    date: string;
    displayDate: string;
    severity: number;
    healthScore: number;
    disease: string;
    status: string;
    confidence: number;
    notes?: string;
  }[];
}

export interface DashboardStats {
  totalScans: number;
  healthyScans: number;
  diseasedScans: number;
  averageHealthScore: number;
  lowConfidenceCount: number;
  latestScan?: ScanRecord;
  diseaseDistribution: { name: string; count: number; crop: string }[];
  healthScoreTrend: { date: string; avgScore: number; count: number }[];
}
