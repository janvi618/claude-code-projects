import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateStep, parseOpportunities } from '@/lib/llm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; n: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stepNumber = parseInt(params.n)
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
      return NextResponse.json({ error: 'Invalid step number' }, { status: 400 })
    }

    const project = await prisma.project.findFirst({
      where: { id: params.id, ownerId: user.id },
      include: {
        sources: { orderBy: { createdAt: 'asc' } },
        opportunities: true,
        approvals: true,
        artifacts: true // Include all artifacts for context
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check Step 4+ lock
    if (stepNumber >= 4) {
      const step3Approval = project.approvals.find(a => a.stepNumber === 3)
      if (!step3Approval) {
        return NextResponse.json({ error: 'Step 3 must be approved first' }, { status: 400 })
      }
    }

    const body = await request.json().catch(() => ({}))
    const opportunityId = body.opportunityId as string | undefined

    // For step 4, require an opportunity selection
    let currentOpportunity: string | undefined
    if (stepNumber === 4 && opportunityId) {
      const opp = project.opportunities.find(o => o.id === opportunityId)
      currentOpportunity = opp?.name
    }

    // Prepare previous artifacts for context (for steps that need it)
    const previousArtifacts = project.artifacts
      .filter(a => a.stepNumber < stepNumber && !a.opportunityId)
      .map(a => ({
        stepNumber: a.stepNumber,
        content: a.contentMarkdown
      }))

    // Generate content with full context
    const content = await generateStep(
      stepNumber,
      project.title,
      project.sources,
      project.opportunities.map(o => ({
        name: o.name,
        selected: o.selected,
        description: o.description
      })),
      currentOpportunity,
      project.description, // Pass project description
      previousArtifacts    // Pass previous analysis for context
    )

    // Upsert artifact
    const existing = await prisma.artifact.findFirst({
      where: {
        projectId: params.id,
        stepNumber,
        opportunityId: opportunityId || null
      }
    })

    let artifact
    if (existing) {
      artifact = await prisma.artifact.update({
        where: { id: existing.id },
        data: { contentMarkdown: content }
      })
    } else {
      artifact = await prisma.artifact.create({
        data: {
          projectId: params.id,
          stepNumber,
          opportunityId: opportunityId || null,
          contentMarkdown: content
        }
      })
    }

    // For step 3, parse and create opportunities
    if (stepNumber === 3) {
      const opps = parseOpportunities(content)

      // Delete existing opportunities for this project
      await prisma.opportunity.deleteMany({
        where: { projectId: params.id }
      })

      // Create new opportunities
      for (const opp of opps) {
        await prisma.opportunity.create({
          data: {
            projectId: params.id,
            name: opp.name,
            description: opp.description,
            selected: false
          }
        })
      }
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Error running step:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to run step'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; n: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stepNumber = parseInt(params.n)
    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get('opportunityId')

    const artifact = await prisma.artifact.findFirst({
      where: {
        projectId: params.id,
        stepNumber,
        opportunityId: opportunityId || null
      }
    })

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Error fetching artifact:', error)
    return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 })
  }
}
