import { NextResponse } from "next/server"
import { userProgress } from "@/lib/db"

export async function GET() {
  // Return all user progress data for leaderboard calculations
  return NextResponse.json(userProgress)
}
