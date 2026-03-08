/**
 * Phase 3: AI-Powered Analysis
 * Uses LLM API to analyze text content for voice and positioning
 */

import axios from 'axios';
import { ExtractedContent } from './fetcher.js';
import { truncateText } from './utils.js';

export interface AIAnalysis {
  voice: {
    tone_descriptors: string[];
    formality: string;
    sentence_style: string;
    uses_humor: boolean;
    uses_jargon: boolean;
    perspective: string;
  };
  positioning: {
    industry_guess: string;
    target_audience_guess: string;
    value_proposition: string;
    key_messages: string[];
    differentiators: string[];
  };
  ai_api_success: boolean;
}

export async function analyzeWithAI(content: ExtractedContent, url: string): Promise<AIAnalysis> {
  try {
    const analysis = await callAnthropicAPI(content, url);
    return {
      ...analysis,
      ai_api_success: true
    };
  } catch (error) {
    console.warn('AI API call failed, using defaults:', error);
    return getDefaultAnalysis();
  }
}

async function callAnthropicAPI(content: ExtractedContent, url: string): Promise<Omit<AIAnalysis, 'ai_api_success'>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found in environment');
  }
  
  const prompt = constructPrompt(content, url);
  
  const requestBody = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', requestBody, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    timeout: 30000
  });
  
  if (response.status !== 200) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }
  
  const result = response.data;
  
  if (!result.content || !result.content[0] || !result.content[0].text) {
    throw new Error('Invalid response format from Anthropic API');
  }
  
  const responseText = result.content[0].text.trim();
  
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(responseText);
    return validateAndCleanAnalysis(parsed);
  } catch (parseError) {
    // If JSON parsing fails, try once more with explicit instruction
    console.warn('First JSON parse failed, retrying with explicit instruction');
    return await retryWithExplicitInstruction(content, url, apiKey);
  }
}

async function retryWithExplicitInstruction(content: ExtractedContent, url: string, apiKey: string): Promise<Omit<AIAnalysis, 'ai_api_success'>> {
  const prompt = constructPrompt(content, url) + '\n\nIMPORTANT: Return ONLY valid JSON with no additional text, comments, or formatting.';
  
  const requestBody = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0.1, // Lower temperature for more structured response
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', requestBody, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    timeout: 30000
  });
  
  if (response.status !== 200) {
    throw new Error(`Anthropic API retry error: ${response.status} ${response.statusText}`);
  }
  
  const result = response.data;
  const responseText = result.content[0].text.trim();
  
  // Try to extract JSON even if there's extra text
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return validateAndCleanAnalysis(parsed);
  }
  
  throw new Error('Could not extract valid JSON from AI response');
}

function constructPrompt(content: ExtractedContent, url: string): string {
  const truncatedText = truncateText(content.text, 3000);
  const navLabels = content.navigation_labels.slice(0, 10).join(', '); // Limit nav labels
  
  return `You are a brand strategist analyzing a website. Based on the following content extracted from ${url}, produce a brand analysis.

SITE TITLE: ${content.metadata.title}
META DESCRIPTION: ${content.metadata.description || 'Not provided'}
NAVIGATION: ${navLabels}

CONTENT:
${truncatedText}

Analyze this brand and return ONLY a JSON object with no additional text. The JSON must match this exact structure:

{
  "voice": {
    "tone_descriptors": ["3-5 adjectives describing the brand's tone of voice"],
    "formality": "very_formal | formal | neutral | casual | very_casual",
    "sentence_style": "short_punchy | medium_balanced | long_detailed",
    "uses_humor": true/false,
    "uses_jargon": true/false,
    "perspective": "first_person_plural | third_person | second_person | mixed"
  },
  "positioning": {
    "industry_guess": "the industry or vertical this business operates in",
    "target_audience_guess": "who this business primarily serves",
    "value_proposition": "one sentence capturing their core promise",
    "key_messages": ["3-5 themes that recur in the content"],
    "differentiators": ["what makes this brand different from competitors"]
  }
}`;
}

function validateAndCleanAnalysis(parsed: any): Omit<AIAnalysis, 'ai_api_success'> {
  // Ensure all required fields exist with proper defaults
  const voice = {
    tone_descriptors: Array.isArray(parsed.voice?.tone_descriptors) ? 
      parsed.voice.tone_descriptors.slice(0, 5) : ['professional'],
    formality: isValidFormality(parsed.voice?.formality) ? 
      parsed.voice.formality : 'neutral',
    sentence_style: isValidSentenceStyle(parsed.voice?.sentence_style) ? 
      parsed.voice.sentence_style : 'medium_balanced',
    uses_humor: Boolean(parsed.voice?.uses_humor),
    uses_jargon: Boolean(parsed.voice?.uses_jargon),
    perspective: isValidPerspective(parsed.voice?.perspective) ? 
      parsed.voice.perspective : 'third_person'
  };
  
  const positioning = {
    industry_guess: typeof parsed.positioning?.industry_guess === 'string' ? 
      parsed.positioning.industry_guess.substring(0, 100) : 'unknown',
    target_audience_guess: typeof parsed.positioning?.target_audience_guess === 'string' ? 
      parsed.positioning.target_audience_guess.substring(0, 150) : 'general audience',
    value_proposition: typeof parsed.positioning?.value_proposition === 'string' ? 
      parsed.positioning.value_proposition.substring(0, 200) : 'We provide value to our customers',
    key_messages: Array.isArray(parsed.positioning?.key_messages) ? 
      parsed.positioning.key_messages.slice(0, 5).map((msg: any) => String(msg).substring(0, 100)) : [],
    differentiators: Array.isArray(parsed.positioning?.differentiators) ? 
      parsed.positioning.differentiators.slice(0, 5).map((diff: any) => String(diff).substring(0, 100)) : []
  };
  
  return { voice, positioning };
}

function isValidFormality(formality: any): boolean {
  const validFormalityLevels = ['very_formal', 'formal', 'neutral', 'casual', 'very_casual'];
  return validFormalityLevels.includes(formality);
}

function isValidSentenceStyle(style: any): boolean {
  const validStyles = ['short_punchy', 'medium_balanced', 'long_detailed'];
  return validStyles.includes(style);
}

function isValidPerspective(perspective: any): boolean {
  const validPerspectives = ['first_person_plural', 'third_person', 'second_person', 'mixed'];
  return validPerspectives.includes(perspective);
}

function getDefaultAnalysis(): AIAnalysis {
  return {
    voice: {
      tone_descriptors: ['professional'],
      formality: 'neutral',
      sentence_style: 'medium_balanced',
      uses_humor: false,
      uses_jargon: false,
      perspective: 'third_person'
    },
    positioning: {
      industry_guess: 'unknown',
      target_audience_guess: 'general audience',
      value_proposition: 'We provide value to our customers',
      key_messages: [],
      differentiators: []
    },
    ai_api_success: false
  };
}