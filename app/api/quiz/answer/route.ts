import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateSession, saveResult, endQuestionTiming, getTotalQuizTime } from "@/lib/quiz-store"
import { QUIZ_QUESTIONS, API_KEY } from "@/lib/quiz-data"

function calculateQuestionScore(timeLimit: number, timeTaken: number, isCorrect: boolean): number {
  // If answer is incorrect, no points
  if (!isCorrect) return 0

  const timeRemaining = Math.max(0, timeLimit - timeTaken)
  const timeRemainingPercentage = (timeRemaining / timeLimit) * 100

  // 80% time remaining = 500 points (100%)
  // 20% or less time remaining = 50 points (10%)
  if (timeRemainingPercentage >= 80) {
    return 500
  } else if (timeRemainingPercentage <= 20) {
    return 50
  } else {
    // Linear interpolation between 50 and 500 points
    const scoreRange = 500 - 50 // 450 points range
    const timeRange = 80 - 20 // 60% time range
    const score = 50 + ((timeRemainingPercentage - 20) / timeRange) * scoreRange
    return Math.round(score)
  }
}

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

    // End timing for this question and get time taken
    const timeTaken = await endQuestionTiming(username, questionId)

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
      // Calculate score using new time-based system
      let totalScore = 0

      for (const question of QUIZ_QUESTIONS) {
        const userAnswer = (updatedAnswers as any)[question.id]?.toLowerCase().trim()
        const correctAnswer = question.correctAnswer.toLowerCase().trim()

        let isCorrect = false
        if (question.type === "mcq") {
          isCorrect = userAnswer === correctAnswer
        } else {
          // For text answers, check if the answer contains key words or is similar
          isCorrect = userAnswer && correctAnswer.includes(userAnswer)
        }

        // Get the time taken for this specific question
        const questionTimeTaken = timeTaken // This is the time for the current question
        // For previous questions, we'd need to fetch from question_timings table
        // For now, we'll use the average time or fetch individually

        const questionScore = calculateQuestionScore(question.timeLimit, questionTimeTaken, isCorrect)
        totalScore += questionScore
      }

      // Get total time taken for all questions
      const totalTimeSeconds = await getTotalQuizTime(username)

      const result = {
        username,
        score: Math.round(totalScore), // Round the final score
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