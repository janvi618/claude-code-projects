import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Strategy Command Center API',
    version: '1.0.0',
    endpoints: [
      'POST /api/analyze-threat',
      'POST /api/generate-responses',
      'POST /api/simulate',
      'POST /api/generate-materials',
      'GET /api/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║     Strategy Command Center - API Server          ║
╠═══════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}          ║
║                                                   ║
║  Endpoints:                                       ║
║  • POST /api/analyze-threat                       ║
║  • POST /api/generate-responses                   ║
║  • POST /api/simulate                             ║
║  • POST /api/generate-materials                   ║
║  • GET  /api/health                               ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
