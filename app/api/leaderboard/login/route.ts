import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const LEADERBOARD_PASSWORD = process.env.LEADERBOARD_PASSWORD || "admin123"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get("password")

    if (!password || password !== LEADERBOARD_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Set secure cookie for leaderboard access
    const cookieStore = cookies()
    cookieStore.set("leaderboard_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ success: true, message: "Access granted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 })
  }
}
