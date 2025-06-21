"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Home, Clock, Target, Award } from "lucide-react"
import Image from "next/image"

interface QuizResult {
  username: string
  score: number
  total_questions: number
  total_time_seconds: number
  completed_at: string
}

export default function QuizCompletedPage() {
  const [result, setResult] = useState<QuizResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedResult = localStorage.getItem("quizResult")
    if (storedResult) {
      setResult(JSON.parse(storedResult))
    } else {
      router.push("/")
    }
  }, [router])

  const handleGoHome = () => {
    localStorage.removeItem("quizResult")
    localStorage.removeItem("quizUsername")
    localStorage.removeItem("quizApiKey")
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md infiniteloop-card">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-infiniteloop-orange"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.total_questions) * 100)
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-infiniteloop-orange"
    return "text-red-600"
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return "Excellent work! 🎉"
    if (percentage >= 60) return "Good job! 👍"
    return "Keep practicing! 💪"
  }

  const getScoreIcon = () => {
    if (percentage >= 80) return <Trophy className="w-12 h-12 text-yellow-500" />
    if (percentage >= 60) return <Award className="w-12 h-12 text-infiniteloop-orange" />
    return <Target className="w-12 h-12 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/infiniteloop-logo.webp"
            alt="INFINITELOOP 3.0"
            width={250}
            height={60}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Completed!</h1>
        </div>

        <Card className="infiniteloop-card border-2 border-infiniteloop-orange/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-24 h-24 bg-infiniteloop-gradient rounded-3xl flex items-center justify-center">
              {getScoreIcon()}
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Congratulations, {result.username}!
            </CardTitle>
            <p className="text-lg text-gray-600 dark:text-gray-300">{getScoreMessage()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-infiniteloop-cream to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                  {result.score}/{result.total_questions}
                </div>
                <div className={`text-3xl font-semibold ${getScoreColor()}`}>{percentage}%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Final Score</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-infiniteloop-orange/10 rounded-xl">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-infiniteloop-orange mr-2" />
                    <span className="font-semibold text-infiniteloop-orange">Time</span>
                  </div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {formatTime(result.total_time_seconds)}
                  </div>
                </div>
                <div className="text-center p-4 bg-infiniteloop-yellow/10 rounded-xl">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-5 h-5 text-infiniteloop-orange mr-2" />
                    <span className="font-semibold text-infiniteloop-orange">Questions</span>
                  </div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{result.total_questions}</div>
                </div>
              </div>
            </div>

            {/* Completion Details */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <p>Completed on {new Date(result.completed_at).toLocaleDateString()}</p>
              <p>at {new Date(result.completed_at).toLocaleTimeString()}</p>
            </div>

            {/* Notice */}
            <div className="bg-gradient-to-r from-infiniteloop-orange/10 to-infiniteloop-yellow/10 border border-infiniteloop-orange/30 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                <strong>Note:</strong> Each device can only take this quiz once. Thank you for participating in the
                INFINITELOOP 3.0 Quiz Challenge!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/leaderboard")}
                className="bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold py-3"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white py-3"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
