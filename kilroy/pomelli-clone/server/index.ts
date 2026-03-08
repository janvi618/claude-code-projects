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
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'momo';
const AUTH_COOKIE = 'snatch_auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: isProd ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Password gate — only active in production
function parseCookies(cookieHeader: string = '') {
  return Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent)));
}

const passwordPage = (error = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snatch — Enter Password</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #08080F;
      color: #F0EEF8;
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 3rem;
      width: 100%;
      max-width: 380px;
      text-align: center;
      backdrop-filter: blur(16px);
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.4rem;
      background: linear-gradient(135deg, #FF2D6E, #7B61FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    p { color: rgba(240,238,248,0.5); margin-bottom: 2rem; font-size: 14px; }
    input {
      width: 100%;
      padding: 14px 18px;
      background: rgba(255,255,255,0.06);
      border: 1px solid ${error ? '#FF4D6A' : 'rgba(255,255,255,0.08)'};
      border-radius: 10px;
      color: #F0EEF8;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      margin-bottom: ${error ? '0.5rem' : '1.25rem'};
      text-align: center;
      letter-spacing: 0.1em;
    }
    input:focus { outline: none; border-color: rgba(255,45,110,0.5); }
    .error { color: #FF4D6A; font-size: 13px; margin-bottom: 1.25rem; }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #FF2D6E, #7B61FF);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Snatch</h1>
    <p>Enter the password to continue</p>
    <form method="POST" action="/snatch-auth">
      <input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password" />
      ${error ? '<p class="error">Incorrect password — try again</p>' : ''}
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;

if (isProd) {
  app.post('/snatch-auth', (req, res) => {
    if (req.body.password === SITE_PASSWORD) {
      res.setHeader('Set-Cookie', `${AUTH_COOKIE}=1; Path=/; HttpOnly; Max-Age=86400`);
      res.redirect('/');
    } else {
      res.status(401).send(passwordPage(true));
    }
  });

  app.use((req, res, next) => {
    if (req.path === '/snatch-auth') return next();
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[AUTH_COOKIE] === '1') return next();
    res.status(401).send(passwordPage());
  });
}

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