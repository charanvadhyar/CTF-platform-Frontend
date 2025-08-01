import { type NextRequest, NextResponse } from "next/server"
import { userProgress, getUserById, getChallengeById } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  const progress = userProgress.filter((p) => p.userId === userId)
  return NextResponse.json(progress)
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, flag } = await request.json()

    const user = getUserById(userId)
    const challenge = getChallengeById(challengeId)

    if (!user || !challenge) {
      return NextResponse.json({ error: "User or challenge not found" }, { status: 404 })
    }

    // Check if already completed
    const existingProgress = userProgress.find((p) => p.userId === userId && p.challengeId === challengeId)

    if (existingProgress) {
      if (existingProgress.completed) {
        return NextResponse.json({
          success: false,
          message: "Challenge already completed!",
        })
      }
      existingProgress.attempts++
    } else {
      userProgress.push({
        userId,
        challengeId,
        completed: false,
        attempts: 1,
      })
    }

    // Check if flag is correct
    if (flag === challenge.flag) {
      const progress = userProgress.find((p) => p.userId === userId && p.challengeId === challengeId)
      if (progress) {
        progress.completed = true
        progress.completedAt = new Date()
      }

      // Update user's total score
      user.totalScore += challenge.points

      return NextResponse.json({
        success: true,
        message: `Correct! You earned ${challenge.points} points!`,
        points: challenge.points,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Incorrect flag. Try again!",
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
