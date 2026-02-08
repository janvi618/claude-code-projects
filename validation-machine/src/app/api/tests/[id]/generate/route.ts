import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVariants } from '@/lib/generator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const test = await prisma.validationTest.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (test.status !== 'image_selected') {
      return NextResponse.json(
        { error: 'Test is not in image_selected status' },
        { status: 400 }
      )
    }

    // Update status to generating
    await prisma.validationTest.update({
      where: { id },
      data: { status: 'generating' },
    })

    // Generate variants (copy)
    const variantContents = await generateVariants(test.concept, test.audience)

    // Parse variation images (preferred) or fall back to concept images
    const variationImages: Record<string, string> = test.variationImages
      ? JSON.parse(test.variationImages)
      : {}
    const conceptImages: Record<string, string> = test.conceptImages
      ? JSON.parse(test.conceptImages)
      : {}

    // Save variants to database, assigning variation images (or concept images as fallback)
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
          imageUrl: variationImages[content.name] || conceptImages[content.name] || null,
        },
      })
    }

    // Update status directly to running (images already done)
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
