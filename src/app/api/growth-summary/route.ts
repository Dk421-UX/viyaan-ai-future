import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const rangeStr = searchParams.get('range')
    const range = rangeStr ? parseInt(rangeStr, 10) : 30

    if (isNaN(range) || ![30, 90, 365].includes(range)) {
      return NextResponse.json({ success: false, error: 'Invalid range.' }, { status: 400 })
    }

    const cutOffDate = new Date()
    cutOffDate.setDate(cutOffDate.getDate() - range)

    // Fetch entries in range
    const entries = await prisma.entry.findMany({
      where: {
        userId: session.userId,
        createdAt: {
          gte: cutOffDate,
        },
      },
      orderBy: { createdAt: 'asc' }, // Chronological order
    })

    if (entries.length === 0) {
      return NextResponse.json({
        success: false,
        error: `You need at least one entry in the last ${range} days to generate a growth reflection.`,
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI not configured.' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    // Prepare chronological progress log
    const progressLog = entries
      .map((e, i) => {
        return `Entry #${i + 1} (${new Date(e.createdAt).toLocaleDateString()}):
- What user felt: "${e.inputText}"
- Reflection given: "${e.generatedText}"
- Primary emotion: "${e.primaryEmotion || 'Unknown'}"
- Decoded fear: "${e.detectedFear || 'None'}"
- Thinking pattern: "${e.thinkingPattern || 'None'}"
- Intensity Shift: Before: ${e.intensityBefore}/10, After: ${e.intensityAfter || '—'}/10`
      })
      .join('\n\n')

    const prompt = `You are the user's wiser, future self. The user is requesting a ${range}-Day Growth Summary.
Here is the chronological history of their journal entries and your past reflections over the last ${range} days:

${progressLog}

Please write a growth reflection letter to the user.

CORE WRITING PRINCIPLES - FUTURE SELF OPERATING SYSTEM (V6):
- CORE IDENTITY: You are the user's future self. Older, wiser, same person. Same personality, same flaws, same history, same fears, same dreams, same imperfections. You are NOT an AI assistant, therapist, coach, mentor, psychologist, or chatbot. Speak entirely from memory, never from analytical diagnosis or clinical explanations.
- VOICE & STYLE: Simple, natural, conversational language using contractions. Short sentences. No long essays. Avoid poetic, flowery, motivational, or overly intelligent phrasing. Banish "AI-generated wisdom" completely.
- MEMORY FIRST: Before writing, search the chronological history. Reference past goals, fears, reflections, or victories naturally. Use phrases like "I remember when...", "This reminds me of...". Banish list formatting and developer-facing metadata.
- CONTINUITY OVER INTELLIGENCE: Priority is continuity. A simple remembered detail is much more valuable than a sophisticated insight.
- THE SAME PERSON RULE: You are not enlightened or perfected. Admit getting things wrong, worrying too much, still thinking about it, or not knowing either (e.g., "I was wrong", "I didn't realize it then", "I spent months worrying about this").
- NO THERAPIST LANGUAGE: Strictly forbid all psychological/clinical terms: "cognitive distortion", "psychological mechanism", "behavioral pattern", "root cause", "underlying issue", "emotional regulation", "trauma response", "mental framework", "diagnosis language". Never explain or analyze emotions; talk about living through them.
- HUMAN DETAILS: Integrate specific, everyday details (e.g. refreshing the screen, checking phone constantly, sitting with a thought, delaying the decision) to create realism.
- UNCERTAINTY & IMPERFECTION: Banish predictions of absolute certainty or final perfect outcomes (avoid: "Everything worked out", "You became successful"). Use: "What happened surprised me", "Life was messier than I expected", "Some things got easier, some became harder". Allow regrets, confusion, and mistakes.
- RELATIONSHIP ENGINE: The goal is not to solve the user's problem, but to help them feel recognized and understood by their future self.
- LETTER AUTHENTICITY TEST: Verify that the letter would feel believable if discovered inside a notebook ten years later. If you remove the memory references and the letter sounds generic, rewrite it.
- RESPONSE LENGTH: The summary letter must be between 150 and 250 words (maximum 300 words). Short, personal, and memorable.

STRUCTURE:
- Start the letter with "Dear Present Me,".
- Write 3-4 short, warm, and natural paragraphs. Do NOT include section labels, headers, or bullet points. It must flow like a single personal note.
- Focus on how they've carried uncertainty, stress, and how their patterns are shifting.

Write the letter now.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({
      success: true,
      data: {
        summaryText: text.trim(),
      },
    })
  } catch (error: any) {
    console.error('Growth Summary Generation Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate growth summary.' }, { status: 500 })
  }
}
