import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://localhost:8003"

    console.log("Fetching system stats from Agent Finder API")

    // Call the Agent Finder ML API for system statistics
    const response = await fetch(`${agentFinderApiUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Agent Finder API error:", response.status, errorText)
      
      return NextResponse.json({ 
        error: "Failed to get system stats",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in system stats API:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}