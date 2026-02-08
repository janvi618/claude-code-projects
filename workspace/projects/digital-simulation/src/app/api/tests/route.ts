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
