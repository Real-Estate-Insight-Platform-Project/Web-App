import { type NextRequest, NextResponse } from "next/server"

interface RecommendRequest {
  locations?: string[]
  property_types?: string[]
  price_min?: number
  price_max?: number
  top_k?: number
  min_rating?: number
  min_reviews?: number
  require_phone?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json()

    // Get the Python API URL from environment variables
    const pythonApiUrl = process.env.NEXT_PUBLIC_AGENT_RECOMMENDER_URL

    if (!pythonApiUrl) {
      return NextResponse.json({ error: "Python API URL not configured" }, { status: 500 })
    }

    // Forward the request to the Python FastAPI backend
    const response = await fetch(`${pythonApiUrl}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python API error:", errorText)
      return NextResponse.json({ error: "Failed to get agent recommendations" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in agent finder API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
