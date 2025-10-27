import { type NextRequest, NextResponse } from "next/server"

// Backend API URL - using port 8004 as specified
const BACKEND_API_URL = process.env.AGENT_FINDER_API_URL || "http://34.72.69.249:8004"
const API_PREFIX = "/api/v1"

export async function GET(
  request: NextRequest,
  { params }: { params: { agent_id: string } }
) {
  try {
    const agentId = params.agent_id

    if (!agentId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Agent ID is required" 
        },
        { status: 400 }
      )
    }

    console.log("Fetching agent details for ID:", agentId)

    // Call the backend API
    const response = await fetch(`${BACKEND_API_URL}${API_PREFIX}/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: "Agent not found" 
          },
          { status: 404 }
        )
      }
      
      let errorMessage = "Failed to get agent details"
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.detail || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          details: errorText 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log("Successfully fetched agent details")
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching agent details:", error)
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unable to connect to the agent finder backend. Please ensure the backend is running on port 8004.",
          details: error.message
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}