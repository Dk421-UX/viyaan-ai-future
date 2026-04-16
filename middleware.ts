import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './src/lib/auth' // ✅ FIXED

const PROTECTED = ['/dashboard', '/new-entry', '/result']
const AUTH_PAGES = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('viyaan_session')?.value
  const path = req.nextUrl.pathname

  const isProtected = PROTECTED.some(p => path.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => path.startsWith(p))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (isAuthPage && token) {
    const session = await verifyToken(token)

    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}