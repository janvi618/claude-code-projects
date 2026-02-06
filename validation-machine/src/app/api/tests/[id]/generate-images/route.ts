import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateConceptImages } from '@/lib/image-generator'

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

    if (test.status !== 'pending') {
      return NextResponse.json(
        { error: 'Test is not in pending status' },
        { status: 400 }
      )
    }

    // Generate concept images (3 slots: A, B, C) using only concept + audience
    const imageResults = await generateConceptImages(id, test.concept, test.audience)

    // Store image URLs as JSON in conceptImages field
    const conceptImages: Record<string, string> = {}
    for (const result of imageResults) {
      conceptImages[result.slot] = result.imageUrl
    }

    // Advance status to images_ready
    await prisma.validationTest.update({
      where: { id },
      data: {
        conceptImages: JSON.stringify(conceptImages),
        status: 'images_ready',
      },
    })

    const updatedTest = await prisma.validationTest.findUnique({
      where: { id },
    })

    return NextResponse.json({ test: updatedTest })
  } catch (error) {
    console.error('Error generating concept images:', error)
    return NextResponse.json(
      { error: 'Failed to generate concept images' },
      { status: 500 }
    )
  }
}
