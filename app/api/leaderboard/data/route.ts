import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getLeaderboard } from "@/lib/quiz-store"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const access = cookieStore.get("leaderboard_access")

    if (!access || access.value !== "granted") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const leaderboard = await getLeaderboard()

    return NextResponse.json({ leaderboard })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
