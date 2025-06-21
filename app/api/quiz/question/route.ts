import { type NextRequest, NextResponse } from "next/server"
import { getSession, startQuestionTiming } from "@/lib/quiz-store"
import { QUIZ_QUESTIONS, API_KEY } from "@/lib/quiz-data"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const { username } = await request.json()
    const session = await getSession(username)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.completed || session.current_question_index >= QUIZ_QUESTIONS.length) {
      return NextResponse.json({ error: "Quiz already completed" }, { status: 400 })
    }

    const question = QUIZ_QUESTIONS[session.current_question_index]

    // Start timing for this question
    await startQuestionTiming(username, question.id)

    // Return question without the correct answer
    const safeQuestion = {
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      timeLimit: question.timeLimit,
      questionNumber: session.current_question_index + 1,
      totalQuestions: QUIZ_QUESTIONS.length,
    }

    return NextResponse.json({ question: safeQuestion })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get question" }, { status: 500 })
  }
}
