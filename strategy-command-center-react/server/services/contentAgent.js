import Anthropic from '@anthropic-ai/sdk';
import { launchMaterialsPrompt } from '../prompts/index.js';

export class ContentAgent {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateMaterials(chosenResponse, threatContext, simulationResults) {
    // Format simulation results for the prompt
    let simResultsText = '';

    if (simulationResults.stakeholders) {
      simResultsText += '### Stakeholder Reactions\n\n';
      for (const [key, data] of Object.entries(simulationResults.stakeholders)) {
        simResultsText += `**${data.name} (${data.title})**\n${data.simulation}\n\n`;
      }
    }

    if (simulationResults.redTeam) {
      simResultsText += '### Red Team Analysis\n\n';
      simResultsText += simulationResults.redTeam + '\n\n';
    }

    if (simulationResults.scenarios) {
      simResultsText += '### Scenario Analysis\n\n';
      simResultsText += simulationResults.scenarios + '\n\n';
    }

    const prompt = launchMaterialsPrompt(chosenResponse, threatContext, simResultsText);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 5000,
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

export default ContentAgent;
