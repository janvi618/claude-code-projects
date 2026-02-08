import Anthropic from '@anthropic-ai/sdk';
import { getAllStakeholders, getStakeholderContext } from '../data/stakeholders.js';
import { simulationPrompt, redTeamPrompt, scenarioChainPrompt } from '../prompts/index.js';

export class SimulationAgent {
  constructor(apiKey, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async simulateStakeholder(stakeholderKey, responseOption, threatContext) {
    const stakeholderContext = getStakeholderContext(stakeholderKey);
    const prompt = simulationPrompt(stakeholderContext, responseOption, threatContext);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  }

  async simulateAllStakeholders(responseOption, threatContext) {
    const stakeholders = getAllStakeholders();
    const results = {};

    // Run all stakeholder simulations in parallel
    const promises = Object.keys(stakeholders).map(async (key) => {
      const simulation = await this.simulateStakeholder(key, responseOption, threatContext);
      return { key, simulation };
    });

    const simulations = await Promise.all(promises);

    for (const { key, simulation } of simulations) {
      results[key] = {
        ...stakeholders[key],
        simulation
      };
    }

    return results;
  }

  async redTeam(responseOption, threatContext) {
    const prompt = redTeamPrompt(responseOption, threatContext);

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

    return response.content[0].text;
  }

  async scenarioChains(responseOption, threatContext) {
    const prompt = scenarioChainPrompt(responseOption, threatContext);

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

    return response.content[0].text;
  }
}

export default SimulationAgent;
