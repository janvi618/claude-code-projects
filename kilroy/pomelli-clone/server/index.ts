import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import extractRoute from './routes/extract.js';
import generateRoute from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite and typical React dev server ports
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for large HTML content

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', extractRoute);
app.use('/api', generateRoute);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💻 API available at http://localhost:${PORT}/api`);
  
  // Check for required environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  Warning: ANTHROPIC_API_KEY not set. AI features will not work.');
  }
  
  if (process.env.DEMO_MODE === 'true') {
    console.log('🎭 Demo mode enabled - using cached brand profiles');
  }
});