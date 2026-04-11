import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifyToken } from '@/lib/auth'

// 🔁 Retry helper
async function generateWithRetry(model: any, prompt: string, retries = 2) {
  try {
    return await model.generateContent(prompt)
  } catch (error: any) {
    if (retries > 0 && error.message?.includes('503')) {
      console.warn('⚠️ Retry due to 503...')
      await new Promise(res => setTimeout(res, 1000))
      return generateWithRetry(model, prompt, retries - 1)
    }
    throw error
  }
}

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

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI not configured.' }, { status: 500 })
    }

    const body = await req.json()

    const inputText =
      typeof body.inputText === 'string' ? body.inputText.trim() : ''

    const intensityBefore =
      typeof body.intensityBefore === 'number' &&
      body.intensityBefore >= 1 &&
      body.intensityBefore <= 10
        ? body.intensityBefore
        : null

    if (inputText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please share more about how you feel.' },
        { status: 400 }
      )
    }

    if (intensityBefore === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid intensity.' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // 🔥 Primary model
    let model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    let result

    try {
      result = await generateWithRetry(model, promptBuilder(inputText, intensityBefore))
    } catch (error) {
      console.warn('⚠️ Falling back to stable model...')

      // 🔁 Fallback model
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-latest',
      })

      result = await model.generateContent(promptBuilder(inputText, intensityBefore))
    }

    const text = result.response.text()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Empty response from AI.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { generatedText: text.trim() },
    })
  } catch (error: any) {
    console.error('🔥 FULL ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate reflection.',
      },
      { status: 500 }
    )
  }
}

// ✨ Clean prompt builder
function promptBuilder(inputText: string, intensity: number) {
  return `You are a compassionate future self speaking to the present user. They described their feelings and rated emotional intensity ${intensity}/10 (1=calm, 10=overwhelming). Respond with one warm, reflective paragraph under 200 words. No medical or crisis advice; no lists.

User wrote:
${inputText}`
}