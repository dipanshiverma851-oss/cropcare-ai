import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { Security, AuthenticatedRequest } from '../core/security.js';
import { predictionServiceInstance } from '../services/predictionService.js';
import { weatherServiceInstance } from '../services/weatherService.js';
import { ScanRecord, ScanComparison } from '../types.js';

const router = Router();

// POST /api/scans/analyze - Run leaf quality check and AI disease diagnosis
router.post('/analyze', Security.optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { image, crop, location } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Please provide an image of the crop leaf.' });
      return;
    }

    if (!crop) {
      res.status(400).json({ error: 'Please select a crop type (Tomato, Potato, or Corn).' });
      return;
    }

    // Check if crop is in allowed list
    const allowed = ['tomato', 'potato', 'corn'];
    if (!allowed.includes(crop.toLowerCase())) {
      res.status(400).json({ error: `Crop '${crop}' is not currently supported. Only Tomato, Potato, and Corn are supported.` });
      return;
    }

    // Check historical trend if user is authenticated
    let recentTrendDelta: number | undefined;
    if (req.user) {
      const priorScans = await db.getCropProgression(req.user.userId, crop);
      if (priorScans.length > 0) {
        const lastScan = priorScans[priorScans.length - 1];
        // If prior scan had severity
        recentTrendDelta = lastScan.severity;
      }
    }

    // Run prediction workflow (Includes Image Quality Validation + ML + Severity + Health Score + Knowledge Base)
    let analysisResult;
    try {
      analysisResult = await predictionServiceInstance.analyzeLeaf(image, crop, recentTrendDelta);
    } catch (valErr: any) {
      res.status(422).json({
        error: valErr.message || 'Image quality is too low for reliable analysis. Please upload a clearer image showing the affected leaf.'
      });
      return;
    }

    // Attach contextual weather risk assessment
    const weatherRisk = await weatherServiceInstance.evaluateDiseaseRiskContext(crop, analysisResult.disease, location);

    res.json({
      result: analysisResult,
      weatherRisk: {
        riskLevel: weatherRisk.riskLevel,
        context: weatherRisk.contextualObservation,
        recommendation: weatherRisk.recommendation,
        temperatureAvg: weatherRisk.conditionsUsed.temperatureC,
        humidityAvg: weatherRisk.conditionsUsed.humidityPercent
      }
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Something went wrong during crop analysis. Please try again.' });
  }
});

// POST /api/scans - Save scan result to user's history
router.post('/', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required to save scans.' });
      return;
    }

    const {
      crop,
      disease,
      confidence,
      confidenceLevel,
      severity,
      severityCategory,
      healthScore,
      healthStatus,
      imageUrl,
      notes,
      inferenceEngine,
      isMock,
      weatherRisk
    } = req.body;

    if (!crop || !disease || confidence === undefined || severity === undefined || healthScore === undefined) {
      res.status(400).json({ error: 'Missing required scan metrics to save.' });
      return;
    }

    const user = await db.findUserById(req.user.userId);

    const scanRecord: ScanRecord = {
      id: `scn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user.userId,
      userFullName: user?.fullName || 'Farmer',
      crop,
      disease,
      confidence: parseFloat(confidence),
      confidenceLevel: confidenceLevel || 'HIGH',
      severity: parseInt(severity, 10),
      severityCategory: severityCategory || 'Mild',
      healthScore: parseInt(healthScore, 10),
      healthStatus: healthStatus || 'Good',
      imageUrl: imageUrl || '/samples/tomato_early_blight.jpg',
      notes: notes ? notes.trim() : undefined,
      inferenceEngine: inferenceEngine || 'MobileNetV2-Transfer',
      isMock: isMock ?? true,
      weatherRisk,
      createdAt: new Date().toISOString()
    };

    await db.saveScan(scanRecord);
    res.status(201).json({ message: 'Scan successfully saved to your farm history.', scan: scanRecord });
  } catch (err) {
    console.error('Save scan error:', err);
    res.status(500).json({ error: 'Failed to save scan record.' });
  }
});

// GET /api/scans/history - Filtered scan history
router.get('/history', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { crop, disease, status, search, sortBy } = req.query;

    const scans = await db.getUserScans(req.user.userId, {
      crop: crop as string,
      disease: disease as string,
      status: status as string,
      search: search as string,
      sortBy: sortBy as any
    });

    res.json({ scans, count: scans.length });
  } catch (err) {
    console.error('Scan history error:', err);
    res.status(500).json({ error: 'Failed to retrieve scan history.' });
  }
});

// GET /api/scans/progression/:crop - Disease progression chart data
router.get('/progression/:crop', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { crop } = req.params;
    const scans = await db.getCropProgression(req.user.userId, crop);

    // Analyze progression slope if >= 2 scans exist
    let progressionDetected = false;
    let improving = false;
    let trendMessage = 'Insufficient historical scans to establish disease progression curve.';

    if (scans.length >= 2) {
      const first = scans[0];
      const last = scans[scans.length - 1];
      const severityDelta = last.severity - first.severity;

      if (severityDelta > 5) {
        progressionDetected = true;
        trendMessage = '⚠ Disease progression detected. Affected leaf surface area has expanded across consecutive scans.';
      } else if (severityDelta < -5) {
        improving = true;
        trendMessage = '✓ Crop condition appears to be improving. Symptom severity exhibits a downward trend.';
      } else {
        trendMessage = 'Crop condition appears relatively stable with minimal symptom variance.';
      }
    }

    const timelineData = scans.map((s, idx) => ({
      index: idx + 1,
      id: s.id,
      date: s.createdAt.substring(0, 10),
      displayDate: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      severity: s.severity,
      healthScore: s.healthScore,
      disease: s.disease,
      status: s.healthStatus,
      confidence: Math.round(s.confidence * 100),
      notes: s.notes
    }));

    res.json({
      crop,
      totalScans: scans.length,
      progressionDetected,
      improving,
      trendMessage,
      timelineData
    });
  } catch (err) {
    console.error('Progression error:', err);
    res.status(500).json({ error: 'Failed to generate progression curve.' });
  }
});

// GET /api/scans/:id/compare - Compare with previous or specified scan
router.get('/:id/compare', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const currentScan = await db.getScanById(req.params.id);
    if (!currentScan) {
      res.status(404).json({ error: 'Current scan not found.' });
      return;
    }

    const { targetScanId } = req.query;
    let previousScan: ScanRecord | null = null;

    if (targetScanId && typeof targetScanId === 'string') {
      previousScan = await db.getScanById(targetScanId);
    } else {
      // Find previous scan of the same crop prior to this scan's timestamp
      const allCropScans = await db.getCropProgression(req.user.userId, currentScan.crop);
      const currentIndex = allCropScans.findIndex(s => s.id === currentScan.id);
      if (currentIndex > 0) {
        previousScan = allCropScans[currentIndex - 1];
      } else if (allCropScans.length > 1) {
        previousScan = allCropScans[0];
      }
    }

    if (!previousScan) {
      res.status(404).json({ error: `No previous scan found for ${currentScan.crop} to compare against.` });
      return;
    }

    const severityDelta = currentScan.severity - previousScan.severity;
    const healthScoreDelta = currentScan.healthScore - previousScan.healthScore;

    let progressionStatus: 'improving' | 'stable' | 'worsening' = 'stable';
    if (severityDelta > 3) progressionStatus = 'worsening';
    else if (severityDelta < -3) progressionStatus = 'improving';

    const sevChangeText = severityDelta >= 0
      ? `Severity increased by ${severityDelta} percentage points.`
      : `Severity decreased by ${Math.abs(severityDelta)} percentage points.`;

    const scoreChangeText = healthScoreDelta >= 0
      ? `Crop Health Score increased by ${healthScoreDelta} points.`
      : `Crop Health Score decreased by ${Math.abs(healthScoreDelta)} points.`;

    let progressionNote = 'Disease progression detected.';
    if (progressionStatus === 'improving') {
      progressionNote = 'Crop condition appears to be improving.';
    } else if (progressionStatus === 'stable') {
      progressionNote = 'Crop symptoms appear stable.';
    }

    const summaryMessage = `${sevChangeText} ${scoreChangeText} ${progressionNote}`;

    const comparison: ScanComparison = {
      id: `cmp_${Date.now()}`,
      previousScan,
      currentScan,
      severityDelta,
      healthScoreDelta,
      progressionStatus,
      summaryMessage,
      createdAt: new Date().toISOString()
    };

    await db.saveComparison(comparison);
    res.json({ comparison });
  } catch (err) {
    console.error('Comparison error:', err);
    res.status(500).json({ error: 'Failed to compute scan comparison.' });
  }
});

// GET /api/scans/:id - Single scan detail
router.get('/:id', Security.authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const scan = await db.getScanById(req.params.id);
    if (!scan) {
      res.status(404).json({ error: 'Scan record not found.' });
      return;
    }

    // Attach full knowledge base recommendations
    const recommendations = predictionServiceInstance.getRecommendations(scan.crop, scan.disease);

    res.json({
      scan,
      recommendations
    });
  } catch (err) {
    console.error('Scan detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve scan record.' });
  }
});

// GET /api/scans/engine/active - Engine inspection
router.get('/engine/active', (req, res) => {
  res.json(predictionServiceInstance.getActiveEngineInfo());
});

export default router;
