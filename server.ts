import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import 'dotenv/config';
import apiRouter from './src/server/routes.ts';
import { seedPresetAudioFiles } from './src/server/generateAudio.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Ensure preset audio files exist in /uploads
  seedPresetAudioFiles();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded media files
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Mount API router
  app.use('/api', apiRouter);

  // In production or development
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASAFA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start ASAFA server:', err);
});
