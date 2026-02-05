# Validation Machine MVP - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an MVP that lets product teams submit a concept + audience and get simulated validation results with generated landing pages.

**Architecture:** Next.js app with Prisma/SQLite for data, Claude API for copy generation, dynamic routes for landing pages, and a simulation engine for mock campaign data.

**Tech Stack:** Next.js 14, React, Tailwind CSS, Prisma, SQLite (dev), Claude API, TypeScript

---

## Task 1: Project Scaffolding

**Files:**
- Create: `validation-machine/` (new project directory)

**Step 1: Create Next.js project**

```bash
cd /workspaces/lesson-3-janvi618
npx create-next-app@latest validation-machine --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

Select defaults when prompted.

**Step 2: Verify project created**

```bash
cd validation-machine && ls -la
```

Expected: See `src/`, `package.json`, `tailwind.config.ts`, etc.

**Step 3: Install dependencies**

```bash
npm install prisma @prisma/client @anthropic-ai/sdk uuid
npm install -D @types/uuid
```

**Step 4: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

## Task 2: Database Schema

**Files:**
- Modify: `validation-machine/prisma/schema.prisma`
- Create: `validation-machine/src/lib/prisma.ts`

**Step 1: Write the schema**

Replace contents of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model ValidationTest {
  id          String    @id @default(cuid())
  concept     String
  audience    String
  budget      Int       @default(300)
  maxDuration Int       @default(7)
  stopThreshold Int     @default(50)
  status      String    @default("pending") // pending, generating, running, completed
  mode        String    @default("simulation") // simulation, live
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  variants    Variant[]
  results     Results?
}

model Variant {
  id          String   @id @default(cuid())
  testId      String
  test        ValidationTest @relation(fields: [testId], references: [id], onDelete: Cascade)
  name        String   // "A", "B", "C"
  angle       String   // "benefit", "problem", "social"
  headline    String
  subhead     String
  bullets     String   // JSON array
  ctaText     String
  imageUrl    String?

  // Generated ad copy
  adShortCopy   String?
  adMediumCopy  String?

  // Metrics (simulated or real)
  impressions   Int     @default(0)
  clicks        Int     @default(0)
  visits        Int     @default(0)
  signups       Int     @default(0)
  spend         Float   @default(0)

  signupList    Signup[]
  createdAt     DateTime @default(now())
}

model Signup {
  id          String   @id @default(cuid())
  variantId   String
  variant     Variant  @relation(fields: [variantId], references: [id], onDelete: Cascade)
  email       String
  source      String?  // utm params
  device      String?
  location    String?
  createdAt   DateTime @default(now())
}

model Results {
  id          String   @id @default(cuid())
  testId      String   @unique
  test        ValidationTest @relation(fields: [testId], references: [id], onDelete: Cascade)

  score           Int      // 0-100
  recommendation  String   // "go", "promising", "no-go"
  summary         String   // AI-generated summary
  winningVariant  String?  // variant id

  totalSignups    Int
  totalSpend      Float
  costPerSignup   Float
  avgCtr          Float
  avgConversion   Float

  createdAt   DateTime @default(now())
}
```

**Step 2: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 3: Set database URL**

Update `.env`:

```
DATABASE_URL="file:./dev.db"
```

**Step 4: Push schema to database**

```bash
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add database schema for validation tests"
```

---

## Task 3: API Route - Create Test

**Files:**
- Create: `validation-machine/src/app/api/tests/route.ts`

**Step 1: Create the API route**

Create `src/app/api/tests/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { concept, audience, budget, maxDuration, stopThreshold, mode } = await request.json()

    if (!concept || !audience) {
      return NextResponse.json(
        { error: 'Concept and audience are required' },
        { status: 400 }
      )
    }

    const test = await prisma.validationTest.create({
      data: {
        concept,
        audience,
        budget: budget || 300,
        maxDuration: maxDuration || 7,
        stopThreshold: stopThreshold || 50,
        mode: mode || 'simulation',
        status: 'pending',
      },
    })

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tests = await prisma.validationTest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        results: true,
      },
    })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    )
  }
}
```

**Step 2: Test the API**

```bash
npm run dev &
sleep 5
curl -X POST http://localhost:3000/api/tests \
  -H "Content-Type: application/json" \
  -d '{"concept":"Meal planning app for busy parents","audience":"Parents 30-45, dual income, suburban"}'
```

Expected: JSON response with created test object.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add API route for creating validation tests"
```

---

## Task 4: Asset Generator - Claude Integration

**Files:**
- Create: `validation-machine/src/lib/generator.ts`
- Create: `validation-machine/src/app/api/tests/[id]/generate/route.ts`

**Step 1: Create the generator library**

Create `src/lib/generator.ts`:

```typescript
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
```

**Step 2: Create the generate API route**

Create `src/app/api/tests/[id]/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVariants } from '@/lib/generator'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.validationTest.findUnique({
      where: { id: params.id },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Update status to generating
    await prisma.validationTest.update({
      where: { id: params.id },
      data: { status: 'generating' },
    })

    // Generate variants
    const variantContents = await generateVariants(test.concept, test.audience)

    // Save variants to database
    for (const content of variantContents) {
      await prisma.variant.create({
        data: {
          testId: params.id,
          name: content.name,
          angle: content.angle,
          headline: content.headline,
          subhead: content.subhead,
          bullets: JSON.stringify(content.bullets),
          ctaText: content.ctaText,
          adShortCopy: content.adShortCopy,
          adMediumCopy: content.adMediumCopy,
        },
      })
    }

    // Update status
    await prisma.validationTest.update({
      where: { id: params.id },
      data: { status: 'running' },
    })

    const updatedTest = await prisma.validationTest.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    return NextResponse.json({ test: updatedTest })
  } catch (error) {
    console.error('Error generating variants:', error)
    return NextResponse.json(
      { error: 'Failed to generate variants' },
      { status: 500 }
    )
  }
}
```

**Step 3: Add environment variable**

Update `.env`:

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=your-key-here-or-leave-blank-for-mock
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Claude-powered asset generator with mock fallback"
```

---

## Task 5: Landing Page Templates

**Files:**
- Create: `validation-machine/src/app/lp/[testId]/[variant]/page.tsx`
- Create: `validation-machine/src/app/api/lp/[testId]/[variant]/signup/route.ts`

**Step 1: Create landing page component**

Create `src/app/lp/[testId]/[variant]/page.tsx`:

```typescript
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SignupForm } from './SignupForm'

interface Props {
  params: { testId: string; variant: string }
  searchParams: { utm_source?: string; utm_campaign?: string }
}

export default async function LandingPage({ params, searchParams }: Props) {
  const variant = await prisma.variant.findFirst({
    where: {
      testId: params.testId,
      name: params.variant.toUpperCase(),
    },
    include: { test: true },
  })

  if (!variant) {
    notFound()
  }

  const bullets = JSON.parse(variant.bullets) as string[]
  const utmSource = searchParams.utm_source || 'direct'

  // Track visit
  await prisma.variant.update({
    where: { id: variant.id },
    data: { visits: { increment: 1 } },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {variant.headline}
          </h1>
          <p className="text-xl text-gray-600">
            {variant.subhead}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <ul className="space-y-4">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <SignupForm
            variantId={variant.id}
            ctaText={variant.ctaText}
            utmSource={utmSource}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          This is a product validation page. We're testing interest before building.
          Your email will only be used to notify you if we launch.
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Create signup form client component**

Create `src/app/lp/[testId]/[variant]/SignupForm.tsx`:

```typescript
'use client'

import { useState } from 'react'

interface Props {
  variantId: string
  ctaText: string
  utmSource: string
}

export function SignupForm({ variantId, ctaText, utmSource }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch(`/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          email,
          source: utmSource,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          You're on the list!
        </h3>
        <p className="text-gray-600">
          We'll notify you when we launch. Thanks for your interest!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing up...' : ctaText}
      </button>
      <p className="text-xs text-gray-500 text-center">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
```

**Step 3: Create signup API route**

Create `src/app/api/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { variantId, email, source } = await request.json()

    if (!variantId || !email) {
      return NextResponse.json(
        { error: 'Variant ID and email are required' },
        { status: 400 }
      )
    }

    // Check if variant exists
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
    })

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
    }

    // Create signup
    const signup = await prisma.signup.create({
      data: {
        variantId,
        email,
        source: source || 'direct',
      },
    })

    // Update variant signup count
    await prisma.variant.update({
      where: { id: variantId },
      data: { signups: { increment: 1 } },
    })

    return NextResponse.json({ signup })
  } catch (error) {
    console.error('Error creating signup:', error)
    return NextResponse.json(
      { error: 'Failed to create signup' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add dynamic landing pages with signup tracking"
```

---

## Task 6: Simulation Engine

**Files:**
- Create: `validation-machine/src/lib/simulator.ts`
- Create: `validation-machine/src/app/api/tests/[id]/simulate/route.ts`

**Step 1: Create simulator library**

Create `src/lib/simulator.ts`:

```typescript
interface SimulatedMetrics {
  impressions: number
  clicks: number
  visits: number
  signups: number
  spend: number
}

interface Benchmarks {
  ctr: { min: number; max: number }
  conversionRate: { min: number; max: number }
  cpc: { min: number; max: number }
}

const DEFAULT_BENCHMARKS: Benchmarks = {
  ctr: { min: 0.01, max: 0.03 },
  conversionRate: { min: 0.10, max: 0.25 },
  cpc: { min: 0.50, max: 2.00 },
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function simulateVariantMetrics(
  budget: number,
  variantCount: number,
  benchmarks: Benchmarks = DEFAULT_BENCHMARKS
): SimulatedMetrics {
  // Budget per variant
  const variantBudget = budget / variantCount

  // Randomize performance within benchmarks
  const ctr = randomInRange(benchmarks.ctr.min, benchmarks.ctr.max)
  const conversionRate = randomInRange(benchmarks.conversionRate.min, benchmarks.conversionRate.max)
  const cpc = randomInRange(benchmarks.cpc.min, benchmarks.cpc.max)

  // Calculate metrics
  const spend = variantBudget * randomInRange(0.85, 1.0) // Spend 85-100% of budget
  const clicks = Math.round(spend / cpc)
  const impressions = Math.round(clicks / ctr)
  const visits = Math.round(clicks * randomInRange(0.7, 0.9)) // 70-90% of clicks visit
  const signups = Math.round(visits * conversionRate)

  return {
    impressions,
    clicks,
    visits,
    signups,
    spend: Math.round(spend * 100) / 100,
  }
}

export function calculateScore(
  totalSignups: number,
  targetSignups: number,
  costPerSignup: number,
  avgCtr: number,
  avgConversion: number
): { score: number; recommendation: 'go' | 'promising' | 'no-go' } {
  let score = 0

  // Volume vs target (25 pts)
  const volumeRatio = totalSignups / targetSignups
  score += Math.min(25, Math.round(volumeRatio * 25))

  // Cost vs benchmark (25 pts) - Lower is better, benchmark $5
  const costScore = costPerSignup < 3 ? 25 : costPerSignup < 5 ? 20 : costPerSignup < 8 ? 15 : 5
  score += costScore

  // CTR vs benchmark (25 pts) - benchmark 1-2%
  const ctrScore = avgCtr > 0.025 ? 25 : avgCtr > 0.015 ? 20 : avgCtr > 0.01 ? 15 : 5
  score += ctrScore

  // Conversion vs benchmark (25 pts) - benchmark 10-15%
  const convScore = avgConversion > 0.2 ? 25 : avgConversion > 0.15 ? 20 : avgConversion > 0.1 ? 15 : 5
  score += convScore

  const recommendation = score >= 70 ? 'go' : score >= 40 ? 'promising' : 'no-go'

  return { score, recommendation }
}

export function generateSummary(
  recommendation: string,
  score: number,
  winningVariant: string,
  metrics: { signups: number; costPerSignup: number; ctr: number; conversion: number }
): string {
  const recText = {
    'go': 'Strong interest detected. The data supports moving forward with development.',
    'promising': 'Moderate interest detected. Consider refining the concept or running additional tests.',
    'no-go': 'Limited interest detected. The concept may need significant changes or pivoting.',
  }[recommendation] || ''

  return `
## Recommendation: ${recommendation.toUpperCase()}

**Score: ${score}/100**

${recText}

### Key Findings

- **Total Signups:** ${metrics.signups} interested prospects
- **Cost per Signup:** $${metrics.costPerSignup.toFixed(2)} (benchmark: $5-8)
- **Click-through Rate:** ${(metrics.ctr * 100).toFixed(1)}% (benchmark: 1-2%)
- **Conversion Rate:** ${(metrics.conversion * 100).toFixed(1)}% (benchmark: 10-15%)

### Winning Variant

Variant ${winningVariant} performed best, generating the most signups at the lowest cost.

### Next Steps

${recommendation === 'go'
  ? '1. Proceed with prototype development\n2. Use winning variant messaging\n3. Reach out to collected emails for early feedback'
  : recommendation === 'promising'
  ? '1. Review variant performance for insights\n2. Consider A/B testing refined messaging\n3. Evaluate if pivot is needed'
  : '1. Analyze why interest was low\n2. Consider significant concept changes\n3. Test alternative positioning'
}
  `.trim()
}
```

**Step 2: Create simulate API route**

Create `src/app/api/tests/[id]/simulate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { simulateVariantMetrics, calculateScore, generateSummary } from '@/lib/simulator'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.validationTest.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (test.variants.length === 0) {
      return NextResponse.json(
        { error: 'No variants found. Generate assets first.' },
        { status: 400 }
      )
    }

    // Simulate metrics for each variant
    for (const variant of test.variants) {
      const metrics = simulateVariantMetrics(test.budget, test.variants.length)

      await prisma.variant.update({
        where: { id: variant.id },
        data: {
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          visits: metrics.visits,
          signups: metrics.signups,
          spend: metrics.spend,
        },
      })
    }

    // Get updated variants
    const updatedVariants = await prisma.variant.findMany({
      where: { testId: params.id },
    })

    // Calculate totals and averages
    const totalSignups = updatedVariants.reduce((sum, v) => sum + v.signups, 0)
    const totalSpend = updatedVariants.reduce((sum, v) => sum + v.spend, 0)
    const totalClicks = updatedVariants.reduce((sum, v) => sum + v.clicks, 0)
    const totalImpressions = updatedVariants.reduce((sum, v) => sum + v.impressions, 0)
    const totalVisits = updatedVariants.reduce((sum, v) => sum + v.visits, 0)

    const costPerSignup = totalSignups > 0 ? totalSpend / totalSignups : 0
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const avgConversion = totalVisits > 0 ? totalSignups / totalVisits : 0

    // Find winning variant
    const winningVariant = updatedVariants.reduce((best, v) =>
      v.signups > best.signups ? v : best
    )

    // Calculate score
    const { score, recommendation } = calculateScore(
      totalSignups,
      test.stopThreshold,
      costPerSignup,
      avgCtr,
      avgConversion
    )

    // Generate summary
    const summary = generateSummary(recommendation, score, winningVariant.name, {
      signups: totalSignups,
      costPerSignup,
      ctr: avgCtr,
      conversion: avgConversion,
    })

    // Save results
    await prisma.results.upsert({
      where: { testId: params.id },
      update: {
        score,
        recommendation,
        summary,
        winningVariant: winningVariant.id,
        totalSignups,
        totalSpend,
        costPerSignup,
        avgCtr,
        avgConversion,
      },
      create: {
        testId: params.id,
        score,
        recommendation,
        summary,
        winningVariant: winningVariant.id,
        totalSignups,
        totalSpend,
        costPerSignup,
        avgCtr,
        avgConversion,
      },
    })

    // Update test status
    await prisma.validationTest.update({
      where: { id: params.id },
      data: { status: 'completed' },
    })

    const finalTest = await prisma.validationTest.findUnique({
      where: { id: params.id },
      include: { variants: true, results: true },
    })

    return NextResponse.json({ test: finalTest })
  } catch (error) {
    console.error('Error simulating test:', error)
    return NextResponse.json(
      { error: 'Failed to simulate test' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add simulation engine with scoring and recommendations"
```

---

## Task 7: Dashboard UI - Test List

**Files:**
- Modify: `validation-machine/src/app/page.tsx`
- Create: `validation-machine/src/app/new/page.tsx`

**Step 1: Create home page with test list**

Replace `src/app/page.tsx`:

```typescript
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tests = await prisma.validationTest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { results: true },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Validation Machine</h1>
          <Link
            href="/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Test
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Validation Tests</h2>

        {tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No tests yet</p>
            <Link href="/new" className="text-blue-600 hover:text-blue-800">
              Create your first validation test
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/test/${test.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.concept.slice(0, 60)}...
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {test.audience.slice(0, 80)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      test.status === 'completed'
                        ? test.results?.recommendation === 'go'
                          ? 'bg-green-100 text-green-700'
                          : test.results?.recommendation === 'promising'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {test.status === 'completed'
                        ? test.results?.recommendation.toUpperCase()
                        : test.status.toUpperCase()}
                    </span>
                    {test.results && (
                      <p className="text-sm text-gray-500 mt-1">
                        Score: {test.results.score}/100
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Created {new Date(test.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add dashboard homepage with test list"
```

---

## Task 8: Dashboard UI - New Test Form

**Files:**
- Create: `validation-machine/src/app/new/page.tsx`

**Step 1: Create new test form page**

Create `src/app/new/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTestPage() {
  const router = useRouter()
  const [concept, setConcept] = useState('')
  const [audience, setAudience] = useState('')
  const [budget, setBudget] = useState(300)
  const [maxDuration, setMaxDuration] = useState(7)
  const [stopThreshold, setStopThreshold] = useState(50)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!concept || !audience) return

    setLoading(true)
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          audience,
          budget,
          maxDuration,
          stopThreshold,
          mode: 'simulation',
        }),
      })

      if (res.ok) {
        const { test } = await res.json()
        router.push(`/test/${test.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back to Tests
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Validation Test</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Concept
            </label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Describe your product or feature idea in detail..."
              rows={4}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Subscription meal planning app for busy parents who want healthy dinners without the mental load of deciding what to cook"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Describe who this is for..."
              rows={3}
              required
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Parents 30-45, household income $75k+, suburban, both parents working, shops at Whole Foods/Trader Joe's"
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                min={100}
                max={10000}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Days
              </label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                min={1}
                max={30}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Signups
              </label>
              <input
                type="number"
                value={stopThreshold}
                onChange={(e) => setStopThreshold(parseInt(e.target.value))}
                min={10}
                max={1000}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Simulation Mode:</strong> This test will use simulated data based on industry benchmarks. No actual ads will run.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !concept || !audience}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Validation Test'}
          </button>
        </form>
      </main>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add new test creation form"
```

---

## Task 9: Dashboard UI - Test Details & Results

**Files:**
- Create: `validation-machine/src/app/test/[id]/page.tsx`

**Step 1: Create test detail page**

Create `src/app/test/[id]/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Variant {
  id: string
  name: string
  angle: string
  headline: string
  impressions: number
  clicks: number
  visits: number
  signups: number
  spend: number
}

interface Results {
  score: number
  recommendation: string
  summary: string
  totalSignups: number
  totalSpend: number
  costPerSignup: number
  avgCtr: number
  avgConversion: number
}

interface Test {
  id: string
  concept: string
  audience: string
  budget: number
  status: string
  variants: Variant[]
  results: Results | null
}

export default function TestDetailPage() {
  const params = useParams()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [simulating, setSimulating] = useState(false)

  const fetchTest = async () => {
    const res = await fetch(`/api/tests/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setTest(data.test)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTest()
  }, [params.id])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch(`/api/tests/${params.id}/generate`, { method: 'POST' })
      await fetchTest()
    } finally {
      setGenerating(false)
    }
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      await fetch(`/api/tests/${params.id}/simulate`, { method: 'POST' })
      await fetchTest()
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!test) {
    return <div className="min-h-screen flex items-center justify-center">Test not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back to Tests
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Test Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{test.concept}</h1>
          <p className="text-gray-600 mb-4">{test.audience}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Budget: ${test.budget}</span>
            <span>Status: {test.status}</span>
          </div>
        </div>

        {/* Actions */}
        {test.status === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 1: Generate Assets</h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Landing Pages & Ads'}
            </button>
          </div>
        )}

        {test.status === 'running' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Run Simulation</h2>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        )}

        {/* Results */}
        {test.results && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Results</h2>
              <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                test.results.recommendation === 'go'
                  ? 'bg-green-100 text-green-700'
                  : test.results.recommendation === 'promising'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {test.results.recommendation.toUpperCase()} - {test.results.score}/100
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{test.results.totalSignups}</div>
                <div className="text-sm text-gray-500">Total Signups</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">${test.results.costPerSignup.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Cost per Signup</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{(test.results.avgCtr * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Avg CTR</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{(test.results.avgConversion * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Conversion Rate</div>
              </div>
            </div>

            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                {test.results.summary}
              </pre>
            </div>
          </div>
        )}

        {/* Variants */}
        {test.variants.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Landing Page Variants</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {test.variants.map((variant) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">Variant {variant.name}</span>
                    <span className="text-xs text-gray-500">{variant.angle}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{variant.headline}</p>

                  {test.status === 'completed' && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Signups: {variant.signups}</div>
                      <div>Visits: {variant.visits}</div>
                      <div>Spend: ${variant.spend.toFixed(2)}</div>
                    </div>
                  )}

                  <Link
                    href={`/lp/${test.id}/${variant.name}`}
                    target="_blank"
                    className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview Landing Page →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
```

**Step 2: Create test detail API route**

Create `src/app/api/tests/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await prisma.validationTest.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        results: true,
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add test detail page with results dashboard"
```

---

## Task 10: Final Polish & Testing

**Step 1: Update global styles**

Ensure `src/app/globals.css` has:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 2: Create .env.example**

Create `.env.example`:

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=your-key-here-or-leave-blank-for-mock
```

**Step 3: Update .gitignore**

Ensure `.gitignore` includes:

```
.env
.env.local
prisma/*.db
prisma/*.db-journal
```

**Step 4: Test the full flow**

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "+ New Test"
3. Enter concept and audience
4. Click "Create Validation Test"
5. Click "Generate Landing Pages & Ads"
6. Click "Run Simulation"
7. View results and landing pages

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: final polish and documentation"
```

---

## Summary

**Total Tasks:** 10
**Estimated Time:** 3-4 hours hands-on
**Files Created:** ~15 new files

**What you'll have:**
- Working intake form
- AI-generated landing page variants (with mock fallback)
- Dynamic landing pages with signup tracking
- Simulation engine with realistic metrics
- Results dashboard with Go/No-Go scoring
- Full end-to-end flow working locally

**Next phase (not in this plan):**
- Meta API integration for live campaigns
- Email nurture automation
- Team accounts
