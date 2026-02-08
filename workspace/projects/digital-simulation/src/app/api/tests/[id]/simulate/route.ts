import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { simulateVariantMetrics, calculateScore, generateSummary } from '@/lib/simulator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const test = await prisma.validationTest.findUnique({
      where: { id },
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
      where: { testId: id },
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
      where: { testId: id },
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
        testId: id,
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
      where: { id },
      data: { status: 'completed' },
    })

    const finalTest = await prisma.validationTest.findUnique({
      where: { id },
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
