import { Router } from 'express';
import { ThreatAnalyzer } from '../services/threatAnalyzer.js';
import { IntelAgent } from '../services/intelAgent.js';
import { StrategyAgent } from '../services/strategyAgent.js';
import { SimulationAgent } from '../services/simulationAgent.js';
import { ContentAgent } from '../services/contentAgent.js';

const router = Router();

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.body.apiKey;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return res.status(400).json({
      error: 'Invalid API key. Please provide a valid Anthropic API key.'
    });
  }
  next();
};

// Stage 1→2: Analyze Threat
router.post('/analyze-threat', validateApiKey, async (req, res) => {
  try {
    const { apiKey, threatText, model = 'claude-sonnet-4-20250514' } = req.body;

    if (!threatText || threatText.trim().length === 0) {
      return res.status(400).json({
        error: 'Please provide a threat description.'
      });
    }

    // Initialize agents
    const threatAnalyzer = new ThreatAnalyzer(apiKey, model);
    const intelAgent = new IntelAgent(apiKey, model);

    // Run analysis and intel research in parallel
    const [threatResult, intelResult] = await Promise.all([
      threatAnalyzer.analyze(threatText),
      intelAgent.research(threatText)
    ]);

    res.json({
      success: true,
      analysis: threatResult.analysis,
      competitorKey: threatResult.competitorKey,
      competitorContext: threatResult.competitorContext,
      intelReport: intelResult.intelReport,
      keyTerms: intelResult.keyTerms,
      categoryLabels: intelResult.categoryLabels
    });
  } catch (error) {
    console.error('Error analyzing threat:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze threat. Please check your API key and try again.'
    });
  }
});

// Stage 2→3: Generate Response Options
router.post('/generate-responses', validateApiKey, async (req, res) => {
  try {
    const { apiKey, analysis, intelReport, model = 'claude-sonnet-4-20250514' } = req.body;

    if (!analysis || !intelReport) {
      return res.status(400).json({
        error: 'Missing analysis or intelligence report.'
      });
    }

    const strategyAgent = new StrategyAgent(apiKey, model);
    const responseOptions = await strategyAgent.generateOptions(analysis, intelReport);

    res.json({
      success: true,
      responseOptions
    });
  } catch (error) {
    console.error('Error generating responses:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response options.'
    });
  }
});

// Stage 3→4: Simulate Stakeholder Reactions
router.post('/simulate', validateApiKey, async (req, res) => {
  try {
    const { apiKey, selectedResponse, threatContext, model = 'claude-sonnet-4-20250514' } = req.body;

    if (!selectedResponse || !threatContext) {
      return res.status(400).json({
        error: 'Missing selected response or threat context.'
      });
    }

    const simulationAgent = new SimulationAgent(apiKey, model);

    // Run all simulations in parallel
    const [stakeholders, redTeam, scenarios] = await Promise.all([
      simulationAgent.simulateAllStakeholders(selectedResponse, threatContext),
      simulationAgent.redTeam(selectedResponse, threatContext),
      simulationAgent.scenarioChains(selectedResponse, threatContext)
    ]);

    res.json({
      success: true,
      stakeholders,
      redTeam,
      scenarios
    });
  } catch (error) {
    console.error('Error running simulation:', error);
    res.status(500).json({
      error: error.message || 'Failed to run simulation.'
    });
  }
});

// Stage 4→5: Generate Launch Materials
router.post('/generate-materials', validateApiKey, async (req, res) => {
  try {
    const {
      apiKey,
      selectedResponse,
      threatContext,
      simulationResults,
      model = 'claude-sonnet-4-20250514'
    } = req.body;

    if (!selectedResponse || !threatContext || !simulationResults) {
      return res.status(400).json({
        error: 'Missing required data for generating materials.'
      });
    }

    const contentAgent = new ContentAgent(apiKey, model);
    const launchMaterials = await contentAgent.generateMaterials(
      selectedResponse,
      threatContext,
      simulationResults
    );

    res.json({
      success: true,
      launchMaterials
    });
  } catch (error) {
    console.error('Error generating materials:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate launch materials.'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
