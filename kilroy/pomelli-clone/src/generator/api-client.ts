import axios, { AxiosResponse } from 'axios';

export interface APIClientOptions {
  api_provider?: 'anthropic' | 'openai' | 'gemini';
  max_tokens?: number;
  temperature?: number;
  timeout_ms?: number;
}

export interface APIResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class APIClient {
  private provider: string;
  private maxTokens: number;
  private temperature: number;
  private timeoutMs: number;

  constructor(options: APIClientOptions = {}) {
    this.provider = options.api_provider || 'anthropic';
    this.maxTokens = options.max_tokens || 4096;
    this.temperature = options.temperature || 0.8;
    this.timeoutMs = options.timeout_ms || 120000;
  }

  async generateCampaigns(systemPrompt: string, userPrompt: string): Promise<APIResponse> {
    try {
      const response = await this.callAPI(systemPrompt, userPrompt);
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      
      // Retry once with stricter JSON instruction
      try {
        const retryPrompt = userPrompt + '\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No explanation.';
        const retryResponse = await this.callAPI(systemPrompt, retryPrompt);
        return retryResponse;
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        return {
          content: '',
          success: false,
          error: `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<APIResponse> {
    if (this.provider === 'anthropic') {
      return this.callAnthropic(systemPrompt, userPrompt);
    } else {
      throw new Error(`Unsupported API provider: ${this.provider}`);
    }
  }

  private async callAnthropic(systemPrompt: string, userPrompt: string): Promise<APIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    };

    const response: AxiosResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: this.timeoutMs
      }
    );

    const result = response.data;
    
    if (!result.content || !Array.isArray(result.content) || result.content.length === 0) {
      throw new Error('Invalid response format from Anthropic API');
    }

    const content = result.content[0].text;
    
    return {
      content,
      success: true
    };
  }
}

export function parseJSONResponse(content: string): any {
  try {
    return JSON.parse(content);
  } catch (error) {
    // Try to extract JSON from response by finding first { and last }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSubstring = content.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonSubstring);
      } catch (innerError) {
        throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}