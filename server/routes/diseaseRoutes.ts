import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET /api/diseases - List disease knowledge entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const diseases = await db.getAllDiseases();
    const { crop } = req.query;

    if (crop && typeof crop === 'string') {
      const filtered = diseases.filter(d => d.crop.toLowerCase() === crop.toLowerCase());
      res.json({ diseases: filtered, count: filtered.length });
      return;
    }

    res.json({ diseases, count: diseases.length });
  } catch (err) {
    console.error('Error fetching diseases:', err);
    res.status(500).json({ error: 'Failed to retrieve disease knowledge base.' });
  }
});

// GET /api/diseases/:id - Single disease details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const disease = await db.getDiseaseById(req.params.id);
    if (!disease) {
      res.status(404).json({ error: 'Disease information not found in knowledge base.' });
      return;
    }
    res.json({ disease });
  } catch (err) {
    console.error('Error fetching disease:', err);
    res.status(500).json({ error: 'Failed to retrieve disease information.' });
  }
});

export default router;
