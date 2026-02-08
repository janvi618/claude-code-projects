import { NextRequest, NextResponse } from 'next/server'
import { signInDemo, signOut } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'signin') {
      const user = await signInDemo()
      return NextResponse.json({ user })
    } else if (action === 'signout') {
      await signOut()
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}
