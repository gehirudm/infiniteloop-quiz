"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Clock, Crown, Eye } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface LeaderboardEntry {
  username: string
  score: number
  total_questions: number
  total_time_seconds: number
  completed_at: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .order("score", { ascending: false })
        .order("total_time_seconds", { ascending: true })
        .limit(50)

      if (error) {
        console.error("Error fetching leaderboard:", error)
      } else {
        setLeaderboard(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel("quiz_results_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_results",
        },
        (payload) => {
          console.log("Real-time update:", payload)
          // Refresh leaderboard
          fetchLeaderboard()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-full">
            {index + 1}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-infiniteloop-orange mx-auto mb-4"></div>
          <p className="text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/infiniteloop-logo.webp"
            alt="INFINITELOOP 3.0"
            width={300}
            height={75}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push("/reveal")}
              className="bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Reveal
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white"
            >
              Back to Quiz
            </Button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 max-w-2xl mx-auto">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No quiz results yet.</p>
              <p className="text-gray-500">Be the first to take the quiz!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <Card
                key={entry.username}
                className={`infiniteloop-card border ${
                  index === 0
                    ? "border-yellow-400 bg-gradient-to-r from-yellow-50/10 to-yellow-100/10"
                    : index === 1
                      ? "border-gray-400 bg-gradient-to-r from-gray-50/10 to-gray-100/10"
                      : index === 2
                        ? "border-amber-400 bg-gradient-to-r from-amber-50/10 to-amber-100/10"
                        : "border-infiniteloop-orange/20"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index)}</div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{entry.username}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(entry.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xl font-bold infiniteloop-gradient-text">
                          {entry.score}/{entry.total_questions}
                        </div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {Math.round((entry.score / entry.total_questions) * 100)}%
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 bg-infiniteloop-orange/10 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">{formatTime(entry.total_time_seconds)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
