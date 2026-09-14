export type Role = 'user' | 'admin' | 'expert';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
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
  typicalSeverityRange: [number, number]; // min, max %
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SeverityCategory = 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
export type HealthScoreStatus = 'Healthy' | 'Good' | 'Needs Attention' | 'High Risk' | 'Critical';

export interface ImageQualityReport {
  valid: boolean;
  fileSize: number;
  width?: number;
  height?: number;
  brightness?: number; // 0-255
  sharpness?: number; // Laplacian variance approx
  issues: string[];
  userFriendlyMessage?: string;
}

export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  severity: number; // 0-100 percentage
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
  weatherRisk?: {
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    context: string;
    temperatureAvg?: number;
    humidityAvg?: number;
  };
  createdAt: string;
}

export interface ScanComparison {
  id: string;
  previousScan: ScanRecord;
  currentScan: ScanRecord;
  severityDelta: number; // positive = increased severity
  healthScoreDelta: number; // negative = decreased health
  progressionStatus: 'improving' | 'stable' | 'worsening';
  summaryMessage: string;
  createdAt: string;
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
