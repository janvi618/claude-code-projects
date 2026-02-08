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

    const { url, note, tags } = await request.json()

    if (!url && !note) {
      return NextResponse.json({ error: 'URL or note required' }, { status: 400 })
    }

    const source = await prisma.source.create({
      data: {
        projectId: params.id,
        url,
        note,
        tags: JSON.stringify(tags || [])
      }
    })

    return NextResponse.json({
      source: { ...source, tags: JSON.parse(source.tags) }
    })
  } catch (error) {
    console.error('Error creating source:', error)
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sources = await prisma.source.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'asc' }
    })

    const transformedSources = sources.map(s => ({
      ...s,
      tags: JSON.parse(s.tags)
    }))

    return NextResponse.json({ sources: transformedSources })
  } catch (error) {
    console.error('Error fetching sources:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
}
