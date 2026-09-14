import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './server/routes/authRoutes.js';
import cropRoutes from './server/routes/cropRoutes.js';
import diseaseRoutes from './server/routes/diseaseRoutes.js';
import scanRoutes from './server/routes/scanRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON body with large limit for leaf image base64 payloads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CropCare AI Engine',
      supportedCrops: ['Tomato', 'Potato', 'Corn'],
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/diseases', diseaseRoutes);
  app.use('/api/scans', scanRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admin', adminRoutes);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CropCare AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
