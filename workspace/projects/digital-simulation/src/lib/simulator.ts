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
  const variantBudget = budget / variantCount

  const ctr = randomInRange(benchmarks.ctr.min, benchmarks.ctr.max)
  const conversionRate = randomInRange(benchmarks.conversionRate.min, benchmarks.conversionRate.max)
  const cpc = randomInRange(benchmarks.cpc.min, benchmarks.cpc.max)

  const spend = variantBudget * randomInRange(0.85, 1.0)
  const clicks = Math.round(spend / cpc)
  const impressions = Math.round(clicks / ctr)
  const visits = Math.round(clicks * randomInRange(0.7, 0.9))
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

  // Cost vs benchmark (25 pts)
  const costScore = costPerSignup < 3 ? 25 : costPerSignup < 5 ? 20 : costPerSignup < 8 ? 15 : 5
  score += costScore

  // CTR vs benchmark (25 pts)
  const ctrScore = avgCtr > 0.025 ? 25 : avgCtr > 0.015 ? 20 : avgCtr > 0.01 ? 15 : 5
  score += ctrScore

  // Conversion vs benchmark (25 pts)
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
