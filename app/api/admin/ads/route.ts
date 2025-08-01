import { type NextRequest, NextResponse } from "next/server"
import { adSlots } from "@/lib/db"

export async function GET() {
  return NextResponse.json(adSlots)
}

export async function PUT(request: NextRequest) {
  try {
    const { id, code, active } = await request.json()

    const adSlot = adSlots.find((ad) => ad.id === id)
    if (!adSlot) {
      return NextResponse.json({ error: "Ad slot not found" }, { status: 404 })
    }

    adSlot.code = code || ""
    adSlot.active = active

    return NextResponse.json(adSlot)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
