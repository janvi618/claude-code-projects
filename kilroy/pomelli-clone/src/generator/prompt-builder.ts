import { BrandDNA } from '../extractor/types.js';
import { CampaignRequest } from './types.js';

export interface PromptPair {
  system: string;
  user: string;
}

export function buildPrompts(brandDNA: BrandDNA, request: CampaignRequest): PromptPair {
  const system = buildSystemPrompt();
  const user = buildUserPrompt(brandDNA, request);
  
  return { system, user };
}

function buildSystemPrompt(): string {
  return `You are an elite social media marketing strategist who creates viral, on-brand campaigns.
You have deep expertise in brand voice, visual identity, and platform-specific content strategy.

You ALWAYS:
- Match the brand's existing tone and personality exactly
- Respect the brand's color palette and visual style in your suggestions
- Write platform-appropriate content (Instagram is visual/emotional, LinkedIn is professional/insightful, X is sharp/concise)
- Provide specific, actionable creative direction — not generic advice
- Think about what makes the brand DIFFERENT and lean into that

You NEVER:
- Use generic marketing language like "synergy," "leverage," or "ecosystem" unless the brand itself uses these
- Suggest campaigns that could work for any brand — every concept must be deeply specific to THIS brand
- Ignore the brand's formality level — if they're casual, your copy is casual
- Write hashtags that are too broad (#marketing) — make them specific to the campaign

PLATFORM-SPECIFIC GUIDELINES:

Instagram:
- Emoji usage is expected and encouraged
- First line is the hook — must grab attention
- Include a call-to-action (CTA) in every post
- Hashtags go at the end, after a line break
- Suggest carousel posts for educational/list content

LinkedIn:
- Professional but not stiff — "thought leadership" voice
- Open with a bold statement or counterintuitive insight
- Use line breaks generously for readability
- Minimal emoji (1-2 max)
- End with a question to drive engagement

X (Twitter):
- Sharp, witty, concise
- Every word must earn its place
- Threading is acceptable for bigger ideas — suggest "Thread: " prefix
- Hashtags are sparingly used (1-2 max, inline)

Facebook:
- Conversational, community-oriented
- Longer captions are fine
- Ask questions, invite comments
- Emoji usage is moderate

TikTok:
- Extremely casual, trend-aware
- Caption is secondary to the video concept
- The suggested_image_prompt field should describe a video concept instead
- Reference trending formats when relevant`;
}

function buildUserPrompt(brandDNA: BrandDNA, request: CampaignRequest): string {
  const numConcepts = request.num_concepts || 3;
  const platforms = request.platforms || ["instagram", "linkedin", "x"];
  const postsPerPlatform = request.posts_per_platform || 2;

  let prompt = `## Brand Profile

BRAND: ${brandDNA.meta.site_title}
INDUSTRY: ${brandDNA.positioning.industry_guess}
TARGET AUDIENCE: ${brandDNA.positioning.target_audience_guess}
VALUE PROPOSITION: ${brandDNA.positioning.value_proposition}

TONE: ${brandDNA.voice.tone_descriptors.join(", ")}
FORMALITY: ${brandDNA.voice.formality}
PERSPECTIVE: ${brandDNA.voice.perspective}
USES HUMOR: ${brandDNA.voice.uses_humor}

BRAND COLORS:
- Primary: ${brandDNA.colors.primary.join(", ")}
- Secondary: ${brandDNA.colors.secondary.join(", ")}
- Accent: ${brandDNA.colors.accent || "None specified"}

KEY MESSAGES: ${brandDNA.positioning.key_messages.join("; ")}
DIFFERENTIATORS: ${brandDNA.positioning.differentiators.join("; ")}

## Campaign Request

GOAL: ${request.goal}`;

  if (request.additional_context) {
    prompt += `\nADDITIONAL CONTEXT: ${request.additional_context}`;
  }

  if (request.tone_override) {
    prompt += `\nTONE OVERRIDE: ${request.tone_override}`;
  }

  prompt += `

## Instructions

Generate exactly ${numConcepts} distinct campaign concepts. Each concept should take a DIFFERENT creative angle on the campaign goal. Do not create variations of the same idea — create genuinely different strategic approaches.

For each concept, generate ${postsPerPlatform} posts for each of these platforms: ${platforms.join(", ")}.

Return ONLY a JSON object matching this structure (no markdown, no explanation, just JSON):

{
  "concepts": [
    {
      "concept_number": 1,
      "campaign_name": "...",
      "tagline": "...",
      "creative_rationale": "2-3 sentences on why this works for this specific brand",
      "visual_direction": "1-2 sentences on imagery style, referencing the brand colors",
      "posts": [
        {
          "platform": "instagram",
          "post_text": "...",
          "hashtags": ["...", "..."],
          "suggested_image_prompt": "A detailed prompt for generating an on-brand image",
          "post_type": "single_image",
          "best_time_to_post": "Tuesday 10am"
        }
      ]
    }
  ]
}`;

  return prompt;
}