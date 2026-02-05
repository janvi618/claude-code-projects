import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVariants } from '@/lib/generator'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const test = await prisma.validationTest.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Update status to generating
    await prisma.validationTest.update({
      where: { id },
      data: { status: 'generating' },
    })

    // Generate variants
    const variantContents = await generateVariants(test.concept, test.audience)

    // Save variants to database
    for (const content of variantContents) {
      await prisma.variant.create({
        data: {
          testId: id,
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
      where: { id },
      data: { status: 'running' },
    })

    const updatedTest = await prisma.validationTest.findUnique({
      where: { id },
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
