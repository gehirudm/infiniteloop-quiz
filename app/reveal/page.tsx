"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FlipSquare {
  id: number
  isFlipped: boolean
  row: number
  col: number
  imageData?: string // base64 data URI
  loading?: boolean
}

interface RevealInfo {
  gridSize: number
  totalTiles: number
  tileSize: number
}

export default function RevealPage() {
  const [squares, setSquares] = useState<FlipSquare[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [revealInfo, setRevealInfo] = useState<RevealInfo | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()

  // Check authentication and get reveal info
  useEffect(() => {
    const checkAuthAndInit = async () => {
      try {
        const infoResponse = await fetch("/api/reveal/info")
        if (infoResponse.ok) {
          const info = await infoResponse.json()
          setRevealInfo(info)
          setAuthenticated(true)
          initializeGrid(info.gridSize)
        } else {
          setAuthenticated(false)
        }
      } catch (error) {
        console.error("Failed to initialize:", error)
        setAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndInit()
  }, [])

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")

    try {
      const response = await fetch(`/api/leaderboard/login?password=${encodeURIComponent(password)}`)
      const data = await response.json()

      if (data.success) {
        setAuthenticated(true)
        // Now get reveal info and initialize
        const infoResponse = await fetch("/api/reveal/info")
        if (infoResponse.ok) {
          const info = await infoResponse.json()
          setRevealInfo(info)
          initializeGrid(info.gridSize)
        }
      } else {
        setAuthError("Invalid password")
      }
    } catch (error) {
      setAuthError("Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  // Initialize squares grid
  const initializeGrid = (gridSize: number) => {
    const initialSquares: FlipSquare[] = []
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        initialSquares.push({
          id: row * gridSize + col,
          isFlipped: false,
          row,
          col,
        })
      }
    }
    setSquares(initialSquares)
  }

  // Fetch tile image data
  const fetchTileData = async (tileId: number): Promise<string | null> => {
    try {
      const response = await fetch(`/api/reveal/tile/${tileId}`)
      if (response.ok) {
        const data = await response.json()
        return data.dataUri
      }
    } catch (error) {
      console.error(`Failed to fetch tile ${tileId}:`, error)
    }
    return null
  }

  // Flip a specific square and load its image
  const flipSquare = useCallback(async (squareId: number) => {
    setSquares((prev) => {
      const square = prev.find((s) => s.id === squareId)
      if (!square || square.isFlipped) return prev

      return prev.map((s) => (s.id === squareId ? { ...s, loading: true } : s))
    })

    // Fetch the tile image data
    const imageData = await fetchTileData(squareId)

    setSquares((prev) => {
      const newSquares = prev.map((s) =>
        s.id === squareId
          ? {
              ...s,
              isFlipped: true,
              loading: false,
              imageData: imageData || undefined,
            }
          : s,
      )

      // Update revealed count
      const newRevealedCount = newSquares.filter((s) => s.isFlipped).length
      setRevealedCount(newRevealedCount)

      return newSquares
    })
  }, [])

  // Flip random square
  const flipRandomSquare = useCallback(() => {
    setSquares((prev) => {
      const unflippedSquares = prev.filter((square) => !square.isFlipped)
      if (unflippedSquares.length === 0) return prev

      const randomIndex = Math.floor(Math.random() * unflippedSquares.length)
      const squareToFlip = unflippedSquares[randomIndex]

      // Flip the square asynchronously
      flipSquare(squareToFlip.id)

      return prev
    })
  }, [flipSquare])

  // Auto-flip squares every 3 seconds
  useEffect(() => {
    if (!authenticated || !revealInfo) return

    const interval = setInterval(() => {
      flipRandomSquare()
    }, 3000)

    return () => clearInterval(interval)
  }, [flipRandomSquare, authenticated, revealInfo])

  // Listen for new quiz completions
  useEffect(() => {
    if (!authenticated) return

    const channel = supabase
      .channel("quiz_results_reveal")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_results",
        },
        (payload) => {
          console.log("New quiz completion, flipping squares:", payload)
          // Flip multiple squares when someone completes the quiz
          for (let i = 0; i < 3; i++) {
            setTimeout(() => flipRandomSquare(), i * 500)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [flipRandomSquare, authenticated])

  // Handle square click
  const handleSquareClick = (squareId: number) => {
    const square = squares.find((s) => s.id === squareId)
    if (square && !square.isFlipped && !square.loading) {
      flipSquare(squareId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-infiniteloop-orange mx-auto mb-4"></div>
          <p className="text-gray-300">Loading reveal...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md infiniteloop-card border-2 border-infiniteloop-orange/30">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Button
                onClick={() => router.push("/leaderboard")}
                variant="outline"
                size="sm"
                className="mb-4 border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leaderboard
              </Button>
              <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={200} height={50} />
            </div>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Reveal Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter password to view mystery reveal
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                  className="bg-white/50 dark:bg-gray-800/50 border-infiniteloop-orange/30 focus:border-infiniteloop-orange"
                />
              </div>

              {authError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold"
                disabled={authLoading || !password}
              >
                {authLoading ? "Authenticating..." : "Access Reveal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!revealInfo) return null

  const progressPercentage = (revealedCount / revealInfo.totalTiles) * 100

  return (
    <div className="min-h-screen bg-dark-gradient flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Button
            onClick={() => router.push("/leaderboard")}
            variant="outline"
            size="sm"
            className="mr-4 border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={300} height={75} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Mystery Reveal</h1>
        <p className="text-gray-300 mb-4">
          {progressPercentage < 100
            ? `${Math.round(progressPercentage)}% revealed • Click squares or complete quizzes to reveal more!`
            : "🎉 Fully revealed! Great job everyone! 🎉"}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-infiniteloop-gradient h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Reveal Grid */}
      <div
        className="relative max-h-2xl w-full h-full aspect-square"
        style={{ maxWidth: revealInfo.gridSize * revealInfo.tileSize }}
      >
        <div
          className="grid gap-0 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${revealInfo.gridSize}, 1fr)` }}
        >
          {squares.map((square) => (
            <div
              key={square.id}
              className="relative cursor-pointer transition-all duration-500"
              onClick={() => handleSquareClick(square.id)}
              style={{ perspective: "1000px", height: revealInfo.tileSize, aspectRatio: 1 }}
            >
              {square.isFlipped && square.imageData ? (
                // Revealed tile showing actual image data
                <div className="w-full h-full">
                  <img
                    src={square.imageData || "/placeholder.svg"}
                    alt={`Tile ${square.id}`}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              ) : (
                // Covered tile
                <div
                  className={`w-full h-full transition-all duration-300 ${
                    square.loading
                      ? "bg-infiniteloop-yellow animate-pulse"
                      : "bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark"
                  }`}
                >
                  <div className="w-full h-full bg-black/10 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    {square.loading && (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-gray-400">
        <p className="text-sm">
          {revealedCount} / {revealInfo.totalTiles} squares revealed
        </p>
        <p className="text-xs mt-2">Each quiz completion reveals more squares automatically!</p>
      </div>
    </div>
  )
}
