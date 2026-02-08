import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const teamPassword = process.env.TEAM_PASSWORD

    if (!teamPassword) {
      // No password configured, allow access
      return NextResponse.json({ success: true })
    }

    if (password === teamPassword) {
      // Set access cookie (30 days)
      cookies().set('team_access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('Gate error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
