import { type NextRequest, NextResponse } from "next/server"

// Backend API URL - using port 8004 as specified
const BACKEND_API_URL = process.env.AGENT_FINDER_API_URL || "http://localhost:8004"
const API_PREFIX = "/api/v1"

interface AgentSearchRequest {
  user_type: "buyer" | "seller"
  state: string
  city: string
  min_price?: number
  max_price?: number
  property_type?: string
  is_urgent?: boolean
  language?: string
  sub_score_preferences?: Record<string, number>
  skill_preferences?: Record<string, number>
  additional_specializations?: string[]
  max_results?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentSearchRequest = await request.json()

    console.log("Received search request:", body)

    // Validate required fields
    if (!body.user_type || !body.state || !body.city) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields: user_type, state, and city are required" 
        },
        { status: 400 }
      )
    }

    // Prepare the request payload for the backend
    const backendPayload = {
      user_type: body.user_type,
      state: body.state,
      city: body.city,
      min_price: body.min_price,
      max_price: body.max_price,
      property_type: body.property_type,
      is_urgent: body.is_urgent || false,
      language: body.language || "English",
      sub_score_preferences: body.sub_score_preferences || {},
      skill_preferences: body.skill_preferences || {},
      additional_specializations: body.additional_specializations || [],
      max_results: body.max_results || 20,
    }

    console.log("Calling backend at:", `${BACKEND_API_URL}${API_PREFIX}/agents/search`)
    console.log("Payload:", JSON.stringify(backendPayload, null, 2))

    // Call the backend API
    const response = await fetch(`${BACKEND_API_URL}${API_PREFIX}/agents/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend API error:", response.status, errorText)
      
      let errorMessage = "Failed to get agent recommendations"
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
    
    // The backend already returns the correct format, just pass it through
    console.log(`Successfully found ${data.total_results} agents`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in agent search API:", error)
    
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