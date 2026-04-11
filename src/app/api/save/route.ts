import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifyToken } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const body = (await req.json()) as {
      inputText?: unknown
      generatedText?: unknown
      intensityBefore?: unknown
      intensityAfter?: unknown
    }

    const inputText = typeof body.inputText === 'string' ? body.inputText.trim() : ''
    const generatedText = typeof body.generatedText === 'string' ? body.generatedText.trim() : ''
    const intensityBefore =
      typeof body.intensityBefore === 'number' && body.intensityBefore >= 1 && body.intensityBefore <= 10
        ? body.intensityBefore
        : null
    const intensityAfter =
      typeof body.intensityAfter === 'number' && body.intensityAfter >= 1 && body.intensityAfter <= 10
        ? body.intensityAfter
        : null

    if (!inputText || !generatedText || intensityBefore === null || intensityAfter === null) {
      return NextResponse.json({ success: false, error: 'Invalid entry data.' }, { status: 400 })
    }

    await prisma.entry.create({
      data: {
        userId: session.userId,
        inputText,
        generatedText,
        intensityBefore,
        intensityAfter,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save entry.' }, { status: 500 })
  }
}
