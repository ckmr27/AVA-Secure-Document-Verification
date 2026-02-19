import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export async function createSession(userId: string, userRole: string, userName: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', JSON.stringify({ userId, userRole, userName }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return session
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function hashPassword(password: string): Promise<string> {
  // Use Node.js crypto module for consistent hashing
  const hash = createHash('sha256')
  hash.update(password + 'ava-secret-salt')
  return hash.digest('hex')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}
