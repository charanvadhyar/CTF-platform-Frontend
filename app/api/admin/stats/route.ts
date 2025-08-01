import { NextResponse } from "next/server"
import { users, userProgress, pageVisits } from "@/lib/db"

export async function GET() {
  const stats = {
    totalUsers: users.length,
    totalVisits: pageVisits.length,
    completedChallenges: userProgress.filter((p) => p.completed).length,
  }

  return NextResponse.json(stats)
}
