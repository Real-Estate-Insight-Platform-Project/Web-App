import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || process.env.NEXT_PUBLIC_AGENT_RECOMMENDER_URL

    if (!agentFinderApiUrl) {
      return NextResponse.json(
        { success: false, error: "Agent Finder API URL not configured" },
        { status: 500 }
      )
    }

    // Forward the request to the Python FastAPI backend
    const response = await fetch(`${agentFinderApiUrl}/api/v1/locations/states`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python API error:", errorText)
      return NextResponse.json(
        { success: false, error: "Failed to get states" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in states API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
