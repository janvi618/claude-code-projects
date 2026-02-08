import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generatePDF } from '@/lib/pdf'

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
      where: { id: params.id, ownerId: user.id },
      include: {
        sources: { orderBy: { createdAt: 'asc' } },
        artifacts: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { acknowledged } = await request.json()

    if (!acknowledged) {
      return NextResponse.json({ 
        error: 'Must acknowledge compliance before export' 
      }, { status: 400 })
    }

    // Get step 6 artifact
    const step6 = project.artifacts.find(a => a.stepNumber === 6)
    if (!step6) {
      return NextResponse.json({ 
        error: 'Step 6 must be completed before export' 
      }, { status: 400 })
    }

    const filename = await generatePDF(
      step6.contentMarkdown,
      project.sources,
      project.title
    )

    // Save export record
    const exportFile = await prisma.exportFile.create({
      data: {
        projectId: params.id,
        type: 'pdf',
        filePath: `/exports/${filename}`
      }
    })

    return NextResponse.json({ exportFile, filename })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json({ error: 'Failed to export PDF' }, { status: 500 })
  }
}
