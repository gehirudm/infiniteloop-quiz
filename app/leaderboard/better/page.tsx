"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Clock, Crown, Eye, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import classes from "./LeaderboardBetter.module.css"

interface LeaderboardEntry {
    username: string
    score: number
    total_questions: number
    total_time_seconds: number
    completed_at: string
}

interface BubblePosition {
    x: number
    y: number
    size: number
    rotation: number
    delay: number
}

export default function LeaderboardBetter() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [bubblePositions, setBubblePositions] = useState<BubblePosition[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from("quiz_results")
                .select("*")
                .order("score", { ascending: false })
                .order("total_time_seconds", { ascending: true })
                .limit(20) // Limit for better visual layout

            if (error) {
                console.error("Error fetching leaderboard:", error)
            } else {
                setLeaderboard(data || [])
                generateBubblePositions(data || [])
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error)
        }
    }

    // Generate random positions for bubbles around the center logo
    const generateBubblePositions = (entries: LeaderboardEntry[]) => {
        if (!containerRef.current) return

        const positions: BubblePosition[] = []
        const centerX = 50 // Center percentage
        const centerY = 50 // Center percentage
        const minRadius = 25 // Minimum distance from center
        const maxRadius = 45 // Maximum distance from center

        entries.forEach((entry, index) => {
            // Create multiple attempts to avoid overlapping
            let attempts = 0
            let position: BubblePosition

            do {
                const angle = (Math.PI * 2 * index) / entries.length + Math.random() * 0.5 - 0.25
                const radius = minRadius + Math.random() * (maxRadius - minRadius)

                const x = centerX + Math.cos(angle) * radius
                const y = centerY + Math.sin(angle) * radius

                // Size based on rank (top performers get bigger bubbles)
                const rankMultiplier = Math.max(0.7, 1 - index * 0.05)
                const scoreMultiplier = entry.score / Math.max(...entries.map((e) => e.score))
                const size = 80 + rankMultiplier * scoreMultiplier * 60

                // Limit rotation to a small range (-10 to +10 degrees) to keep bubbles mostly upright
                const rotation = Math.random() * 20 - 10

                position = {
                    x: Math.max(10, Math.min(90, x)), // Keep within bounds
                    y: Math.max(15, Math.min(85, y)), // Keep within bounds
                    size,
                    rotation,
                    delay: index * 0.1, // Staggered animation
                }

                attempts++
            } while (attempts < 10) // Prevent infinite loop

            positions.push(position)
        })

        setBubblePositions(positions)
    }

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    useEffect(() => {
        // Set up real-time subscription
        const channel = supabase
            .channel("quiz_results_bubbles")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "quiz_results",
                },
                (payload) => {
                    console.log("Real-time update:", payload)
                    // Add a small delay to allow for elastic animation
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
                return <Crown className="w-4 h-4 text-yellow-400" />
            case 1:
                return <Trophy className="w-4 h-4 text-gray-300" />
            case 2:
                return <Medal className="w-4 h-4 text-amber-500" />
            default:
                return (
                    <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500 bg-white/20 rounded-full">
                        {index + 1}
                    </span>
                )
        }
    }

    const getBubbleColor = (index: number, score: number, totalQuestions: number) => {
        const percentage = (score / totalQuestions) * 100

        if (index === 0) return "from-yellow-400 to-yellow-600" // Gold for 1st
        if (index === 1) return "from-gray-300 to-gray-500" // Silver for 2nd
        if (index === 2) return "from-amber-400 to-amber-600" // Bronze for 3rd
        if (percentage >= 80) return "from-green-400 to-green-600" // High score
        if (percentage >= 60) return "from-blue-400 to-blue-600" // Medium score
        return "from-purple-400 to-purple-600" // Lower score
    }

    // if (loading) {
    //     return (
    //         <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-infiniteloop-orange mx-auto mb-4"></div>
    //                 <p className="text-gray-300">Loading leaderboard...</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="min-h-screen bg-dark-gradient overflow-hidden relative">
            {/* Navigation */}
            {/* <div className="absolute top-6 left-6 z-20">
        <Button
          onClick={() => router.push("/leaderboard")}
          variant="outline"
          size="sm"
          className="border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white backdrop-blur-sm bg-black/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Classic View
        </Button>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <Button
          onClick={() => router.push("/reveal")}
          className="bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold backdrop-blur-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Reveal
        </Button>
      </div> */}

            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-infiniteloop-orange/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main container */}
            <div ref={containerRef} className="relative w-full h-screen p-8">
                {/* Center Logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="text-center">
                        <div className="mb-4 animate-slow-bounce">
                            <Image
                                src="/infiniteloop-logo.webp"
                                alt="INFINITELOOP 3.0"
                                width={250}
                                height={60}
                                className="mx-auto drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Bubbles */}
                {leaderboard.map((entry, index) => {
                    const position = bubblePositions[index]
                    if (!position) return null

                    const percentage = Math.round((entry.score / entry.total_questions) * 100)

                    return (
                        <div
                            key={`${entry.username}-${entry.completed_at}`}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in"
                            style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                                width: `${position.size}px`,
                                height: `${position.size}px`,
                                animationDelay: `${position.delay}s`,
                                animationDuration: "0.8s",
                                animationFillMode: "both",
                                animation: "bounce-in 0.8s ease-in-out",
                            }}
                        >
                            <div
                                className={`w-full h-full rounded-full bg-gradient-to-br ${getBubbleColor(
                                    index,
                                    entry.score,
                                    entry.total_questions,
                                )} shadow-2xl backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
                                style={{
                                    transform: `rotate(${position.rotation}deg)`,
                                }}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />

                                {/* Bubble content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 group-hover:scale-105 transition-transform duration-300">
                                    <div className="flex items-center mb-1">
                                        {getRankIcon(index)}
                                        <span className="ml-1 text-xs font-bold">#{index + 1}</span>
                                    </div>

                                    <div className="text-center">
                                        <div className="font-bold text-sm truncate max-w-full px-1" title={entry.username}>
                                            {entry.username}
                                        </div>
                                        <div className="text-xs opacity-90">
                                            {entry.score}/{entry.total_questions}
                                        </div>
                                        <div className="text-xs font-bold">{percentage}%</div>
                                        <div className="text-xs opacity-75 flex items-center justify-center">
                                            <Clock className="w-2 h-2 mr-1" />
                                            {formatTime(entry.total_time_seconds)}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating animation keyframes */}
                                <style jsx>{`
                                    @keyframes float-${index} {
                                    0%, 100% { transform: translateY(0px) rotate(${position.rotation}deg); }
                                    50% { transform: translateY(-10px) rotate(${position.rotation + 5}deg); }
                                }
                                `}</style>

                                <div
                                    className="absolute inset-0"
                                    style={{
                                        animation: `float-${index} ${3 + Math.random() * 2}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 2}s`,
                                    }}
                                />
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-black/80 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap backdrop-blur-sm">
                                    <div className="font-semibold">{entry.username}</div>
                                    <div>
                                        Score: {entry.score}/{entry.total_questions} ({percentage}%)
                                    </div>
                                    <div>Time: {formatTime(entry.total_time_seconds)}</div>
                                    <div>Completed: {new Date(entry.completed_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Empty state */}
                {leaderboard.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-32">
                        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-400">No quiz results yet.</p>
                        <p className="text-gray-500">Be the first to take the quiz!</p>
                    </div>
                )}
            </div>
        </div>
    )
}