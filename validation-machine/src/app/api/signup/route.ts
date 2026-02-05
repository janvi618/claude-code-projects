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
