// Brand DNA Extractor Types
export interface ExtractorOptions {
  timeout_ms?: number;        // default: 15000
  max_pages?: number;         // default: 3 (homepage + up to 2 linked pages)
  include_subpages?: boolean; // default: true
  user_agent?: string;        // default: a standard Chrome user agent string
}

export interface BrandDNA {
  url: string;
  extracted_at: string;  // ISO 8601 timestamp
  confidence: number;    // 0.0 to 1.0 — how confident the extractor is in the profile

  // Visual Identity
  colors: {
    primary: string[];      // hex codes, max 3, ordered by dominance
    secondary: string[];    // hex codes, max 5
    background: string;     // dominant background color
    text: string;           // dominant text color
    accent: string | null;  // call-to-action / highlight color if detected
  };

  typography: {
    heading_fonts: string[];   // font family names used in headings
    body_fonts: string[];      // font family names used in body text
    font_style: string;        // one of: "modern", "classic", "playful", "technical", "elegant", "minimal"
  };

  imagery: {
    has_hero_image: boolean;
    image_count: number;          // total images found on analyzed pages
    image_themes: string[];       // AI-detected themes, e.g. ["people", "nature", "product", "abstract"]
    uses_illustrations: boolean;  // vs photographs
    dominant_image_mood: string;  // e.g. "warm", "professional", "energetic", "calm"
  };

  // Voice & Personality
  voice: {
    tone_descriptors: string[];    // 3-5 adjectives, e.g. ["friendly", "expert", "approachable"]
    formality: string;             // one of: "very_formal", "formal", "neutral", "casual", "very_casual"
    sentence_style: string;        // one of: "short_punchy", "medium_balanced", "long_detailed"
    uses_humor: boolean;
    uses_jargon: boolean;
    perspective: string;           // one of: "first_person_plural" ("we"), "third_person", "second_person" ("you"), "mixed"
  };

  // Brand Positioning
  positioning: {
    industry_guess: string;          // best guess at industry/vertical
    target_audience_guess: string;   // best guess at who they serve
    value_proposition: string;       // one sentence summarizing their core promise
    key_messages: string[];          // 3-5 recurring themes or messages
    differentiators: string[];       // what makes them different (if detectable)
  };

  // Metadata
  meta: {
    site_title: string;
    meta_description: string | null;
    pages_analyzed: number;
    total_text_length: number;       // character count of all extracted text
    has_blog: boolean;
    has_ecommerce: boolean;
    social_links: string[];          // detected social media profile URLs
    error?: string;                  // error message if extraction failed
  };
}