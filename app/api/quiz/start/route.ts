import { type NextRequest, NextResponse } from "next/server"
import { createSession, hasUserCompletedQuiz } from "@/lib/quiz-store"
import { API_KEY } from "@/lib/quiz-data"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 })
    }

    // Check if this username has already completed the quiz
    const hasCompleted = await hasUserCompletedQuiz(username.trim())
    if (hasCompleted) {
      return NextResponse.json(
        {
          error: "This username has already completed the quiz",
        },
        { status: 400 },
      )
    }

    const session = await createSession(username.trim())

    if (!session) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: {
        username: session.username,
        current_question_index: session.current_question_index,
        start_time: session.start_time,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 })
  }
}
