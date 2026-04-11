import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from './auth-constants'

export { SESSION_COOKIE }

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string }
    if (!decoded?.userId || !decoded?.email) return null
    return { userId: decoded.userId, email: decoded.email }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
