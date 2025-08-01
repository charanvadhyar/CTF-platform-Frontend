import { type NextRequest, NextResponse } from "next/server"
import { pageVisits } from "@/lib/db"
import type { PageVisit } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { path, email, username, timestamp, userAgent } = await request.json()

    const pageVisit: PageVisit = {
      id: Date.now().toString(),
      page: path,
      email: email || "anonymous",
      username: username || "anonymous",
      timestamp: new Date(timestamp),
      userAgent: userAgent || "",
    }

    pageVisits.push(pageVisit)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking page visit:", error)
    return NextResponse.json({ error: "Failed to track page visit" }, { status: 500 })
  }
}

export async function GET() {
  // Return page visits for analytics (admin only)
  return NextResponse.json(pageVisits)
}
