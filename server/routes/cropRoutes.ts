import { Router, Request, Response } from 'express';
import { SUPPORTED_CROPS } from '../data/crops.js';

const router = Router();

// GET /api/crops - List supported crops
router.get('/', (req: Request, res: Response) => {
  res.json({
    crops: SUPPORTED_CROPS,
    count: SUPPORTED_CROPS.length
  });
});

// GET /api/crops/:id
router.get('/:id', (req: Request, res: Response): void => {
  const crop = SUPPORTED_CROPS.find(c => c.id.toLowerCase() === req.params.id.toLowerCase());
  if (!crop) {
    res.status(404).json({ error: `Crop '${req.params.id}' is not currently supported.` });
    return;
  }
  res.json({ crop });
});

export default router;
