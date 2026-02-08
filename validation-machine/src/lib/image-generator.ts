import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

interface ConceptImageResult {
  slot: string // "A", "B", "C"
  imageUrl: string
}

interface VariationImageResult {
  slot: string // "A", "B", "C"
  imageUrl: string
  style: string // e.g. "minimalist", "bold", "elegant"
}

const VARIATION_STYLES = [
  { slot: 'A', style: 'minimalist', label: 'Minimalist' },
  { slot: 'B', style: 'bold', label: 'Bold & Vibrant' },
  { slot: 'C', style: 'elegant', label: 'Elegant Premium' },
]

function generateVariationMockSvg(
  slot: string,
  style: string,
  concept: string,
  audience: string
): string {
  const styleThemes: Record<string, { bg1: string; bg2: string; accent: string; textBg: string }> = {
    minimalist: { bg1: '#f8fafc', bg2: '#e2e8f0', accent: '#334155', textBg: '#1e293b' },
    bold: { bg1: '#dc2626', bg2: '#f97316', accent: '#ffffff', textBg: '#7c2d12' },
    elegant: { bg1: '#1e1b4b', bg2: '#312e81', accent: '#c4b5fd', textBg: '#4c1d95' },
  }
  const theme = styleThemes[style] || styleThemes.minimalist

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
  <defs>
    <linearGradient id="bg-${slot}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.bg1}" />
      <stop offset="100%" style="stop-color:${theme.bg2}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="628" fill="url(#bg-${slot})" rx="16" />
  <text x="600" y="200" text-anchor="middle" fill="${theme.accent}" font-family="system-ui, sans-serif" font-size="44" font-weight="bold">
    ${escapeXml(truncate(concept, 50))}
  </text>
  <text x="600" y="270" text-anchor="middle" fill="${theme.accent}" opacity="0.7" font-family="system-ui, sans-serif" font-size="22">
    ${escapeXml(truncate(audience, 70))}
  </text>
  <rect x="400" y="330" width="400" height="50" rx="25" fill="${theme.textBg}" />
  <text x="600" y="363" text-anchor="middle" fill="${theme.accent}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">
    Learn More
  </text>
  <text x="600" y="530" text-anchor="middle" fill="${theme.accent}" opacity="0.4" font-family="system-ui, sans-serif" font-size="14">
    Style: ${escapeXml(style.charAt(0).toUpperCase() + style.slice(1))} — Variation ${slot}
  </text>
</svg>`
}

function generateConceptMockSvg(slot: string, concept: string, audience: string): string {
  const gradients: Record<string, [string, string]> = {
    A: ['#6366f1', '#8b5cf6'],
    B: ['#10b981', '#34d399'],
    C: ['#f59e0b', '#fbbf24'],
  }
  const [color1, color2] = gradients[slot] || ['#64748b', '#94a3b8']

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1}" />
      <stop offset="100%" style="stop-color:${color2}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="628" fill="url(#bg)" rx="16" />
  <text x="600" y="240" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="44" font-weight="bold">
    ${escapeXml(truncate(concept, 50))}
  </text>
  <text x="600" y="310" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui, sans-serif" font-size="22">
    ${escapeXml(truncate(audience, 70))}
  </text>
  <rect x="450" y="370" width="300" height="60" rx="30" fill="white" />
  <text x="600" y="408" text-anchor="middle" fill="${color1}" font-family="system-ui, sans-serif" font-size="20" font-weight="bold">
    Learn More
  </text>
  <text x="600" y="560" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="system-ui, sans-serif" font-size="16">
    Product Concept ${slot}
  </text>
</svg>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export async function generateConceptImages(
  testId: string,
  concept: string,
  audience: string
): Promise<ConceptImageResult[]> {
  const outputDir = path.join(process.cwd(), 'public', 'generated')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const slots = ['A', 'B', 'C']
  const apiKey = process.env.GEMINI_API_KEY
  const results: ConceptImageResult[] = []

  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      } as any,
    })

    for (const slot of slots) {
      try {
        const prompt = `Photorealistic CPG product concept render for: ${concept}.
Target consumer: ${audience}.
Show a front-facing package (standing pouch / slim can / cup / jar—choose what fits the product) on a clean studio set with soft natural shadows, plus a styled hero serving next to it.
Packaging looks shelf-ready with premium modern design, minimal but bold typography, simple icon system, and 2–3 claim badges derived from the product concept.
Background: bright, contemporary grocery endcap aesthetic, slight depth of field bokeh.
Lighting: softbox studio lighting, high detail, 8k, product photography, realistic materials (matte label, embossed foil accent, condensation if beverage).
Composition: package centered, hero serving 1/3 frame, subtle props that reinforce the flavor or product use case.
Variation ${slot} of 3 — each variation should differ in packaging format, color palette, or serving presentation while keeping the same product concept.
No people, no logos from real companies. Landscape format (1200x628).`

        const response = await model.generateContent(prompt)
        const parts = response.response.candidates?.[0]?.content?.parts || []

        let saved = false
        for (const part of parts) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const partAny = part as any
          if (partAny.inlineData && typeof partAny.inlineData === 'object') {
            const inlineData = partAny.inlineData as {
              data: string
              mimeType: string
            }
            const buffer = Buffer.from(inlineData.data, 'base64')
            const ext = inlineData.mimeType === 'image/png' ? 'png' : 'jpg'
            const filename = `${testId}-${slot}.${ext}`
            fs.writeFileSync(path.join(outputDir, filename), buffer)
            results.push({
              slot,
              imageUrl: `/generated/${filename}`,
            })
            saved = true
            break
          }
        }

        if (!saved) {
          const svg = generateConceptMockSvg(slot, concept, audience)
          const filename = `${testId}-${slot}.svg`
          fs.writeFileSync(path.join(outputDir, filename), svg)
          results.push({ slot, imageUrl: `/generated/${filename}` })
        }
      } catch (error) {
        console.error(`Gemini image generation failed for slot ${slot}:`, error)
        const svg = generateConceptMockSvg(slot, concept, audience)
        const filename = `${testId}-${slot}.svg`
        fs.writeFileSync(path.join(outputDir, filename), svg)
        results.push({ slot, imageUrl: `/generated/${filename}` })
      }
    }
  } else {
    console.log('No GEMINI_API_KEY found — generating SVG mock concept images')
    for (const slot of slots) {
      const svg = generateConceptMockSvg(slot, concept, audience)
      const filename = `${testId}-${slot}.svg`
      fs.writeFileSync(path.join(outputDir, filename), svg)
      results.push({ slot, imageUrl: `/generated/${filename}` })
    }
  }

  return results
}

export async function generateImageVariations(
  testId: string,
  selectedImageUrl: string,
  concept: string,
  audience: string
): Promise<VariationImageResult[]> {
  const outputDir = path.join(process.cwd(), 'public', 'generated')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const results: VariationImageResult[] = []

  if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      } as any,
    })

    for (const variation of VARIATION_STYLES) {
      try {
        const prompt = `Create a professional digital ad image for a product concept.
Product concept: ${concept}
Target audience: ${audience}
Style direction: ${variation.style} — ${variation.label}
This is a style VARIATION of the same concept. Keep the core visual idea but apply a ${variation.style} aesthetic.
${variation.style === 'minimalist' ? 'Use clean lines, lots of white space, simple shapes, muted colors.' : ''}
${variation.style === 'bold' ? 'Use bold colors, high contrast, dynamic composition, energetic feel.' : ''}
${variation.style === 'elegant' ? 'Use dark tones, gold or silver accents, refined typography feel, luxury aesthetic.' : ''}
The image should be landscape format suitable for a social media ad (1200x628).
Do NOT include any text in the image - just the visual creative.`

        const response = await model.generateContent(prompt)
        const parts = response.response.candidates?.[0]?.content?.parts || []

        let saved = false
        for (const part of parts) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const partAny = part as any
          if (partAny.inlineData && typeof partAny.inlineData === 'object') {
            const inlineData = partAny.inlineData as {
              data: string
              mimeType: string
            }
            const buffer = Buffer.from(inlineData.data, 'base64')
            const ext = inlineData.mimeType === 'image/png' ? 'png' : 'jpg'
            const filename = `${testId}-var-${variation.slot}.${ext}`
            fs.writeFileSync(path.join(outputDir, filename), buffer)
            results.push({
              slot: variation.slot,
              imageUrl: `/generated/${filename}`,
              style: variation.style,
            })
            saved = true
            break
          }
        }

        if (!saved) {
          const svg = generateVariationMockSvg(variation.slot, variation.style, concept, audience)
          const filename = `${testId}-var-${variation.slot}.svg`
          fs.writeFileSync(path.join(outputDir, filename), svg)
          results.push({ slot: variation.slot, imageUrl: `/generated/${filename}`, style: variation.style })
        }
      } catch (error) {
        console.error(`Gemini variation generation failed for ${variation.style}:`, error)
        const svg = generateVariationMockSvg(variation.slot, variation.style, concept, audience)
        const filename = `${testId}-var-${variation.slot}.svg`
        fs.writeFileSync(path.join(outputDir, filename), svg)
        results.push({ slot: variation.slot, imageUrl: `/generated/${filename}`, style: variation.style })
      }
    }
  } else {
    console.log('No GEMINI_API_KEY found — generating SVG mock variation images')
    for (const variation of VARIATION_STYLES) {
      const svg = generateVariationMockSvg(variation.slot, variation.style, concept, audience)
      const filename = `${testId}-var-${variation.slot}.svg`
      fs.writeFileSync(path.join(outputDir, filename), svg)
      results.push({ slot: variation.slot, imageUrl: `/generated/${filename}`, style: variation.style })
    }
  }

  return results
}
