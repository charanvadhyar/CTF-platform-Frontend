import { type NextRequest, NextResponse } from "next/server"
import { adSlots } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { position: string } }) {
  const position = params.position
  const adSlot = adSlots.find((ad) => ad.position === position)

  if (!adSlot) {
    return NextResponse.json({ code: "", active: false })
  }

  return NextResponse.json({
    code: adSlot.code,
    active: adSlot.active,
  })
}
