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
      persona?: unknown
      primaryEmotion?: unknown
      secondaryEmotion?: unknown
      detectedFear?: unknown
      thinkingPattern?: unknown
      growthDirection?: unknown
      nextStep?: unknown
      confidenceLevel?: unknown
      fearLevel?: unknown
      stressLevel?: unknown
      hopeLevel?: unknown
      goalsStruggles?: unknown
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

    const persona = typeof body.persona === 'string' ? body.persona.trim() : null
    const primaryEmotion = typeof body.primaryEmotion === 'string' ? body.primaryEmotion.trim() : null
    const secondaryEmotion = typeof body.secondaryEmotion === 'string' ? body.secondaryEmotion.trim() : null
    const detectedFear = typeof body.detectedFear === 'string' ? body.detectedFear.trim() : null
    const thinkingPattern = typeof body.thinkingPattern === 'string' ? body.thinkingPattern.trim() : null
    const growthDirection = typeof body.growthDirection === 'string' ? body.growthDirection.trim() : null
    const nextStep = typeof body.nextStep === 'string' ? body.nextStep.trim() : null
    
    const confidenceLevel = typeof body.confidenceLevel === 'number' ? body.confidenceLevel : null
    const fearLevel = typeof body.fearLevel === 'number' ? body.fearLevel : null
    const stressLevel = typeof body.stressLevel === 'number' ? body.stressLevel : null
    const hopeLevel = typeof body.hopeLevel === 'number' ? body.hopeLevel : null
    const goalsStruggles = typeof body.goalsStruggles === 'string' ? body.goalsStruggles.trim() : null

    await prisma.entry.create({
      data: {
        userId: session.userId,
        inputText,
        generatedText,
        intensityBefore,
        intensityAfter,
        persona,
        primaryEmotion,
        secondaryEmotion,
        detectedFear,
        thinkingPattern,
        growthDirection,
        nextStep,
        confidenceLevel,
        fearLevel,
        stressLevel,
        hopeLevel,
        goalsStruggles,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Save Entry Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save entry.' }, { status: 500 })
  }
}
