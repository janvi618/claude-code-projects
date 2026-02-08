import Anthropic from '@anthropic-ai/sdk';
import { identifyCompetitor, getCompetitorContext } from '../data/competitors.js';
import { threatAnalysisPrompt } from '../prompts/index.js';

export class ThreatAnalyzer {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async analyze(threatText) {
    // Identify competitor from text
    const competitorKey = identifyCompetitor(threatText);
    const competitorContext = competitorKey
      ? getCompetitorContext(competitorKey)
      : 'Unknown competitor - general competitive analysis will be performed.';

    // Generate analysis using Claude
    const prompt = threatAnalysisPrompt(threatText, competitorContext);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysis = response.content[0].text;

    return {
      competitorKey,
      competitorContext,
      analysis
    };
  }
}

export default ThreatAnalyzer;
