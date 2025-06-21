"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MousePointer, Activity, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import h337 from "heatmap.js";

interface ClickPoint {
  id: number
  x: number
  y: number
  image_width: number
  image_height: number
  created_at: string
}

export default function HeatmapPage() {
  const [clicks, setClicks] = useState<ClickPoint[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const heatmapInstance = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    initializeHeatmap()
  }, [heatmapRef])

  // Initialize heatmap
  const initializeHeatmap = () => {
    if (heatmapRef.current) {
      heatmapInstance.current = h337.create({
        container: heatmapRef.current,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        radius: 15, // Add radius for better visualization
        blur: 0.9,
        gradient: {
          0.0: "#3B82F6", // Blue
          0.2: "#10B981", // Green
          0.4: "#F59E0B", // Yellow
          0.6: "#EF4444", // Red
          0.8: "#8B5CF6", // Purple
          1.0: "#EC4899", // Pink
        },
      })
      fetchClicks()
    }
  }

  // Fetch existing clicks
  const fetchClicks = async () => {
    try {
      const { data, error } = await supabase.from("clicks").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching clicks:", error)
      } else {
        setClicks(data || [])
        setTotalClicks(data?.length || 0)
        updateHeatmap(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch clicks:", error)
    }
  }

  // Update heatmap with click data
  const updateHeatmap = (clickData: ClickPoint[]) => {
    if (!heatmapInstance.current || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()

    const heatmapData = clickData.map((click) => ({
      x: (click.x / 100) * rect.width, // Convert percentage back to pixels
      y: (click.y / 100) * rect.height,
      value: 1,
    }))

    heatmapInstance.current.setData({
      data: heatmapData,
    })

    heatmapInstance.current.setDataMax(200);
  }

  // Set up real-time subscription
  useEffect(() => {
    // Create a channel for Postgres changes
    // const postgresChannel = supabase
    //   .channel("postgres_changes")
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "*",
    //       schema: "public",
    //       table: "clicks",
    //     },
    //     (payload) => {
    //       console.log("Real-time database update:", payload);
    //       if (payload.eventType === "INSERT") {
    //         const newClick = payload.new as ClickPoint;
    //         setClicks((prev) => [newClick, ...prev]);
    //         setTotalClicks((prev) => prev + 1);

    //         // Update heatmap with the new click
    //         if (heatmapInstance.current && imageRef.current) {
    //           const rect = imageRef.current.getBoundingClientRect();
    //           const heatmapData = {
    //             x: (newClick.x / 100) * rect.width,
    //             y: (newClick.y / 100) * rect.height,
    //             value: 1
    //           };

    //           // Add the new point to the existing heatmap
    //           heatmapInstance.current.addData(heatmapData);
    //         }
    //       }
    //     }
    //   )
    //   .subscribe();

    // Create a separate channel for broadcast events from the click page
    const broadcastChannel = supabase
      .channel("clicks_channel")
      .on(
        "broadcast",
        { event: "new_click" },
        (payload) => {
          console.log("Broadcast click update:", payload);
          const newClick = payload.payload as ClickPoint;

          // Update heatmap immediately for better real-time experience
          if (heatmapInstance.current && imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const heatmapData = {
              x: (newClick.x / 100) * rect.width,
              y: (newClick.y / 100) * rect.height,
              value: 1
            };

            // Add the new point to the existing heatmap
            heatmapInstance.current.addData(heatmapData);
          }
        }
      )
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      // supabase.removeChannel(postgresChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, []);

  // Handle window resize to update heatmap
  // useEffect(() => {
  //   const handleResize = () => {
  //     setTimeout(() => {
  //       updateHeatmap(clicks)
  //     }, 100)
  //   }

  //   window.addEventListener("resize", handleResize)
  //   return () => window.removeEventListener("resize", handleResize)
  // }, [clicks])

  // Clear all clicks
  const clearClicks = async () => {
    try {
      const { error } = await supabase.from("clicks").delete().neq("id", 0)

      if (error) {
        console.error("Error clearing clicks:", error)
      } else {
        setClicks([])
        setTotalClicks(0)
        if (heatmapInstance.current) {
          heatmapInstance.current.setData({ max: 5, data: [] })
        }
      }
    } catch (error) {
      console.error("Failed to clear clicks:", error)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={300} height={75} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Where is the error?</h1>
          <p className="text-gray-300 mb-4">Click on the place where you think the error is as much as you want</p>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="infiniteloop-card border-infiniteloop-orange/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">{totalClicks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-infiniteloop-yellow/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">
                <Activity className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Live Updates</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-infiniteloop-orange/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold infiniteloop-gradient-text">
                {clicks.length > 0 ? new Date(clicks[0].created_at).toLocaleTimeString() : "--:--"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Last Click</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-red-500/30">
            <CardContent className="p-4 text-center">
              <Button
                onClick={clearClicks}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </CardContent>
          </Card>
        </div> */}

        {/* Heatmap */}
        <Card className="infiniteloop-card">
          {/* <CardHeader>
            <CardTitle className="text-center text-gray-900 dark:text-white">Where is the error?</CardTitle>
          </CardHeader> */}
          <CardContent className="p-6">
            <div className="relative w-full max-w-2xl mx-auto">
              {/* Base Image */}
              <Image
                ref={imageRef}
                src="/reveal-image.png"
                alt="Heatmap base image"
                width={800}
                height={800}
                className="w-full h-auto rounded-lg"
                onLoad={() => updateHeatmap(clicks)}
                priority
              />

              {/* Heatmap Overlay */}
              <div
                ref={heatmapRef}
                className="!absolute inset-0 w-full h-full rounded-lg pointer-events-none"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Heatmap shows click density - warmer colors indicate more clicks in that area
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clicks */}
        {/* <Card className="infiniteloop-card border-infiniteloop-yellow/20 mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Clicks</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clicks.slice(0, 10).map((click) => (
                <div
                  key={click.id}
                  className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    <MousePointer className="w-3 h-3 inline mr-1" />({click.x.toFixed(1)}%, {click.y.toFixed(1)}%)
                  </span>
                  <span className="text-xs text-gray-500">{new Date(click.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
              {clicks.length === 0 && <p className="text-center text-gray-500 py-4">No clicks recorded yet</p>}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
