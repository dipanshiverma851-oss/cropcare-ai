import fs from 'fs';
import path from 'path';
import { User, ScanRecord, DiseaseKnowledge, DashboardStats, ScanComparison } from '../types.js';
import { SUPPORTED_CROPS } from '../data/crops.js';
import { Security } from '../core/security.js';

interface DatabaseSchema {
  users: User[];
  scans: ScanRecord[];
  diseases: DiseaseKnowledge[];
  comparisons: ScanComparison[];
}

export class Database {
  private static instance: Database;
  private dbPath: string;
  private data: DatabaseSchema;

  private constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'cropcare_db.json');
    this.data = this.loadOrInitialize();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse database file, reinitializing with seeds:', e);
      }
    }

    const defaultKbPath = path.join(process.cwd(), 'server', 'knowledge_base', 'diseases.json');
    let diseases: DiseaseKnowledge[] = [];
    if (fs.existsSync(defaultKbPath)) {
      try {
        diseases = JSON.parse(fs.readFileSync(defaultKbPath, 'utf-8'));
      } catch (err) {
        console.error('Error reading default KB:', err);
      }
    }

    // Initialize with pre-hashed seed passwords
    // Note: bcrypt.hashSync is used here during initial boot sync
    const userPasswordHash = '$2a$10$j8dF4H3Y8G7Q0gNl3Cq4OecN1Y9iR9sI2UeXy5S9aXfI6k4t4vVem'; // 'farmer123'
    const adminPasswordHash = '$2a$10$6uP0cQ3L3A0c8p2vFz8Ute0U9k4W4Z6fT5rA7eY3k1sO8wQ2t7n5a'; // 'admin123'

    const seedUsers: User[] = [
      {
        id: 'usr_farmer_01',
        email: 'farmer@cropcare.ai',
        passwordHash: userPasswordHash,
        fullName: 'Rajesh Kumar',
        role: 'user',
        farmName: 'Green Valley Organic Farms',
        location: 'Plot 4B, North Ridge Agro-Zone',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'usr_admin_01',
        email: 'admin@cropcare.ai',
        passwordHash: adminPasswordHash,
        fullName: 'Dr. Sarah Chen',
        role: 'admin',
        farmName: 'Regional Plant Pathology Institute',
        location: 'Department of Agricultural Sciences',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
      }
    ];

    // Seed realistic progression scans for Rajesh Kumar (Farmer)
    const seedScans: ScanRecord[] = [
      {
        id: 'scn_tom_01',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Tomato',
        disease: 'Early Blight',
        confidence: 0.94,
        confidenceLevel: 'HIGH',
        severity: 8,
        severityCategory: 'Mild',
        healthScore: 84,
        healthStatus: 'Good',
        imageUrl: '/samples/tomato_early_blight.jpg',
        notes: 'First observed small brownish target spots on lower foliage during morning scouting.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        weatherRisk: {
          riskLevel: 'MODERATE',
          context: 'Alternating warm days and morning dew favor Alternaria spore emergence.',
          temperatureAvg: 24,
          humidityAvg: 68
        },
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: 'scn_tom_02',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Tomato',
        disease: 'Early Blight',
        confidence: 0.91,
        confidenceLevel: 'HIGH',
        severity: 14,
        severityCategory: 'Mild',
        healthScore: 78,
        healthStatus: 'Good',
        imageUrl: '/samples/tomato_early_blight.jpg',
        notes: 'Target lesions expanding with yellow halos. Applied organic mulch around base.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        weatherRisk: {
          riskLevel: 'HIGH',
          context: 'Consecutive damp nights accelerated lesion coalescence.',
          temperatureAvg: 23,
          humidityAvg: 79
        },
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'scn_tom_03',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Tomato',
        disease: 'Early Blight',
        confidence: 0.95,
        confidenceLevel: 'HIGH',
        severity: 23,
        severityCategory: 'Moderate',
        healthScore: 68,
        healthStatus: 'Needs Attention',
        imageUrl: '/samples/tomato_early_blight.jpg',
        notes: 'Active disease progression. Pruning lower 3 tiers of affected foliage today.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        weatherRisk: {
          riskLevel: 'HIGH',
          context: 'High humidity ongoing.',
          temperatureAvg: 25,
          humidityAvg: 81
        },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'scn_pot_01',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Potato',
        disease: 'Healthy',
        confidence: 0.96,
        confidenceLevel: 'HIGH',
        severity: 1,
        severityCategory: 'Healthy',
        healthScore: 97,
        healthStatus: 'Healthy',
        imageUrl: '/samples/potato_late_blight.jpg',
        notes: 'Bed 3 potato vines looking exceptionally vigorous after hilling.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'scn_corn_01',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Corn',
        disease: 'Common Rust',
        confidence: 0.88,
        confidenceLevel: 'HIGH',
        severity: 18,
        severityCategory: 'Moderate',
        healthScore: 72,
        healthStatus: 'Good',
        imageUrl: '/samples/corn_common_rust.jpg',
        notes: 'Scattered cinnamon-brown pustules noticed on ear leaf during V8 growth check.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'scn_corn_02',
        userId: 'usr_farmer_01',
        userFullName: 'Rajesh Kumar',
        crop: 'Corn',
        disease: 'Healthy',
        confidence: 0.94,
        confidenceLevel: 'HIGH',
        severity: 2,
        severityCategory: 'Healthy',
        healthScore: 96,
        healthStatus: 'Healthy',
        imageUrl: '/samples/corn_common_rust.jpg',
        notes: 'Section West 2 hybrid showing strong resistance with clean leaf blades.',
        inferenceEngine: 'MobileNetV2-Transfer (Simulated Weights)',
        isMock: true,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    const initialDb: DatabaseSchema = {
      users: seedUsers,
      scans: seedScans,
      diseases,
      comparisons: []
    };

    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving initial database file:', err);
    }

    return initialDb;
  }

  private save(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Users
  public async findUserByEmail(email: string): Promise<User | null> {
    const norm = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === norm) || null;
  }

  public async findUserById(id: string): Promise<User | null> {
    return this.data.users.find(u => u.id === id) || null;
  }

  public async createUser(user: User): Promise<User> {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return this.data.users.map(({ passwordHash, ...u }) => u as User);
  }

  // Diseases
  public async getAllDiseases(): Promise<DiseaseKnowledge[]> {
    return this.data.diseases;
  }

  public async getDiseaseById(id: string): Promise<DiseaseKnowledge | null> {
    return this.data.diseases.find(d => d.id === id) || null;
  }

  public async updateDiseaseKnowledge(id: string, updates: Partial<DiseaseKnowledge>): Promise<DiseaseKnowledge | null> {
    const idx = this.data.diseases.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.diseases[idx] = { ...this.data.diseases[idx], ...updates };
    this.save();
    return this.data.diseases[idx];
  }

  // Scans
  public async saveScan(scan: ScanRecord): Promise<ScanRecord> {
    this.data.scans.unshift(scan);
    this.save();
    return scan;
  }

  public async getScanById(id: string): Promise<ScanRecord | null> {
    return this.data.scans.find(s => s.id === id) || null;
  }

  public async getUserScans(
    userId: string,
    filters?: {
      crop?: string;
      disease?: string;
      status?: string;
      search?: string;
      sortBy?: 'newest' | 'oldest' | 'health_asc' | 'health_desc';
    }
  ): Promise<ScanRecord[]> {
    let scans = this.data.scans.filter(s => s.userId === userId);

    if (filters?.crop && filters.crop !== 'ALL') {
      scans = scans.filter(s => s.crop.toLowerCase() === filters.crop!.toLowerCase());
    }

    if (filters?.disease && filters.disease !== 'ALL') {
      scans = scans.filter(s => s.disease.toLowerCase() === filters.disease!.toLowerCase());
    }

    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'HEALTHY') {
        scans = scans.filter(s => s.disease.toLowerCase() === 'healthy');
      } else if (filters.status === 'DISEASED') {
        scans = scans.filter(s => s.disease.toLowerCase() !== 'healthy');
      } else if (filters.status === 'LOW_CONFIDENCE') {
        scans = scans.filter(s => s.confidenceLevel === 'LOW');
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      scans = scans.filter(
        s =>
          s.crop.toLowerCase().includes(q) ||
          s.disease.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    const sort = filters?.sortBy || 'newest';
    scans.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'health_asc') return a.healthScore - b.healthScore;
      if (sort === 'health_desc') return b.healthScore - a.healthScore;
      return 0;
    });

    return scans;
  }

  public async getAllScans(): Promise<ScanRecord[]> {
    return this.data.scans;
  }

  // Progression & Comparisons
  public async getCropProgression(userId: string, crop: string): Promise<ScanRecord[]> {
    return this.data.scans
      .filter(s => s.userId === userId && s.crop.toLowerCase() === crop.toLowerCase())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async saveComparison(comparison: ScanComparison): Promise<ScanComparison> {
    this.data.comparisons.unshift(comparison);
    this.save();
    return comparison;
  }

  // Dashboard Aggregates
  public async getDashboardStats(userId?: string): Promise<DashboardStats> {
    const scans = userId ? this.data.scans.filter(s => s.userId === userId) : this.data.scans;

    const totalScans = scans.length;
    const healthyScans = scans.filter(s => s.disease.toLowerCase() === 'healthy').length;
    const diseasedScans = totalScans - healthyScans;
    const lowConfidenceCount = scans.filter(s => s.confidenceLevel === 'LOW').length;

    const totalScore = scans.reduce((acc, s) => acc + s.healthScore, 0);
    const averageHealthScore = totalScans > 0 ? Math.round(totalScore / totalScans) : 95;

    // Disease breakdown
    const distributionMap: Record<string, { count: number; crop: string }> = {};
    for (const s of scans) {
      const key = `${s.crop}: ${s.disease}`;
      if (!distributionMap[key]) {
        distributionMap[key] = { count: 0, crop: s.crop };
      }
      distributionMap[key].count++;
    }

    const diseaseDistribution = Object.entries(distributionMap).map(([name, data]) => ({
      name,
      count: data.count,
      crop: data.crop
    }));

    // Health Score Trend across days
    const trendMap: Record<string, { totalScore: number; count: number }> = {};
    for (const s of scans) {
      const day = s.createdAt.substring(0, 10);
      if (!trendMap[day]) {
        trendMap[day] = { totalScore: 0, count: 0 };
      }
      trendMap[day].totalScore += s.healthScore;
      trendMap[day].count++;
    }

    const healthScoreTrend = Object.entries(trendMap)
      .map(([date, val]) => ({
        date,
        avgScore: Math.round(val.totalScore / val.count),
        count: val.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalScans,
      healthyScans,
      diseasedScans,
      averageHealthScore,
      lowConfidenceCount,
      latestScan: scans[0],
      diseaseDistribution,
      healthScoreTrend
    };
  }
}

export const db = Database.getInstance();
