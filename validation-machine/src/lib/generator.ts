import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

interface VariantContent {
  name: string
  angle: string
  headline: string
  subhead: string
  bullets: string[]
  ctaText: string
  adShortCopy: string
  adMediumCopy: string
}

export async function generateVariants(
  concept: string,
  audience: string
): Promise<VariantContent[]> {
  // If no API key, return mock data
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockVariants(concept)
  }

  const prompt = `You are a marketing copywriter. Generate landing page content for a product validation test.

Product Concept: ${concept}
Target Audience: ${audience}

Generate 3 variants with different angles:
- Variant A: Benefit-focused (lead with the positive outcome)
- Variant B: Problem-focused (lead with the pain point being solved)
- Variant C: Social proof (lead with validation/trust signals)

For each variant, provide:
1. headline (max 10 words)
2. subhead (max 20 words)
3. bullets (exactly 3 benefit points, max 10 words each)
4. ctaText (call to action button text, max 5 words)
5. adShortCopy (punchy ad copy, max 15 words)
6. adMediumCopy (explanatory ad copy, max 30 words)

Respond in JSON format:
{
  "variants": [
    {
      "name": "A",
      "angle": "benefit",
      "headline": "...",
      "subhead": "...",
      "bullets": ["...", "...", "..."],
      "ctaText": "...",
      "adShortCopy": "...",
      "adMediumCopy": "..."
    },
    ...
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.variants
}

function getMockVariants(concept: string): VariantContent[] {
  const shortConcept = concept.slice(0, 30)

  return [
    {
      name: 'A',
      angle: 'benefit',
      headline: `Transform Your Life with ${shortConcept}`,
      subhead: 'Experience the future of convenience and efficiency today.',
      bullets: [
        'Save hours every week',
        'Simple and intuitive to use',
        'Results you can measure',
      ],
      ctaText: 'Get Early Access',
      adShortCopy: `Discover ${shortConcept}. Join thousands getting early access.`,
      adMediumCopy: `Ready for a better way? ${shortConcept} is coming soon. Sign up now for exclusive early access and special launch pricing.`,
    },
    {
      name: 'B',
      angle: 'problem',
      headline: `Tired of the Same Old Problems?`,
      subhead: `${shortConcept} solves what others can't.`,
      bullets: [
        'No more wasted time',
        'No more frustration',
        'No more compromises',
      ],
      ctaText: 'Solve It Now',
      adShortCopy: 'Stop struggling. There\'s a better way coming soon.',
      adMediumCopy: `We know the frustration. That's why we're building ${shortConcept}. Sign up to be first in line when we launch.`,
    },
    {
      name: 'C',
      angle: 'social',
      headline: 'Join 10,000+ Early Adopters',
      subhead: `Be part of the ${shortConcept} revolution.`,
      bullets: [
        'Backed by industry experts',
        'Featured in top publications',
        'Trusted by early users',
      ],
      ctaText: 'Join the Waitlist',
      adShortCopy: 'Thousands are already signed up. Don\'t miss out.',
      adMediumCopy: `The waitlist is growing fast for ${shortConcept}. Join forward-thinking people who want early access to what's next.`,
    },
  ]
}
