import Anthropic from '@anthropic-ai/sdk';
import { responseOptionsPrompt } from '../prompts/index.js';

export class StrategyAgent {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateOptions(threatAnalysis, intelReport) {
    const prompt = responseOptionsPrompt(threatAnalysis, intelReport);

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

export default StrategyAgent;
