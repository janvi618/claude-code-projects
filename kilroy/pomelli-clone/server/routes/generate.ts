import { Router } from 'express';
import { generate } from '../../src/generator/index.js';
import { BrandDNA } from '../../src/extractor/types.js';
import { CampaignRequest } from '../../src/generator/types.js';
import { generateImage } from '../../src/generator/image-generator.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/generate - Campaign generation (returns text immediately)
router.post('/generate', async (req, res) => {
  try {
    const { brandDNA, request } = req.body;

    if (!brandDNA || !request) {
      return res.status(400).json({ error: 'brandDNA and request are required' });
    }

    if (!request.goal) {
      return res.status(400).json({ error: 'Campaign goal is required' });
    }

    console.log(`Generating campaigns for goal: ${request.goal}`);
    const campaigns = await generate(brandDNA as BrandDNA, request as CampaignRequest);
    console.log(`Campaigns generated: ${campaigns.concepts.length} concepts`);
    res.json(campaigns);
  } catch (error) {
    console.error('Generate error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'AI service configuration error. Please check server setup.' });
      }
    }

    res.status(500).json({ error: 'Failed to generate campaigns. Please try again.' });
  }
});

// POST /api/generate-image - Generate a single concept image (called per-concept from frontend)
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ image: null, reason: 'no_api_key' });
    }

    console.log('Generating image for prompt:', prompt.substring(0, 60) + '...');
    const image = await generateImage(prompt);
    res.json({ image });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(200).json({ image: null, reason: 'generation_failed' });
  }
});

export default router;