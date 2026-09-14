import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { Security, AuthenticatedRequest } from '../core/security.js';

const router = Router();

// Apply admin authentication to all routes in this router
router.use(Security.authMiddleware);
router.use(Security.requireRole('admin'));

// GET /api/admin/users - View all registered users
router.get('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.getAllUsers();
    res.json({ users, count: users.length });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to retrieve user registry.' });
  }
});

// GET /api/admin/scans - View all scans across system
router.get('/scans', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allScans = await db.getAllScans();
    res.json({ scans: allScans, count: allScans.length });
  } catch (err) {
    console.error('Admin scans error:', err);
    res.status(500).json({ error: 'Failed to retrieve scan records.' });
  }
});

// GET /api/admin/scans/low-confidence - Audit low-confidence scans
router.get('/scans/low-confidence', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allScans = await db.getAllScans();
    const lowConf = allScans.filter(s => s.confidenceLevel === 'LOW' || s.confidence < 0.70);
    res.json({
      lowConfidenceScans: lowConf,
      count: lowConf.length,
      auditRatio: allScans.length > 0 ? parseFloat((lowConf.length / allScans.length).toFixed(3)) : 0
    });
  } catch (err) {
    console.error('Admin low confidence error:', err);
    res.status(500).json({ error: 'Failed to retrieve low-confidence audit log.' });
  }
});

// GET /api/admin/diseases - Manage knowledge base
router.get('/diseases', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const diseases = await db.getAllDiseases();
    res.json({ diseases });
  } catch (err) {
    console.error('Admin get diseases error:', err);
    res.status(500).json({ error: 'Failed to retrieve knowledge base.' });
  }
});

// PUT /api/admin/diseases/:id - Update disease guidance / prevention
router.put('/diseases/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, symptoms, causes, prevention, management, warning, sources } = req.body;

    const updated = await db.updateDiseaseKnowledge(id, {
      description,
      symptoms,
      causes,
      prevention,
      management,
      warning,
      sources
    });

    if (!updated) {
      res.status(404).json({ error: `Disease entry '${id}' not found.` });
      return;
    }

    res.json({ message: 'Disease knowledge base updated successfully.', disease: updated });
  } catch (err) {
    console.error('Admin update disease error:', err);
    res.status(500).json({ error: 'Failed to update disease knowledge.' });
  }
});

export default router;
