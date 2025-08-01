import { type NextRequest, NextResponse } from "next/server"

// This API route is deprecated - the frontend now uses the FastAPI backend directly
// Keeping this for backward compatibility, but it should not be used

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Please use the FastAPI backend directly." },
    { status: 410 } // Gone
  )
}

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Please use the FastAPI backend directly." },
    { status: 410 } // Gone
  )
}
