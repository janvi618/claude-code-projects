import { cookies } from 'next/headers'
import { prisma } from './prisma'

const DEMO_USER_ID = 'demo-user-id'
const AUTH_COOKIE = 'tech-ci-auth'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE)
  
  if (!authCookie?.value) {
    return null
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: authCookie.value }
    })
    return user
  } catch {
    return null
  }
}

export async function signInDemo() {
  const cookieStore = cookies()
  
  // Ensure demo user exists
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: 'demo@example.com',
        name: 'Demo User',
      }
    })
  }
  
  cookieStore.set(AUTH_COOKIE, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  
  return user
}

export async function signOut() {
  const cookieStore = cookies()
  cookieStore.delete(AUTH_COOKIE)
}

export function requireAuth(user: unknown): asserts user is { id: string; name: string } {
  if (!user) {
    throw new Error('Unauthorized')
  }
}
