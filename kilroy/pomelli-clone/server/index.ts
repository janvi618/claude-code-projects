import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRoute from './routes/extract.js';
import generateRoute from './routes/generate.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

const app = express();
const PORT = process.env.PORT || 3001;

// In dev, only allow Vite dev server origins. In production, same-origin so CORS is irrelevant.
app.use(cors({
  origin: isProd ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', extractRoute);
app.use('/api', generateRoute);

// Serve built React app in production
if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💻 API available at http://localhost:${PORT}/api`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  Warning: ANTHROPIC_API_KEY not set. AI features will not work.');
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not set. Image generation will not work.');
  }
  if (process.env.DEMO_MODE === 'true') {
    console.log('🎭 Demo mode enabled - using cached brand profiles');
  }
});