# Brand DNA Extractor

This module implements the Brand DNA Extractor as specified in `specs/brand-dna-extractor.md`. 

## Architecture

The extractor operates in three phases:

1. **Phase 1: Fetch & Parse** (`fetcher.ts`)
   - Fetches website HTML, CSS, and images
   - Extracts text content and metadata
   - Optionally fetches subpages

2. **Phase 2: Visual Analysis** (`visual-analyzer.ts`)
   - Deterministic extraction of colors from CSS/HTML
   - Typography analysis and font classification
   - Basic imagery analysis

3. **Phase 3: AI-Powered Analysis** (`ai-analyzer.ts`)
   - LLM-powered analysis of voice and positioning
   - Uses Anthropic Claude API with fallback to defaults

## Usage

```typescript
import { extract } from './src/extractor/index.js';

const brandDNA = await extract('https://example.com', {
  timeout_ms: 15000,
  max_pages: 3,
  include_subpages: true
});
```

## Error Handling

The extractor never throws unhandled exceptions. All errors are captured and returned as part of the BrandDNA object with:
- `confidence: 0`
- Error message in `meta.error` field

## Dependencies

- `cheerio`: HTML parsing and DOM manipulation
- `css`: CSS parsing and AST analysis  
- `axios`: HTTP client for fetching content
- Anthropic API: AI-powered text analysis (optional)

## Environment Variables

- `ANTHROPIC_API_KEY`: Required for AI analysis. If not provided, returns default values with lower confidence.