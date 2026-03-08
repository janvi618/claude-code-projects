

# Pomelli Clone — Campaign Generator

## Natural Language Specification v1.0

This document is a natural language specification (NLSpec). It is intended to be read and implemented by a coding agent without human intervention.

---

## 1. Purpose

The Campaign Generator takes a BrandDNA profile (produced by the Brand DNA Extractor) and a campaign goal, then uses an LLM to generate multiple on-brand marketing campaign concepts. Each concept includes a campaign name, tagline, social media posts for multiple platforms, and a creative rationale explaining why the campaign fits the brand.

This is the creative engine of the Pomelli Clone. The quality of output here is what makes or breaks the demo.

---

## 2. Interface

### Input

```typescript
generate(brandDNA: BrandDNA, request: CampaignRequest): Promise<CampaignOutput>
```

```typescript
interface CampaignRequest {
  goal: string                    // free-text description, e.g. "promote our spring sale"
  num_concepts?: number           // default: 3
  platforms?: Platform[]          // default: ["instagram", "linkedin", "x"]
  posts_per_platform?: number    // default: 2
  tone_override?: string         // optional — override the brand voice for this campaign
  additional_context?: string    // optional — extra info the user wants factored in
}

type Platform = "instagram" | "linkedin" | "x" | "facebook" | "tiktok"
```

### Output

```typescript
interface CampaignOutput {
  brand_name: string            // extracted from BrandDNA
  campaign_goal: string         // echoed from input
  generated_at: string          // ISO 8601
  concepts: CampaignConcept[]
}

interface CampaignConcept {
  concept_number: number        // 1, 2, 3
  campaign_name: string         // catchy campaign name
  tagline: string               // one-liner
  creative_rationale: string    // 2-3 sentences explaining why this concept fits the brand
  visual_direction: string      // 1-2 sentences suggesting imagery style, colors, mood
  posts: SocialPost[]
}

interface SocialPost {
  platform: Platform
  post_text: string             // the actual post copy, platform-appropriate length
  hashtags: string[]            // 3-7 relevant hashtags
  suggested_image_prompt: string // a text prompt that could generate an on-brand image
  post_type: string             // "carousel", "single_image", "text_only", "video_concept"
  best_time_to_post: string     // general suggestion like "Tuesday 10am" or "weekday morning"
}
```

---

## 3. Implementation Strategy

### Step 1: Build the Prompt

The prompt is the entire product here. It must be carefully constructed to produce high-quality, differentiated campaigns that actually reflect the brand.

Construct a system prompt and a user prompt:

**System prompt:**

```
You are an elite social media marketing strategist who creates viral, on-brand campaigns.
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
```

**User prompt:**

```
## Brand Profile

BRAND: {brandDNA.meta.site_title}
INDUSTRY: {brandDNA.positioning.industry_guess}
TARGET AUDIENCE: {brandDNA.positioning.target_audience_guess}
VALUE PROPOSITION: {brandDNA.positioning.value_proposition}

TONE: {brandDNA.voice.tone_descriptors.join(", ")}
FORMALITY: {brandDNA.voice.formality}
PERSPECTIVE: {brandDNA.voice.perspective}
USES HUMOR: {brandDNA.voice.uses_humor}

BRAND COLORS:
- Primary: {brandDNA.colors.primary.join(", ")}
- Secondary: {brandDNA.colors.secondary.join(", ")}
- Accent: {brandDNA.colors.accent}

KEY MESSAGES: {brandDNA.positioning.key_messages.join("; ")}
DIFFERENTIATORS: {brandDNA.positioning.differentiators.join("; ")}

## Campaign Request

GOAL: {request.goal}
{request.additional_context ? "ADDITIONAL CONTEXT: " + request.additional_context : ""}
{request.tone_override ? "TONE OVERRIDE: " + request.tone_override : ""}

## Instructions

Generate exactly {request.num_concepts} distinct campaign concepts. Each concept should take a DIFFERENT creative angle on the campaign goal. Do not create variations of the same idea — create genuinely different strategic approaches.

For each concept, generate {request.posts_per_platform} posts for each of these platforms: {request.platforms.join(", ")}.

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
}
```

### Step 2: Call the LLM API

- Use the Anthropic Messages API with `claude-sonnet-4-20250514`
- Set `max_tokens` to 4096 (campaigns are long)
- Set temperature to 0.8 (we WANT creativity here, unlike the extractor)
- Parse the response as JSON
- If JSON parsing fails, attempt to extract JSON from the response by finding the first `{` and last `}` and parsing that substring
- If that still fails, retry once with an appended instruction: "CRITICAL: Return ONLY valid JSON. No markdown fences. No explanation."

### Step 3: Validate and Enrich

After parsing the LLM response:

1. Verify the response has the correct number of concepts
2. Verify each concept has posts for all requested platforms
3. Verify post lengths are platform-appropriate:
   - Instagram: max 2,200 characters (but aim for 150-300 for feed posts)
   - LinkedIn: max 3,000 characters (aim for 200-500)
   - X: max 280 characters (strict)
   - Facebook: max 500 characters (aim for 100-250)
   - TikTok: max 150 characters for captions
4. If X posts exceed 280 characters, truncate and add "..." — do NOT re-call the API
5. Add the `generated_at` timestamp and `brand_name` to the output

### Step 4: Error Handling

- If the API call fails entirely, return a CampaignOutput with an empty `concepts` array and log the error
- If the API returns partial data (e.g., only 2 of 3 requested concepts), return what was received — do not retry for missing concepts
- Never throw an unhandled exception

---

## 4. Platform-Specific Guidelines

These should be embedded in the system prompt or the user prompt as additional context if the corresponding platform is requested:

**Instagram:**
- Emoji usage is expected and encouraged
- First line is the hook — must grab attention
- Include a call-to-action (CTA) in every post
- Hashtags go at the end, after a line break
- Suggest carousel posts for educational/list content

**LinkedIn:**
- Professional but not stiff — "thought leadership" voice
- Open with a bold statement or counterintuitive insight
- Use line breaks generously for readability
- Minimal emoji (1-2 max)
- End with a question to drive engagement

**X (Twitter):**
- Sharp, witty, concise
- Every word must earn its place
- Threading is acceptable for bigger ideas — suggest "Thread: " prefix
- Hashtags are sparingly used (1-2 max, inline)

**Facebook:**
- Conversational, community-oriented
- Longer captions are fine
- Ask questions, invite comments
- Emoji usage is moderate

**TikTok:**
- Extremely casual, trend-aware
- Caption is secondary to the video concept
- The `suggested_image_prompt` field should describe a video concept instead
- Reference trending formats when relevant

---

## 5. Technical Requirements

- **Language:** Node.js (TypeScript preferred)
- **AI API:** Anthropic Claude as primary. Accept an optional `api_provider` config to switch to OpenAI or Gemini
- **No other external dependencies** beyond the HTTP client for API calls
- **Module format:** ES modules
- **Export:** Default export the `generate` function. Also export all TypeScript interfaces.

---

## 6. File Structure

```
src/generator/
├── index.ts              # Main generate() function
├── prompt-builder.ts     # Constructs the system and user prompts from BrandDNA + request
├── api-client.ts         # LLM API calling with retry logic
├── validator.ts          # Post-generation validation and platform-specific checks
└── types.ts              # CampaignOutput, CampaignConcept, SocialPost interfaces
```

---

## 7. Definition of Done

1. `generate(validBrandDNA, { goal: "promote spring sale" })` returns 3 concepts with posts for Instagram, LinkedIn, and X
2. All X posts are 280 characters or fewer
3. Each concept has a distinct `campaign_name` and `creative_rationale`
4. The `creative_rationale` references specific elements from the BrandDNA (colors, tone, audience)
5. The function completes within 30 seconds
6. If the AI API is down, the function returns gracefully with an empty concepts array
7. Generated campaigns for a bakery brand feel DIFFERENT from campaigns for a law firm brand, given the same campaign goal
