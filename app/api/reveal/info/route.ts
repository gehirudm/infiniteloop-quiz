import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const GRID_SIZE = 16

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const access = cookieStore.get("leaderboard_access")

    if (!access || access.value !== "granted") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      gridSize: GRID_SIZE,
      totalTiles: GRID_SIZE * GRID_SIZE,
      tileSize: 64,
    })
  } catch (error) {
    console.error("Error getting reveal info:", error)
    return NextResponse.json({ error: "Failed to get reveal info" }, { status: 500 })
  }
}
