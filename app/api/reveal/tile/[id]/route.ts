import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { cookies } from "next/headers"

const GRID_SIZE = 16 // 16x16 grid
const TILE_SIZE = 64 // Each tile will be 64x64 pixels

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication (same as leaderboard)
    const cookieStore = await cookies()
    const access = cookieStore.get("leaderboard_access")

    if (!access || access.value !== "granted") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Not a mistake
    const { id: tileIdParam } = await params;

    const tileId = Number.parseInt(tileIdParam)

    if (isNaN(tileId) || tileId < 0 || tileId >= GRID_SIZE * GRID_SIZE) {
      return NextResponse.json({ error: "Invalid tile ID" }, { status: 400 })
    }

    // Calculate tile position
    const row = Math.floor(tileId / GRID_SIZE)
    const col = tileId % GRID_SIZE

    // Load the image from the public directory
    const imageResponse = await fetch(new URL("/reveal-image.png", request.url))
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Get image dimensions and resize to fit grid perfectly
    const image = sharp(Buffer.from(imageBuffer))
    const metadata = await image.metadata()

    // Resize image to exact grid dimensions
    const targetSize = GRID_SIZE * TILE_SIZE
    const resizedImage = image.resize(targetSize, targetSize, {
      fit: "cover",
      position: "center",
    })

    // Extract the specific tile
    const tileBuffer = await resizedImage
      .extract({
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
      })
      .png()
      .toBuffer()

    // Convert to base64
    const base64 = tileBuffer.toString("base64")
    const dataUri = `data:image/png;base64,${base64}`

    return NextResponse.json({
      tileId,
      dataUri,
      row,
      col,
    })
  } catch (error) {
    console.error("Error generating tile:", error)
    return NextResponse.json({ error: "Failed to generate tile" }, { status: 500 })
  }
}
