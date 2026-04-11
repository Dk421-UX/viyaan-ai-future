import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from './lib/auth-constants'

const PROTECTED = ['/dashboard', '/new-entry', '/result']

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const path = req.nextUrl.pathname
  const isProtected = PROTECTED.some(p => path.startsWith(p))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
