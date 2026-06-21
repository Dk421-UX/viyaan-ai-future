import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { signToken, SESSION_COOKIE } from '../../../../lib/auth'

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(req: Request) {
  try {
    // Only allow email sign-in if Google client credentials are not configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ success: false, error: 'Sign in method not supported.' }, { status: 403 })
    }

    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: null,
        },
      })
    }

    const sessionToken = signToken({ userId: user.id, email: user.email })
    const res = NextResponse.json({ success: true })
    res.cookies.set(SESSION_COOKIE, sessionToken, cookieOpts)
    return res
  } catch (error) {
    console.error('Email login route error:', error)
    return NextResponse.json({ success: false, error: 'Authentication failed.' }, { status: 500 })
  }
}
