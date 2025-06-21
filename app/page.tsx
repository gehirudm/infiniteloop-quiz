"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, AlertCircle, Trophy, Play } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user has already completed the quiz
    const completed = localStorage.getItem("quizCompleted")
    if (completed === "true") {
      setHasCompletedQuiz(true)
    }
  }, [])

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || username.trim().length < 2) {
      setError("Username must be at least 2 characters")
      return
    }

    if (hasCompletedQuiz) {
      setError("You have already completed the quiz on this device")
      return
    }

    const apiKey = searchParams.get("key") || "quiz-api-key-2024-secure"
    if (!apiKey) {
      setError("API key is required. Please use the correct URL with the key parameter.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("quizUsername", username.trim())
        localStorage.setItem("quizApiKey", apiKey)
        router.push("/quiz")
      } else {
        setError(data.error || "Failed to start quiz")
      }
    } catch (err) {
      console.log(err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md infiniteloop-card border-2 border-infiniteloop-orange/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Already Completed</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              You have already taken this quiz on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Each device can only take the quiz once to ensure fairness.
            </p>
            <Button
              onClick={() => router.push("/leaderboard")}
              className="w-full bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/infiniteloop-logo.webp"
              alt="INFINITELOOP 3.0"
              width={300}
              height={80}
              className="mx-auto"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">QUIZ CHALLENGE</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Test out what you just learned
          </p>
        </div>

        {/* Main Content Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="infiniteloop-card border-2 border-infiniteloop-orange/30">
            <CardHeader className="text-center">
              {/* <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-infiniteloop-yellow to-infiniteloop-orange rounded-2xl flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div> */}
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Challenge Details</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                First to complete with highest accuracy wins!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-infiniteloop-orange/10 rounded-xl">
                  <div className="text-2xl font-bold infiniteloop-gradient-text">5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                </div>
                <div className="text-center p-4 bg-infiniteloop-yellow/10 rounded-xl">
                  <div className="text-2xl font-bold infiniteloop-gradient-text">⏱️</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Timed</div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-infiniteloop-orange rounded-full"></div>
                  <span>Multiple choice and text questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-infiniteloop-yellow rounded-full"></div>
                  <span>Beware of the timer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-infiniteloop-orange rounded-full"></div>
                  <span>Only one attempt is allowed</span>
                </div>
              </div>

              <div className="border-t border-infiniteloop-orange/20 pt-6">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-4 w-16 h-16 bg-infiniteloop-gradient rounded-2xl flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Let's go!</h3>
                  <p className="text-gray-600 dark:text-gray-300">Enter your nickname and begin the challenge</p>
                </div>

                <form onSubmit={handleStartQuiz} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter your nickname
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Your nickname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-gray-800/50 border-infiniteloop-orange/30 focus:border-infiniteloop-orange"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold py-3 text-lg"
                    disabled={loading || !username.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting Quiz...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Quiz
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm">Powered by INFINITELOOP 3.0 • Programming Quiz Challenge</p>
        </div>
      </div>
    </div>
  )
}
