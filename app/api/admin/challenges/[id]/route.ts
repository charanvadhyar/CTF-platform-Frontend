import { type NextRequest, NextResponse } from "next/server"
import { challenges, getChallengeById } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const challenge = getChallengeById(params.id)

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  return NextResponse.json(challenge)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedData = await request.json()
    const challengeIndex = challenges.findIndex((c) => c.id === params.id)

    if (challengeIndex === -1) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Update the challenge
    challenges[challengeIndex] = { ...challenges[challengeIndex], ...updatedData }

    return NextResponse.json(challenges[challengeIndex])
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const challengeIndex = challenges.findIndex((c) => c.id === params.id)

  if (challengeIndex === -1) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  const deletedChallenge = challenges.splice(challengeIndex, 1)[0]

  return NextResponse.json(deletedChallenge)
}
