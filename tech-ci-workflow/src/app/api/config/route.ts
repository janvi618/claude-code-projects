import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    mockMode: process.env.MOCK_LLM === 'true',
    provider: process.env.LLM_PROVIDER || 'anthropic',
    model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
  })
}
