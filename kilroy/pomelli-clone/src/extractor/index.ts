import { BrandDNA, ExtractorOptions } from './types.js';
import { fetchAndParse } from './fetcher.js';
import { analyzeVisuals } from './visual-analyzer.js';
import { analyzeWithAI } from './ai-analyzer.js';
import { normalizeUrl } from './utils.js';

/**
 * Extract Brand DNA from a website URL
 * @param url - Fully qualified URL including protocol
 * @param options - Optional extraction parameters
 * @returns Promise<BrandDNA> - Brand DNA profile
 */
export async function extract(url: string, options?: ExtractorOptions): Promise<BrandDNA> {
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(url);
  
  // Default options
  const opts: Required<ExtractorOptions> = {
    timeout_ms: 15000,
    max_pages: 3,
    include_subpages: true,
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ...options
  };

  try {
    // Phase 1: Fetch & Parse
    const content = await fetchAndParse(normalizedUrl, opts);
    
    // Phase 2: Visual Analysis
    const visualAnalysis = analyzeVisuals(content.html, content.css, content.images);
    
    // Phase 3: AI-Powered Analysis
    const aiAnalysis = await analyzeWithAI(content, normalizedUrl);
    
    // Calculate confidence score
    const confidence = calculateConfidence(content, visualAnalysis, aiAnalysis);
    
    // Combine all results into BrandDNA
    const brandDNA: BrandDNA = {
      url: normalizedUrl,
      extracted_at: new Date().toISOString(),
      confidence,
      
      colors: visualAnalysis.colors,
      typography: visualAnalysis.typography,
      imagery: visualAnalysis.imagery,
      voice: aiAnalysis.voice,
      positioning: aiAnalysis.positioning,
      
      meta: {
        site_title: content.metadata.title,
        meta_description: content.metadata.description,
        pages_analyzed: content.pages_analyzed,
        total_text_length: content.total_text_length,
        has_blog: content.metadata.hasBlog,
        has_ecommerce: content.metadata.hasEcommerce,
        social_links: content.metadata.socialLinks
      }
    };

    return brandDNA;
    
  } catch (error) {
    console.warn('Brand DNA extraction failed:', error);
    
    // Return error state with minimal data
    return {
      url: normalizedUrl,
      extracted_at: new Date().toISOString(),
      confidence: 0,
      
      colors: {
        primary: [],
        secondary: [],
        background: '#FFFFFF',
        text: '#000000',
        accent: null
      },
      
      typography: {
        heading_fonts: [],
        body_fonts: [],
        font_style: 'modern'
      },
      
      imagery: {
        has_hero_image: false,
        image_count: 0,
        image_themes: [],
        uses_illustrations: false,
        dominant_image_mood: 'neutral'
      },
      
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
      
      meta: {
        site_title: 'Unknown',
        meta_description: null,
        pages_analyzed: 0,
        total_text_length: 0,
        has_blog: false,
        has_ecommerce: false,
        social_links: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Calculate confidence score based on extraction results
 */
function calculateConfidence(
  content: any, 
  visualAnalysis: any, 
  aiAnalysis: any
): number {
  let confidence = 1.0;
  
  // Subtract for insufficient text content
  if (content.total_text_length < 500) {
    confidence -= 0.2;
  }
  
  // Subtract if no CSS could be parsed
  if (!content.css || content.css.trim().length === 0) {
    confidence -= 0.1;
  }
  
  // Subtract if AI API call failed
  if (!aiAnalysis.ai_api_success) {
    confidence -= 0.1;
  }
  
  // Subtract if only analyzed homepage when subpages were requested
  if (content.pages_analyzed === 1 && content.pages_analyzed < (content.max_pages || 3)) {
    confidence -= 0.1;
  }
  
  // Subtract if no images found
  if (visualAnalysis.imagery.image_count === 0) {
    confidence -= 0.1;
  }
  
  // Floor at 0.0
  return Math.max(0.0, confidence);
}

export default extract;
export * from './types.js';