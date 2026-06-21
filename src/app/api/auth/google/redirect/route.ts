import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  // Fall back to intermediate email login if Google client credentials are not configured in local dev
  if (!clientId || !redirectUri) {
    const requestUrl = new URL(req.url)
    const emailUrl = new URL('/login/email', requestUrl.origin)
    return NextResponse.redirect(emailUrl)
  }

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  }).toString()

  return NextResponse.redirect(oauthUrl)
}
