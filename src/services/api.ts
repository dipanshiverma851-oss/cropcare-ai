import {
  User,
  Crop,
  DiseaseKnowledge,
  PredictionResult,
  ScanRecord,
  ScanComparison,
  ProgressionData,
  DashboardStats,
  WeatherRiskData
} from '../types';

const TOKEN_KEY = 'cropcare_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(res.token);
    return res;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    farmName?: string;
    location?: string;
    role?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  logout(): void {
    removeStoredToken();
  },

  // Crops
  async getCrops(): Promise<{ crops: Crop[] }> {
    return request<{ crops: Crop[] }>('/api/crops');
  },

  // Diseases
  async getDiseases(crop?: string): Promise<{ diseases: DiseaseKnowledge[] }> {
    const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
    return request<{ diseases: DiseaseKnowledge[] }>(`/api/diseases${query}`);
  },

  async getDisease(id: string): Promise<{ disease: DiseaseKnowledge }> {
    return request<{ disease: DiseaseKnowledge }>(`/api/diseases/${id}`);
  },

  // Scans
  async analyzeLeaf(payload: {
    image: string;
    crop: string;
    location?: string;
  }): Promise<{ result: PredictionResult; weatherRisk?: WeatherRiskData }> {
    return request<{ result: PredictionResult; weatherRisk?: WeatherRiskData }>('/api/scans/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async saveScan(scanData: Partial<ScanRecord>): Promise<{ message: string; scan: ScanRecord }> {
    return request<{ message: string; scan: ScanRecord }>('/api/scans', {
      method: 'POST',
      body: JSON.stringify(scanData)
    });
  },

  async getScanHistory(params?: {
    crop?: string;
    disease?: string;
    status?: string;
    search?: string;
    sortBy?: string;
  }): Promise<{ scans: ScanRecord[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.crop) searchParams.append('crop', params.crop);
    if (params?.disease) searchParams.append('disease', params.disease);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ scans: ScanRecord[]; count: number }>(`/api/scans/history${qs}`);
  },

  async getScanDetails(id: string): Promise<{ scan: ScanRecord; recommendations: DiseaseKnowledge }> {
    return request<{ scan: ScanRecord; recommendations: DiseaseKnowledge }>(`/api/scans/${id}`);
  },

  async compareScans(id: string, targetScanId?: string): Promise<{ comparison: ScanComparison }> {
    const qs = targetScanId ? `?targetScanId=${encodeURIComponent(targetScanId)}` : '';
    return request<{ comparison: ScanComparison }>(`/api/scans/${id}/compare${qs}`);
  },

  async getProgression(crop: string): Promise<ProgressionData> {
    return request<ProgressionData>(`/api/scans/progression/${encodeURIComponent(crop)}`);
  },

  // Dashboard
  async getDashboardStats(): Promise<{ stats: DashboardStats; recentScans: ScanRecord[] }> {
    return request<{ stats: DashboardStats; recentScans: ScanRecord[] }>('/api/dashboard/stats');
  },

  // Admin
  async getAdminUsers(): Promise<{ users: User[]; count: number }> {
    return request<{ users: User[]; count: number }>('/api/admin/users');
  },

  async getAdminScans(): Promise<{ scans: ScanRecord[]; count: number }> {
    return request<{ scans: ScanRecord[]; count: number }>('/api/admin/scans');
  },

  async getAdminLowConfidenceScans(): Promise<{
    lowConfidenceScans: ScanRecord[];
    count: number;
    auditRatio: number;
  }> {
    return request<{
      lowConfidenceScans: ScanRecord[];
      count: number;
      auditRatio: number;
    }>('/api/admin/scans/low-confidence');
  },

  async updateDiseaseKnowledge(id: string, data: Partial<DiseaseKnowledge>): Promise<{ disease: DiseaseKnowledge }> {
    return request<{ disease: DiseaseKnowledge }>(`/api/admin/diseases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
