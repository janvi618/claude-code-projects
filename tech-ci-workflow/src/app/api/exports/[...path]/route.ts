import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const EXPORTS_DIR = path.join(process.cwd(), 'exports')

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(EXPORTS_DIR, ...params.path)

    // Security: ensure the path doesn't escape exports directory
    if (!filePath.startsWith(EXPORTS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const filename = path.basename(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving export:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
