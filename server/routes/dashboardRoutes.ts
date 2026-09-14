import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { Security, AuthenticatedRequest } from '../core/security.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', Security.optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const stats = await db.getDashboardStats(userId);
    const recentScans = userId ? await db.getUserScans(userId, { sortBy: 'newest' }) : await db.getAllScans();

    res.json({
      stats,
      recentScans: recentScans.slice(0, 5)
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard telemetry.' });
  }
});

export default router;
