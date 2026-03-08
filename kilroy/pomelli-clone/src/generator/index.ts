import { BrandDNA } from '../extractor/types.js';
import { CampaignRequest, CampaignOutput, Platform } from './types.js';
import { buildPrompts } from './prompt-builder.js';
import { APIClient, parseJSONResponse } from './api-client.js';
import { validateAndFix } from './validator.js';
import fs from 'fs';
import path from 'path';

// Demo mode helper
function getDemoCampaigns(brandURL: string, request: CampaignRequest): CampaignOutput | null {
  try {
    const isDemoMode = process.env.DEMO_MODE === 'true';
    console.log(`Demo mode check: DEMO_MODE=${process.env.DEMO_MODE}, isDemoMode=${isDemoMode}`);
    
    if (!isDemoMode) return null;
    
    const hostname = new URL(brandURL).hostname.replace(/^www\./, '');
    console.log(`Looking for demo campaigns for hostname: ${hostname}`);
    const campaignPath = path.join(process.cwd(), 'demo-data', 'campaigns', `${hostname}.json`);
    console.log(`Campaign path: ${campaignPath}`);
    
    if (fs.existsSync(campaignPath)) {
      console.log(`Demo mode: serving cached campaigns for ${brandURL}`);
      const data = fs.readFileSync(campaignPath, 'utf-8');
      const demoData = JSON.parse(data);
      
      // Update the campaign goal
      demoData.campaign_goal = request.goal;
      demoData.generated_at = new Date().toISOString();
      
      console.log(`Demo data loaded with ${demoData.concepts.length} concepts`);
      return demoData as CampaignOutput;
    } else {
      console.log(`Demo campaign file not found: ${campaignPath}`);
    }
    
    return null;
  } catch (error) {
    console.error('Demo mode error:', error);
    return null;
  }
}

/**
 * Generate marketing campaigns based on Brand DNA
 * @param brandDNA - Brand DNA profile from extractor
 * @param request - Campaign generation request
 * @returns Promise<CampaignOutput> - Generated campaigns
 */
export async function generate(brandDNA: BrandDNA, request: CampaignRequest): Promise<CampaignOutput> {
  // Try demo mode first
  const demoCampaigns = getDemoCampaigns(brandDNA.url, request);
  if (demoCampaigns) {
    return demoCampaigns;
  }
  
  // Set defaults
  const opts = {
    num_concepts: 3,
    platforms: ["instagram", "linkedin", "x"] as Platform[],
    posts_per_platform: 2,
    ...request
  };

  try {
    // Step 1: Build prompts
    const { system, user } = buildPrompts(brandDNA, opts);

    // Step 2: Call LLM API
    const apiClient = new APIClient({
      max_tokens: 8192,
      temperature: 0.8
    });

    const apiResponse = await apiClient.generateCampaigns(system, user);

    if (!apiResponse.success) {
      console.error('API call failed:', apiResponse.error);
      throw new Error(apiResponse.error || 'Campaign generation API call failed');
    }

    // Step 3: Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = parseJSONResponse(apiResponse.content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return createEmptyOutput(brandDNA, request);
    }

    // Step 4: Validate and fix
    const validation = validateAndFix(parsedResponse, brandDNA, opts);

    if (validation.errors.length > 0) {
      console.warn('Validation warnings/errors:', validation.errors);
    }

    // Return the fixed output or empty if validation completely failed
    return validation.fixedOutput || createEmptyOutput(brandDNA, request);

  } catch (error) {
    console.error('Campaign generation failed:', error);
    return createEmptyOutput(brandDNA, request);
  }
}

/**
 * Create an empty campaign output for error cases
 */
function createEmptyOutput(brandDNA: BrandDNA, request: CampaignRequest): CampaignOutput {
  return {
    brand_name: brandDNA.meta.site_title,
    campaign_goal: request.goal,
    generated_at: new Date().toISOString(),
    concepts: []
  };
}

export default generate;
export * from './types.js';