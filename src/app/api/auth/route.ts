import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { prisma } from '../../../lib/prisma'
import { SESSION_COOKIE, signToken, verifyToken } from '../../../lib/auth'

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
    }
    const action = body.action

    if (action === 'logout') {
      const res = NextResponse.json({ success: true })
      res.cookies.set(SESSION_COOKIE, '', { ...cookieOpts, maxAge: 0 })
      return res
    }

    return NextResponse.json({ success: false, error: 'Unknown or unsupported action.' }, { status: 400 })
  } catch (error) {
    console.error('Auth API Error:', error)
    return NextResponse.json({ success: false, error: 'Request failed.' }, { status: 500 })
  }
}
