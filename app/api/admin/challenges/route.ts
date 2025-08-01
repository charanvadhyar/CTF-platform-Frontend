import { NextResponse } from "next/server"
import { challenges } from "@/lib/db"

export async function GET() {
  return NextResponse.json(challenges)
}

export async function POST(request: Request) {
  try {
    const newChallenge = await request.json()

    // Add new challenge to the array
    const challenge = {
      ...newChallenge,
      id: (challenges.length + 1).toString(),
    }

    challenges.push(challenge)

    return NextResponse.json(challenge)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
