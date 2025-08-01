import { type NextRequest, NextResponse } from "next/server"
import { getAds } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get("position")

  if (!position) {
    return NextResponse.json({ error: "Position parameter required" }, { status: 400 })
  }

  try {
    // Fetch ads from backend API using position parameter
    const ads = await getAds(position)
    
    // Debug: Log the raw response from backend
    console.log(`DEBUG - Raw ad response for position ${position}:`, JSON.stringify(ads, null, 2))
    
    // Check if we have any ads for this position
    if (!ads || ads.length === 0) {
      console.log(`No ads found for position: ${position}`)
      return NextResponse.json({ code: "", active: false })
    }
    
    // Sort ads by created_at (if available) to get the most recent one
    // If created_at isn't available, we'll still use the first one
    let adSlot = ads[0]
    
    if (ads.length > 1) {
      console.log(`Multiple ads found for position ${position}, selecting the most recent one`)
      const sortedAds = [...ads].sort((a, b) => {
        // If created_at exists, sort by it (most recent first)
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return 0 // Keep original order if no created_at
      })
      
      adSlot = sortedAds[0]
      console.log(`Selected most recent ad with id: ${adSlot._id || adSlot.ad_id}`)
    }
    console.log(`DEBUG - Selected ad for position ${position}:`, {
      position: adSlot.position,
      content: adSlot.content,
      is_active: adSlot.is_active
    })
    
    // Return formatted data for the AdSlot component
    const responseData = {
      code: adSlot.content || "", // Backend uses 'content' field
      active: adSlot.is_active !== undefined ? adSlot.is_active : true,
      position: adSlot.position,
    }
    console.log(`DEBUG - Returning to frontend:`, responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`Error fetching ad for position ${position}:`, error)
    return NextResponse.json({ code: "", active: false })
  }
}
