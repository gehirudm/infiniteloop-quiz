"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, User } from "lucide-react"
import Image from "next/image"

interface Question {
  id: string
  type: "mcq" | "text"
  question: string
  options?: string[]
  timeLimit: number
  questionNumber: number
  totalQuestions: number
}

export default function QuizPage() {
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [username, setUsername] = useState("")
  const [apiKey, setApiKey] = useState("")
  const router = useRouter()

  const fetchQuestion = useCallback(async () => {
    const storedUsername = localStorage.getItem("quizUsername")
    const storedApiKey = localStorage.getItem("quizApiKey")

    if (!storedUsername || !storedApiKey) {
      router.push("/")
      return
    }

    setUsername(storedUsername)
    setApiKey(storedApiKey)

    try {
      const response = await fetch("/api/quiz/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": storedApiKey,
        },
        body: JSON.stringify({ username: storedUsername }),
      })

      const data = await response.json()

      if (data.question) {
        setQuestion(data.question)
        setTimeLeft(data.question.timeLimit)
        setAnswer("")
        setLoading(false)
      } else {
        router.push("/quiz/completed")
      }
    } catch (err) {
      console.error("Failed to fetch question:", err)
      router.push("/")
    }
  }, [router])

  const submitAnswer = useCallback(
    async (currentAnswer: string = answer) => {
      if (submitting || !question) return

      setSubmitting(true)

      try {
        const response = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            username,
            questionId: question.id,
            answer: currentAnswer,
          }),
        })

        const data = await response.json()

        if (data.completed) {
          localStorage.setItem("quizResult", JSON.stringify(data.result))
          localStorage.setItem("quizCompleted", "true")
          router.push("/quiz/completed")
        } else if (data.nextQuestion) {
          fetchQuestion()
        }
      } catch (err) {
        console.error("Failed to submit answer:", err)
      } finally {
        setSubmitting(false)
      }
    },
    [answer, question, username, apiKey, submitting, router, fetchQuestion],
  )

  // Timer effect - runs independently of user input
  useEffect(() => {
    if (timeLeft > 0 && !submitting && question) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && question && !submitting) {
      // Auto-submit when time runs out
      submitAnswer("")
    }
  }, [timeLeft, submitting, question, submitAnswer])

  // Initial load
  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  const handleAnswerSelect = (selectedAnswer: string) => {
    setAnswer(selectedAnswer)
  }

  const handleSubmit = () => {
    submitAnswer()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl infiniteloop-card">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-infiniteloop-orange mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading question...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!question) return null

  const progressPercentage = ((question.questionNumber - 1) / question.totalQuestions) * 100
  const timePercentage = (timeLeft / question.timeLimit) * 100

  return (
    <div className="min-h-screen bg-dark-gradient p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={200} height={50} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">
              Question {question.questionNumber} of {question.totalQuestions}
            </span>
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <User className="w-4 h-4" />
              <span>{username}</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="mb-4 bg-gray-700 [&>div]:bg-infiniteloop-gradient" />
        </div>

        {/* Timer */}
        <Card className="mb-6 infiniteloop-card border-infiniteloop-orange/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-infiniteloop-orange" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Time Remaining</span>
              </div>
              <span className={`font-bold text-lg ${timeLeft <= 10 ? "text-red-600" : "text-infiniteloop-orange"}`}>
                {timeLeft}s
              </span>
            </div>
            <Progress
              value={timePercentage}
              className={`mt-2 bg-gray-200 dark:bg-gray-700 ${
                timeLeft <= 10 ? "[&>div]:bg-red-500" : "[&>div]:bg-infiniteloop-gradient"
              }`}
            />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="infiniteloop-card border-infiniteloop-yellow/30">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {question.type === "mcq" ? (
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={answer === option ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-4 px-6 text-base ${
                      answer === option
                        ? "bg-infiniteloop-gradient text-white border-infiniteloop-orange"
                        : "border-infiniteloop-orange/30 text-gray-700 dark:text-gray-300 hover:bg-infiniteloop-orange/10"
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={submitting}
                  >
                    <span className="mr-4 font-bold text-lg">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitting}
                  className="text-base py-4 bg-white/50 dark:bg-gray-800/50 border-infiniteloop-orange/30 focus:border-infiniteloop-orange"
                  autoComplete="off"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!answer || submitting}
              className="w-full mt-6 bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold py-4 text-lg"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Answer
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
