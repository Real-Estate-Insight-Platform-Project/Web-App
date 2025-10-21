import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://localhost:8003"

    console.log("Checking Agent Finder health")

    // Call the Agent Finder ML API health check
    const response = await fetch(`${agentFinderApiUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Agent Finder API error:", response.status, errorText)
      
      return NextResponse.json({ 
        error: "Agent Finder service is not healthy",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in health check API:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://localhost:8003"

    console.log("Training Agent Finder system")

    // Call the Agent Finder ML API to train the system
    const response = await fetch(`${agentFinderApiUrl}/train`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        use_cache: body.use_cache ?? true,
        save_cache: body.save_cache ?? true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Agent Finder training error:", response.status, errorText)
      
      return NextResponse.json({ 
        error: "Failed to train Agent Finder system",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in training API:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}