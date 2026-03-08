# Pomelli Clone — Brand DNA Extractor

## Natural Language Specification v1.0

This document is a natural language specification (NLSpec). It is intended to be read and implemented by a coding agent without human intervention. The spec is the source of truth. If the spec is ambiguous, the agent should make a reasonable choice and document it. If the spec is wrong, the spec should be updated — not the code.

---

## 1. Purpose

The Brand DNA Extractor is a module that accepts a website URL, fetches and analyzes the site, and produces a structured Brand DNA profile. The profile captures the visual identity, voice, and personality of the brand behind the website. This profile is consumed downstream by the Campaign Generator module.

The extractor must work on real, publicly accessible websites. It must degrade gracefully on minimal sites, broken sites, and sites that block scraping. It must never crash on bad input.

---

## 2. Interface

### Input

```
extract(url: string, options?: ExtractorOptions): Promise<BrandDNA>
```

`url` is a fully qualified URL including protocol (e.g., `https://example.com`). If the user provides a URL without a protocol, prepend `https://`.

`options` is optional:

```typescript
interface ExtractorOptions {
  timeout_ms?: number        // default: 15000
  max_pages?: number         // default: 3 (homepage + up to 2 linked pages)
  include_subpages?: boolean // default: true
  user_agent?: string        // default: a standard Chrome user agent string
}
```

### Output

```typescript
interface BrandDNA {
  url: string
  extracted_at: string  // ISO 8601 timestamp
  confidence: number    // 0.0 to 1.0 — how confident the extractor is in the profile

  // Visual Identity
  colors: {
    primary: string[]      // hex codes, max 3, ordered by dominance
    secondary: string[]    // hex codes, max 5
    background: string     // dominant background color
    text: string           // dominant text color
    accent: string | null  // call-to-action / highlight color if detected
  }

  typography: {
    heading_fonts: string[]   // font family names used in headings
    body_fonts: string[]      // font family names used in body text
    font_style: string        // one of: "modern", "classic", "playful", "technical", "elegant", "minimal"
  }

  imagery: {
    has_hero_image: boolean
    image_count: number          // total images found on analyzed pages
    image_themes: string[]       // AI-detected themes, e.g. ["people", "nature", "product", "abstract"]
    uses_illustrations: boolean  // vs photographs
    dominant_image_mood: string  // e.g. "warm", "professional", "energetic", "calm"
  }

  // Voice & Personality
  voice: {
    tone_descriptors: string[]    // 3-5 adjectives, e.g. ["friendly", "expert", "approachable"]
    formality: string             // one of: "very_formal", "formal", "neutral", "casual", "very_casual"
    sentence_style: string        // one of: "short_punchy", "medium_balanced", "long_detailed"
    uses_humor: boolean
    uses_jargon: boolean
    perspective: string           // one of: "first_person_plural" ("we"), "third_person", "second_person" ("you"), "mixed"
  }

  // Brand Positioning
  positioning: {
    industry_guess: string          // best guess at industry/vertical
    target_audience_guess: string   // best guess at who they serve
    value_proposition: string       // one sentence summarizing their core promise
    key_messages: string[]          // 3-5 recurring themes or messages
    differentiators: string[]       // what makes them different (if detectable)
  }

  // Metadata
  meta: {
    site_title: string
    meta_description: string | null
    pages_analyzed: number
    total_text_length: number       // character count of all extracted text
    has_blog: boolean
    has_ecommerce: boolean
    social_links: string[]          // detected social media profile URLs
  }
}
```

### Error Handling

The function must never throw an unhandled exception. All errors return a result with `confidence: 0` and a populated `meta.error` field (add this field if needed). Specific error cases:

- **Invalid URL format:** Return immediately with an error message suggesting the correct format.
- **DNS resolution failure:** Return with error "Could not resolve domain."
- **HTTP error (4xx, 5xx):** Return with the status code in the error message.
- **Timeout:** Return with error "Site took too long to respond."
- **Empty page / no content:** Return a partial BrandDNA with whatever could be extracted. Set confidence to 0.1.
- **JavaScript-rendered content not loading:** This is acceptable. The extractor uses static HTML fetching, not a headless browser, for simplicity. Document this limitation.

---

## 3. Implementation Strategy

The extractor operates in three phases. Each phase is independent and should be implemented as a separate internal function.

### Phase 1: Fetch & Parse

1. Validate the URL. Normalize it (add protocol if missing, strip trailing slash).
2. Fetch the homepage HTML using a standard HTTP client with the configured user agent and timeout.
3. Parse the HTML into a DOM structure.
4. Extract all text content, stripping HTML tags but preserving paragraph boundaries.
5. Extract all CSS — both inline styles and linked stylesheets (fetch up to 3 external stylesheets).
6. Extract all image URLs (src attributes of `<img>` tags and CSS `background-image` URLs).
7. Extract metadata: `<title>`, `<meta name="description">`, `<meta property="og:*">`, social links from `<a>` tags.
8. If `include_subpages` is true, find up to `max_pages - 1` internal links from the homepage (prefer links in the main navigation). Fetch and parse those pages too. Merge all extracted content.

### Phase 2: Visual Analysis

This phase operates on the extracted CSS and HTML. It does NOT call an AI API. It uses deterministic extraction.

**Color extraction:**
1. Parse all CSS rules for `color`, `background-color`, `background`, `border-color`, and `fill` properties.
2. Also parse inline `style` attributes on HTML elements.
3. Convert all color values to hex format (handle rgb(), rgba(), hsl(), hsla(), and named colors).
4. Count frequency of each color. Ignore pure white (#FFFFFF) and pure black (#000000) for primary/secondary — they go into background/text.
5. Rank by frequency. Top 1-3 non-white/non-black colors are `primary`. Next 5 are `secondary`.
6. Identify the background color by finding the most common `background-color` on the `<body>`, `<main>`, or top-level container elements.
7. Identify the text color by finding the most common `color` on `<p>`, `<span>`, and `<div>` elements.
8. Identify the accent color by looking for colors used on `<button>`, `<a>`, `.cta`, `.btn`, or elements with role="button".

**Typography extraction:**
1. Parse `font-family` declarations from CSS.
2. Separate heading fonts (applied to `h1`–`h6`, `.heading`, `.title` selectors) from body fonts (applied to `body`, `p`, `.text`, `main`).
3. For `font_style`, classify based on the font names:
   - "modern" — sans-serif like Inter, Helvetica, Roboto
   - "classic" — serif like Georgia, Times, Garamond
   - "playful" — display/handwriting fonts like Comic Sans, Pacifico, Lobster
   - "technical" — monospace like Fira Code, Courier, JetBrains Mono
   - "elegant" — thin/light serif or sans like Playfair, Lora, Montserrat Thin
   - "minimal" — geometric sans like Futura, Avenir, DM Sans

**Imagery analysis:**
1. Count all images. Record `has_hero_image` as true if there's an image in the first viewport-sized section (an `<img>` or background image on a full-width container near the top of the page).
2. Determine `uses_illustrations` vs photographs — this is a heuristic: if most image URLs contain words like "illustration", "icon", "svg", "vector", or if most images are SVGs, mark as illustrations.
3. Set `image_themes` and `dominant_image_mood` to placeholder values (these will be enriched in Phase 3 if an AI API is available).

### Phase 3: AI-Powered Analysis

This phase calls an LLM API (Anthropic Claude preferred, with fallback to Gemini or OpenAI) to analyze the *text content* extracted in Phase 1. It produces the `voice` and `positioning` sections of the BrandDNA.

**Prompt construction:**

Construct a single prompt that includes:
1. The first 3,000 characters of extracted text content (truncated if longer)
2. The site title and meta description
3. A list of navigation labels (extracted from `<nav>` elements)
4. Instructions to return a JSON object matching the `voice` and `positioning` schemas above

The prompt should be structured as:

```
You are a brand strategist analyzing a website. Based on the following content extracted from {url}, produce a brand analysis.

SITE TITLE: {title}
META DESCRIPTION: {description}
NAVIGATION: {nav_labels}

CONTENT:
{first_3000_chars_of_text}

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
}
```

**API call requirements:**
- Use the Anthropic Messages API with `claude-sonnet-4-20250514` as the default model
- Set `max_tokens` to 1000
- Set temperature to 0.3 (we want consistency, not creativity, in analysis)
- Parse the response as JSON. If parsing fails, retry once with a more explicit instruction to return only JSON
- If the AI API is unavailable or errors, return the BrandDNA with the voice and positioning fields set to sensible defaults:
  - `tone_descriptors: ["professional"]`
  - `formality: "neutral"`
  - `industry_guess: "unknown"`
  - etc.

**Confidence scoring:**

Set the overall `confidence` field based on:
- Start at 1.0
- Subtract 0.2 if fewer than 500 characters of text were extracted
- Subtract 0.1 if no CSS could be parsed
- Subtract 0.1 if the AI API call failed
- Subtract 0.1 if only 1 page was analyzed (when subpages were requested)
- Subtract 0.1 if no images were found
- Floor at 0.0

---

## 4. Technical Requirements

- **Language:** Node.js (TypeScript preferred, JavaScript acceptable)
- **HTTP client:** Use `fetch` (built into Node 18+) or `axios`. Do not use Puppeteer or a headless browser — keep the dependency footprint minimal.
- **HTML parsing:** Use `cheerio` for DOM operations
- **CSS parsing:** Use a lightweight CSS parser like `css` (npm) or regex extraction for simple properties
- **No external services except the LLM API:** Color extraction, typography analysis, and HTML parsing must all happen locally
- **Module format:** ES modules (import/export)
- **Export:** Default export the `extract` function. Also export the TypeScript interfaces for use by other modules.

---

## 5. File Structure

```
src/extractor/
├── index.ts              # Main extract() function, orchestrates the three phases
├── fetcher.ts            # Phase 1: HTTP fetching, HTML parsing, content extraction
├── visual-analyzer.ts    # Phase 2: Color, typography, and imagery analysis from CSS/HTML
├── ai-analyzer.ts        # Phase 3: LLM-powered voice and positioning analysis
├── types.ts              # BrandDNA interface and related types
└── utils.ts              # URL normalization, color conversion, font classification
```

---

## 6. Definition of Done

The Brand DNA Extractor is done when:

1. `extract("https://example.com")` returns a valid BrandDNA object with all fields populated
2. `extract("not-a-url")` returns gracefully with confidence 0 and an error message
3. `extract("https://thisdomaindoesnotexist12345.com")` returns gracefully with a DNS error
4. The module has no runtime dependencies beyond `cheerio`, a CSS parser, and an HTTP client
5. The AI API call is optional — the module returns a partial (but valid) BrandDNA even if the API is down
6. All color values in the output are valid hex codes
7. The function completes within 30 seconds for a typical website
8. The module exports TypeScript types that the Campaign Generator can import
