import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: { id: params.id, ownerId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { stepNumber } = await request.json()

    if (stepNumber !== 3) {
      return NextResponse.json({ error: 'Only step 3 can be approved' }, { status: 400 })
    }

    // Check at least one opportunity is selected
    const selectedCount = await prisma.opportunity.count({
      where: { projectId: params.id, selected: true }
    })

    if (selectedCount === 0) {
      return NextResponse.json({ error: 'Select at least one opportunity' }, { status: 400 })
    }

    // Upsert approval
    const approval = await prisma.approval.upsert({
      where: {
        projectId_stepNumber: {
          projectId: params.id,
          stepNumber: 3
        }
      },
      update: { approvedAt: new Date() },
      create: {
        projectId: params.id,
        stepNumber: 3
      }
    })

    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Error approving step:', error)
    return NextResponse.json({ error: 'Failed to approve step' }, { status: 500 })
  }
}
