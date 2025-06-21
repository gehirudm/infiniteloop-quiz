import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateSession, saveResult, endQuestionTiming, getTotalQuizTime } from "@/lib/quiz-store"
import { QUIZ_QUESTIONS, API_KEY } from "@/lib/quiz-data"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const { username, questionId, answer } = await request.json()
    const session = await getSession(username)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // End timing for this question
    await endQuestionTiming(username, questionId)

    // Save the answer
    const updatedAnswers = { ...session.answers, [questionId]: answer || "" }
    const nextQuestionIndex = session.current_question_index + 1
    const isCompleted = nextQuestionIndex >= QUIZ_QUESTIONS.length

    const updatedSession = await updateSession(username, {
      answers: updatedAnswers,
      current_question_index: nextQuestionIndex,
      completed: isCompleted,
    })

    if (isCompleted && updatedSession) {
      // Calculate score
      let score = 0
      QUIZ_QUESTIONS.forEach((question) => {
        const userAnswer = updatedAnswers[question.id]?.toLowerCase().trim()
        const correctAnswer = question.correctAnswer.toLowerCase().trim()

        if (question.type === "mcq") {
          if (userAnswer === correctAnswer) score++
        } else {
          // For text answers, check if the answer contains key words
          if (userAnswer && correctAnswer.includes(userAnswer)) score++
        }
      })

      // Get total time taken
      const totalTimeSeconds = await getTotalQuizTime(username)

      const result = {
        username,
        score,
        total_questions: QUIZ_QUESTIONS.length,
        total_time_seconds: totalTimeSeconds,
        completed_at: new Date().toISOString(),
      }

      await saveResult(result)

      return NextResponse.json({
        completed: true,
        result,
      })
    }

    return NextResponse.json({
      success: true,
      nextQuestion: !isCompleted,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}
