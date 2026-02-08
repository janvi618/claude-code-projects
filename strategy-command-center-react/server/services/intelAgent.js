import Anthropic from '@anthropic-ai/sdk';
import { identifyCompetitor, getCompetitor, getCompetitorContext } from '../data/competitors.js';
import { intelResearchPrompt, deepResearchPrompt } from '../prompts/index.js';

export class IntelAgent {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
    this.competitorKey = null;
    this.competitorData = null;
    this.competitorContext = null;
  }

  _getCompetitorInfo(threatText) {
    this.competitorKey = identifyCompetitor(threatText);
    if (this.competitorKey) {
      this.competitorData = getCompetitor(this.competitorKey);
      this.competitorContext = getCompetitorContext(this.competitorKey);
    } else {
      this.competitorData = null;
      this.competitorContext = 'Unknown competitor - general competitive analysis will be performed.';
    }
    return this.competitorKey;
  }

  async _extractKeyTerms(threatText) {
    // Use Claude to extract key search terms
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract 3-5 key search terms from this competitive threat description that would be useful for researching this situation. Return only the terms, one per line, no numbering or bullets.

Threat: ${threatText}`
        }
      ]
    });

    const terms = response.content[0].text
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    return terms;
  }

  async research(threatText) {
    // Get competitor info
    this._getCompetitorInfo(threatText);

    // Extract key terms for search context
    const keyTerms = await this._extractKeyTerms(threatText);

    // Since we don't have a search API in this simplified version,
    // we'll use Claude's knowledge to generate a comprehensive intel report
    const prompt = intelResearchPrompt(threatText, this.competitorContext);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const intelReport = response.content[0].text;

    // Return structured results
    return {
      competitorKey: this.competitorKey,
      competitorContext: this.competitorContext,
      keyTerms,
      intelReport,
      // In a full implementation, these would contain search results
      searchResults: {},
      categoryLabels: [
        'Background Analysis',
        'Market Context',
        'Competitive Dynamics',
        'Impact Assessment',
        'Intelligence Gaps'
      ]
    };
  }

  // Deep research with provided search results (for future implementation)
  async synthesizeDeepResearch(threatText, searchResults) {
    this._getCompetitorInfo(threatText);

    const prompt = deepResearchPrompt(
      threatText,
      this.competitorContext,
      searchResults
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  }
}

export default IntelAgent;
