// Campaign Generator Types
import { BrandDNA } from '../extractor/types.js';

export type Platform = "instagram" | "linkedin" | "x" | "facebook" | "tiktok";

export interface CampaignRequest {
  goal: string;                    // free-text description, e.g. "promote our spring sale"
  num_concepts?: number;           // default: 3
  platforms?: Platform[];          // default: ["instagram", "linkedin", "x"]
  posts_per_platform?: number;    // default: 2
  tone_override?: string;          // optional — override the brand voice for this campaign
  additional_context?: string;     // optional — extra info the user wants factored in
}

export interface SocialPost {
  platform: Platform;
  post_text: string;             // the actual post copy, platform-appropriate length
  hashtags: string[];            // 3-7 relevant hashtags
  suggested_image_prompt: string; // a text prompt that could generate an on-brand image
  post_type: string;             // "carousel", "single_image", "text_only", "video_concept"
  best_time_to_post: string;     // general suggestion like "Tuesday 10am" or "weekday morning"
}

export interface CampaignConcept {
  concept_number: number;        // 1, 2, 3
  campaign_name: string;         // catchy campaign name
  tagline: string;               // one-liner
  creative_rationale: string;    // 2-3 sentences explaining why this concept fits the brand
  visual_direction: string;      // 1-2 sentences suggesting imagery style, colors, mood
  posts: SocialPost[];
}

export interface CampaignOutput {
  brand_name: string;            // extracted from BrandDNA
  campaign_goal: string;         // echoed from input
  generated_at: string;          // ISO 8601
  concepts: CampaignConcept[];
}