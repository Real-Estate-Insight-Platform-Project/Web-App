import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get state_name from query parameters
    const searchParams = request.nextUrl.searchParams
    const stateName = searchParams.get("state_name")

    if (!stateName) {
      return NextResponse.json(
        { success: false, error: "state_name query parameter is required" },
        { status: 400 }
      )
    }

    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || process.env.NEXT_PUBLIC_AGENT_RECOMMENDER_URL

    if (!agentFinderApiUrl) {
      return NextResponse.json(
        { success: false, error: "Agent Finder API URL not configured" },
        { status: 500 }
      )
    }

    // Forward the request to the Python FastAPI backend
    const response = await fetch(
      `${agentFinderApiUrl}/api/v1/locations/cities?state_name=${encodeURIComponent(stateName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python API error:", errorText)
      return NextResponse.json(
        { success: false, error: "Failed to get cities" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in cities API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
