import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { signToken, SESSION_COOKIE } from '../../../../../lib/auth'

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === 'production',
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ success: false, error: 'No authorization code provided.' }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData)
      return NextResponse.json({ success: false, error: 'Failed to exchange Google code.' }, { status: 400 })
    }

    // Retrieve user profile
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const profile = await userinfoRes.json()
    if (!userinfoRes.ok || !profile.email) {
      console.error('Google profile fetch error:', profile)
      return NextResponse.json({ success: false, error: 'Failed to retrieve Google profile.' }, { status: 400 })
    }

    const normalizedEmail = profile.email.toLowerCase().trim()

    // Find or link/create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: null, // Optional for Google Auth
        },
      })
    }

    // Sign session token
    const sessionToken = signToken({ userId: user.id, email: user.email })

    // Redirect to welcome continuation screen with session cookie set
    const res = NextResponse.redirect(new URL('/welcome', req.url))
    res.cookies.set(SESSION_COOKIE, sessionToken, cookieOpts)
    return res
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.json({ success: false, error: 'Authentication failed.' }, { status: 500 })
  }
}
