import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import * as path from 'path'

interface ConceptImageResult {
  slot: string // "A", "B", "C"
  imageUrl: string
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
    Concept Image ${slot}
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
        const prompt = `Create a professional digital ad image for a product concept.
Product concept: ${concept}
Target audience: ${audience}
Image variation: ${slot} of 3 — make each visually distinct
Style: Clean, modern, professional marketing ad creative. Use bold typography and vibrant colors.
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
