import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; opportunityId: string } }
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

    const { selected } = await request.json()

    const opportunity = await prisma.opportunity.update({
      where: { id: params.opportunityId },
      data: { selected }
    })

    return NextResponse.json({ opportunity })
  } catch (error) {
    console.error('Error updating opportunity:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}
