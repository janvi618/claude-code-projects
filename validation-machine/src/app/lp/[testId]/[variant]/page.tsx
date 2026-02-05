import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SignupForm } from './SignupForm'

interface Props {
  params: Promise<{ testId: string; variant: string }>
  searchParams: Promise<{ utm_source?: string; utm_campaign?: string }>
}

export default async function LandingPage({ params, searchParams }: Props) {
  const { testId, variant: variantName } = await params
  const { utm_source } = await searchParams

  const variant = await prisma.variant.findFirst({
    where: {
      testId,
      name: variantName.toUpperCase(),
    },
    include: { test: true },
  })

  if (!variant) {
    notFound()
  }

  const bullets = JSON.parse(variant.bullets) as string[]
  const utmSource = utm_source || 'direct'

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
