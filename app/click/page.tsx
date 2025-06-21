"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MousePointer, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ClickData {
  x: number
  y: number
  image_width: number
  image_height: number
  user_agent?: string
}

export default function ClickPage() {
  const [clickCount, setClickCount] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const router = useRouter()

  // Throttling state
  const clickQueue = useRef<ClickData[]>([])
  const lastSentTime = useRef<number>(0)
  const isProcessing = useRef<boolean>(false)
  const THROTTLE_DELAY = 500 // Send clicks every 500ms maximum

  // Process queued clicks
  const processClickQueue = useCallback(async () => {
    if (isProcessing.current || clickQueue.current.length === 0) return

    const now = Date.now()
    if (now - lastSentTime.current < THROTTLE_DELAY) {
      // Schedule next processing
      setTimeout(processClickQueue, THROTTLE_DELAY - (now - lastSentTime.current))
      return
    }

    isProcessing.current = true
    const clicksToSend = [...clickQueue.current]
    clickQueue.current = []

    try {
      // Send all queued clicks at once
      const { error } = await supabase.from("clicks").insert(clicksToSend)

      if (error) {
        console.error("Error saving clicks:", error)
        // Put failed clicks back in queue
        clickQueue.current.unshift(...clicksToSend)
      } else {
        // Send via Realtime channel for immediate updates (send only the latest click for real-time effect)
        if (clicksToSend.length > 0) {
          const channel = supabase.channel("clicks_channel")
          channel.send({
            type: "broadcast",
            event: "new_click",
            payload: clicksToSend[clicksToSend.length - 1], // Send only the most recent click
          })
        }
      }

      lastSentTime.current = now
    } catch (error) {
      console.error("Failed to process clicks:", error)
      // Put failed clicks back in queue
      clickQueue.current.unshift(...clicksToSend)
    } finally {
      isProcessing.current = false

      // Process remaining clicks if any
      if (clickQueue.current.length > 0) {
        setTimeout(processClickQueue, THROTTLE_DELAY)
      }
    }
  }, [])

  const handleImageClick = useCallback(
    async (event: React.MouseEvent<HTMLImageElement>) => {
      if (!imageRef.current) return

      // Always increment click count immediately for responsive UI
      setClickCount((prev) => prev + 1)

      try {
        // Get click coordinates relative to the image
        const rect = imageRef.current.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100 // Convert to percentage
        const y = ((event.clientY - rect.top) / rect.height) * 100 // Convert to percentage

        // Get actual image dimensions
        const imageWidth = imageRef.current.naturalWidth
        const imageHeight = imageRef.current.naturalHeight

        const clickData: ClickData = {
          x: x,
          y: y,
          image_width: imageWidth,
          image_height: imageHeight,
          user_agent: navigator.userAgent,
        }

        // Add to queue instead of sending immediately
        clickQueue.current.push(clickData)

        // Process queue (with throttling)
        processClickQueue()
      } catch (error) {
        console.error("Failed to handle click:", error)
      }
    },
    [processClickQueue],
  )

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={300} height={75} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Where is the error?</h1>
          <p className="text-gray-300 mb-4">Click on where you think the error is as much as you want!</p>

          {/* Navigation */}
          {/* <div className="flex justify-center space-x-4 mb-6">
            <Button
              onClick={() => router.push("/heatmap")}
              className="bg-infiniteloop-gradient hover:bg-infiniteloop-gradient-dark text-white font-semibold"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Heatmap
            </Button>
          </div> */}
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="infiniteloop-card border-infiniteloop-orange/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">{clickCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Clicks</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-infiniteloop-yellow/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">
                <MousePointer className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Click Anywhere</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-infiniteloop-orange/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">Live</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Real-time Tracking</div>
            </CardContent>
          </Card>
        </div> */}

        {/* Click Image */}
        <Card className="infiniteloop-card">
          {/* <CardHeader>
            <CardTitle className="text-center text-gray-900 dark:text-white">Click Tracking Image</CardTitle>
          </CardHeader> */}
          <CardContent className="p-0">
            <div className="relative w-full max-w-2xl mx-auto">
              <Image
                ref={imageRef}
                src="/reveal-image.png"
                alt="Click tracking image"
                width={800}
                height={800}
                className="w-full h-auto rounded-lg shadow-lg cursor-crosshair hover:shadow-xl transition-shadow duration-200"
                onClick={handleImageClick}
                priority
              />

              {/* Click indicator overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-2 border-dashed border-infiniteloop-orange/30 rounded-lg"></div>
              </div>
            </div>

            <div className="text-center m-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click anywhere on the image to record coordinates. All clicks are tracked in real-time!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {/* <div className="mt-8 text-center">
          <Card className="infiniteloop-card border-infiniteloop-yellow/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex flex-col items-center">
                  <MousePointer className="w-8 h-8 text-infiniteloop-orange mb-2" />
                  <p>
                    <strong>Click</strong>
                    <br />
                    Click anywhere on the image
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-infiniteloop-gradient rounded-full mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">DB</span>
                  </div>
                  <p>
                    <strong>Store</strong>
                    <br />
                    Coordinates saved to database
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <Eye className="w-8 h-8 text-infiniteloop-orange mb-2" />
                  <p>
                    <strong>Visualize</strong>
                    <br />
                    View live heatmap of all clicks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  )
}
