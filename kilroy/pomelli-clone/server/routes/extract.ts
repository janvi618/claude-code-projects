import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { extract } from '../../src/extractor/index.js';
import { BrandDNA } from '../../src/extractor/types.js';

const router = Router();

// Demo mode cache
const loadDemoData = (url: string): BrandDNA | null => {
  if (process.env.DEMO_MODE !== 'true') return null;
  
  try {
    const hostname = new URL(url).hostname;
    const demoPath = path.join(process.cwd(), 'demo-data', `${hostname}.json`);
    
    if (fs.existsSync(demoPath)) {
      const data = fs.readFileSync(demoPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Demo data load error:', error);
  }
  
  return null;
};

// POST /api/extract - Brand DNA extraction
router.post('/extract', async (req, res) => {
  try {
    const { url, options = {} } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Please enter a valid URL including https://' });
    }

    // Check demo mode first
    const demoData = loadDemoData(url);
    if (demoData) {
      console.log(`Demo mode: serving cached data for ${url}`);
      return res.json(demoData);
    }

    // Perform actual extraction
    console.log(`Extracting Brand DNA from: ${url}`);
    const brandDNA = await extract(url, options);
    
    res.json(brandDNA);
  } catch (error) {
    console.error('Extract error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
        return res.status(404).json({ error: 'Website not found or not accessible' });
      }
      if (error.message.includes('Invalid URL')) {
        return res.status(400).json({ error: 'Please enter a valid URL including https://' });
      }
    }
    
    res.status(500).json({ error: 'Failed to analyze website. Please try again.' });
  }
});

export default router;