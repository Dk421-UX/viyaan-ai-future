import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '../../../lib/prisma'
import { SESSION_COOKIE, signToken } from '../../../lib/auth'

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: string
      email?: string
      password?: string
    }
    const action = body.action

    if (action === 'logout') {
      const res = NextResponse.json({ success: true })
      res.cookies.set(SESSION_COOKIE, '', { ...cookieOpts, maxAge: 0 })
      return res
    }

    if (action === 'signup') {
      const { email, password } = body
      if (typeof email !== 'string' || typeof password !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid input.' }, { status: 400 })
      }
      const normalized = email.toLowerCase().trim()
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password too short.' }, { status: 400 })
      }

      const existing = await prisma.user.findUnique({ where: { email: normalized } })
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 })
      }

      const hash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { email: normalized, password: hash },
      })

      const token = signToken({ userId: user.id, email: user.email })
      const res = NextResponse.json({ success: true })
      res.cookies.set(SESSION_COOKIE, token, cookieOpts)
      return res
    }

    if (action === 'login') {
      const { email, password } = body
      if (typeof email !== 'string' || typeof password !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid input.' }, { status: 400 })
      }
      const normalized = email.toLowerCase().trim()

      const user = await prisma.user.findUnique({ where: { email: normalized } })
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
      }

      const ok = await bcrypt.compare(password, user.password)
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 })
      }

      const token = signToken({ userId: user.id, email: user.email })
      const res = NextResponse.json({ success: true })
      res.cookies.set(SESSION_COOKIE, token, cookieOpts)
      return res
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 500 })
  }
}
