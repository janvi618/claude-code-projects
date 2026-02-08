import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if team password is configured
  const teamPassword = process.env.TEAM_PASSWORD
  if (!teamPassword) {
    // No password set, allow all access
    return NextResponse.next()
  }

  // Check for valid access cookie
  const accessCookie = request.cookies.get('team_access')
  if (accessCookie?.value === 'granted') {
    return NextResponse.next()
  }

  // Redirect to gate page if not on it already
  if (request.nextUrl.pathname !== '/gate') {
    return NextResponse.redirect(new URL('/gate', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
