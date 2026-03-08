import { CampaignOutput, CampaignConcept, SocialPost, Platform } from './types.js';
import { BrandDNA } from '../extractor/types.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fixedOutput?: CampaignOutput;
}

export interface PlatformLimits {
  maxChars: number;
  targetChars?: number;
}

const PLATFORM_LIMITS: Record<Platform, PlatformLimits> = {
  instagram: { maxChars: 2200, targetChars: 300 },
  linkedin: { maxChars: 3000, targetChars: 500 },
  x: { maxChars: 280 }, // strict limit
  facebook: { maxChars: 500, targetChars: 250 },
  tiktok: { maxChars: 150 }
};

export function validateAndFix(
  rawResponse: any, 
  brandDNA: BrandDNA, 
  request: { 
    goal: string; 
    num_concepts?: number; 
    platforms?: Platform[]; 
    posts_per_platform?: number;
  }
): ValidationResult {
  const errors: string[] = [];
  const expectedConcepts = request.num_concepts || 3;
  const expectedPlatforms = request.platforms || ["instagram", "linkedin", "x"];
  const expectedPostsPerPlatform = request.posts_per_platform || 2;

  // Basic structure validation
  if (!rawResponse || typeof rawResponse !== 'object') {
    return {
      isValid: false,
      errors: ['Response is not a valid object']
    };
  }

  if (!rawResponse.concepts || !Array.isArray(rawResponse.concepts)) {
    return {
      isValid: false,
      errors: ['Response missing concepts array']
    };
  }

  // Check concept count
  if (rawResponse.concepts.length !== expectedConcepts) {
    errors.push(`Expected ${expectedConcepts} concepts, got ${rawResponse.concepts.length}`);
  }

  // Validate each concept
  const fixedConcepts: CampaignConcept[] = [];
  
  for (let i = 0; i < rawResponse.concepts.length; i++) {
    const concept = rawResponse.concepts[i];
    const fixedConcept = validateAndFixConcept(concept, i + 1, expectedPlatforms, expectedPostsPerPlatform, errors);
    if (fixedConcept) {
      fixedConcepts.push(fixedConcept);
    }
  }

  // Create the final output
  const fixedOutput: CampaignOutput = {
    brand_name: brandDNA.meta.site_title,
    campaign_goal: request.goal,
    generated_at: new Date().toISOString(),
    concepts: fixedConcepts
  };

  return {
    isValid: errors.length === 0,
    errors,
    fixedOutput
  };
}

function validateAndFixConcept(
  concept: any, 
  expectedNumber: number, 
  expectedPlatforms: Platform[], 
  expectedPostsPerPlatform: number,
  errors: string[]
): CampaignConcept | null {
  if (!concept || typeof concept !== 'object') {
    errors.push(`Concept ${expectedNumber} is not a valid object`);
    return null;
  }

  // Required fields
  const requiredFields = ['campaign_name', 'tagline', 'creative_rationale', 'visual_direction', 'posts'];
  for (const field of requiredFields) {
    if (!concept[field]) {
      errors.push(`Concept ${expectedNumber} missing ${field}`);
    }
  }

  if (!Array.isArray(concept.posts)) {
    errors.push(`Concept ${expectedNumber} posts is not an array`);
    return null;
  }

  // Validate and fix posts
  const fixedPosts: SocialPost[] = [];
  const postsByPlatform: Record<string, SocialPost[]> = {};

  for (const post of concept.posts) {
    const fixedPost = validateAndFixPost(post, expectedNumber, errors);
    if (fixedPost) {
      fixedPosts.push(fixedPost);
      
      if (!postsByPlatform[fixedPost.platform]) {
        postsByPlatform[fixedPost.platform] = [];
      }
      postsByPlatform[fixedPost.platform].push(fixedPost);
    }
  }

  // Check platform coverage
  for (const platform of expectedPlatforms) {
    const platformPosts = postsByPlatform[platform] || [];
    if (platformPosts.length !== expectedPostsPerPlatform) {
      errors.push(`Concept ${expectedNumber} has ${platformPosts.length} posts for ${platform}, expected ${expectedPostsPerPlatform}`);
    }
  }

  return {
    concept_number: expectedNumber,
    campaign_name: concept.campaign_name || `Campaign ${expectedNumber}`,
    tagline: concept.tagline || '',
    creative_rationale: concept.creative_rationale || '',
    visual_direction: concept.visual_direction || '',
    posts: fixedPosts
  };
}

function validateAndFixPost(post: any, conceptNumber: number, errors: string[]): SocialPost | null {
  if (!post || typeof post !== 'object') {
    errors.push(`Concept ${conceptNumber} contains invalid post object`);
    return null;
  }

  if (!post.platform || !post.post_text) {
    errors.push(`Concept ${conceptNumber} post missing required fields`);
    return null;
  }

  const platform = post.platform as Platform;
  const limits = PLATFORM_LIMITS[platform];
  
  if (!limits) {
    errors.push(`Concept ${conceptNumber} has unsupported platform: ${platform}`);
    return null;
  }

  // Fix post text length
  let postText = post.post_text;
  if (postText.length > limits.maxChars) {
    if (platform === 'x') {
      // For X, truncate strictly and add ellipsis
      postText = postText.substring(0, 277) + '...';
      errors.push(`Concept ${conceptNumber} X post was truncated from ${post.post_text.length} to 280 characters`);
    } else {
      // For other platforms, just note the warning
      errors.push(`Concept ${conceptNumber} ${platform} post exceeds recommended length (${postText.length}>${limits.maxChars})`);
    }
  }

  return {
    platform,
    post_text: postText,
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
    suggested_image_prompt: post.suggested_image_prompt || '',
    post_type: post.post_type || 'single_image',
    best_time_to_post: post.best_time_to_post || 'weekday morning'
  };
}