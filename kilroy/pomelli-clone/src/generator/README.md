# Campaign Generator Module

This module generates on-brand marketing campaigns based on Brand DNA profiles extracted by the extractor module.

## Overview

The Campaign Generator is the creative engine of the Pomelli Clone. It takes a BrandDNA profile and campaign request, then uses Claude API to generate multiple distinct campaign concepts with platform-specific social media posts.

## Key Features

- **Multi-concept Generation**: Creates 3 distinct campaign approaches by default
- **Platform-specific Optimization**: Tailors content for Instagram, LinkedIn, X, Facebook, and TikTok
- **Brand-aligned Content**: Uses BrandDNA to ensure campaigns match brand voice, colors, and positioning
- **Character Limit Enforcement**: Automatically validates and truncates posts to platform limits (especially X's 280-char limit)
- **Robust Error Handling**: Returns empty results gracefully if API calls fail

## Usage

```typescript
import { generate } from './src/generator/index.js';

const campaigns = await generate(brandDNA, {
  goal: "promote our spring sale",
  num_concepts: 3,
  platforms: ["instagram", "linkedin", "x"],
  posts_per_platform: 2
});
```

## Architecture

- `index.ts` - Main generate() function
- `prompt-builder.ts` - Constructs system and user prompts from BrandDNA
- `api-client.ts` - Handles Claude API calls with retry logic
- `validator.ts` - Post-generation validation and platform-specific checks
- `types.ts` - TypeScript interfaces

## Configuration

The module uses the Anthropic Claude API. Set the `ANTHROPIC_API_KEY` environment variable.

## Platform Guidelines

- **Instagram**: Visual/emotional, emoji-friendly, CTA required
- **LinkedIn**: Professional thought leadership, question endings
- **X (Twitter)**: Sharp/concise, 280 character limit strictly enforced
- **Facebook**: Conversational, community-oriented
- **TikTok**: Casual, trend-aware, video concepts

## Error Handling

The generator is designed to never throw unhandled exceptions. If API calls fail or JSON parsing fails, it returns an empty `concepts` array with proper metadata.