import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateImageVariations } from '@/lib/image-generator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { selectedImage } = body

    if (!selectedImage || typeof selectedImage !== 'string') {
      return NextResponse.json(
        { error: 'selectedImage is required' },
        { status: 400 }
      )
    }

    const test = await prisma.validationTest.findUnique({
      where: { id },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (test.status !== 'images_ready') {
      return NextResponse.json(
        { error: 'Test is not in images_ready status' },
        { status: 400 }
      )
    }

    // Save the selected image
    await prisma.validationTest.update({
      where: { id },
      data: { selectedImage },
    })

    // Generate 3 style variations of the selected concept
    const variations = await generateImageVariations(
      id,
      selectedImage,
      test.concept,
      test.audience
    )

    // Build variation images map: {"A": url, "B": url, "C": url}
    const variationImages: Record<string, string> = {}
    for (const v of variations) {
      variationImages[v.slot] = v.imageUrl
    }

    // Save variations and update status
    const updatedTest = await prisma.validationTest.update({
      where: { id },
      data: {
        variationImages: JSON.stringify(variationImages),
        status: 'image_selected',
      },
      include: { variants: true, results: true },
    })

    return NextResponse.json({ test: updatedTest })
  } catch (error) {
    console.error('Error selecting image:', error)
    return NextResponse.json(
      { error: 'Failed to select image and generate variations' },
      { status: 500 }
    )
  }
}
