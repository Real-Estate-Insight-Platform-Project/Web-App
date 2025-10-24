import { type NextRequest, NextResponse } from "next/server"

interface UserPreferences {
  responsiveness?: number
  negotiation?: number
  professionalism?: number
  market_expertise?: number
}

interface UserFilters {
  state?: string
  city?: string
  transaction_type?: "buying" | "selling"
  price_min?: number
  price_max?: number
  language?: string
  specialization?: string
  min_rating?: number
  min_reviews?: number
  require_recent_activity?: boolean
  active_only?: boolean
}

interface AgentFinderRequest {
  preferences?: UserPreferences
  filters?: UserFilters
  top_k?: number
  include_explanations?: boolean
}

// Function to sanitize data from Agent Finder API
function sanitizeAgentFinderResponse(data: any): any {
  if (!data) return data

  // Helper function to clean string values
  const cleanString = (value: any): string => {
    if (value === null || value === undefined || value === "nan" || 
        (typeof value === "number" && isNaN(value))) {
      return ""
    }
    return String(value).trim()
  }

  // Helper function to clean number values
  const cleanNumber = (value: any): number => {
    if (value === null || value === undefined || value === "nan" || 
        (typeof value === "number" && isNaN(value))) {
      return 0
    }
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  // Helper function to normalize metric values (ensure they're in 0-1 range for proper percentage display)
  const normalizeMetric = (value: any): number => {
    const num = cleanNumber(value)
    // If the value is greater than 1, assume it's already a percentage and convert back to 0-1 range
    if (num > 1) {
      return Math.min(num / 100, 1) // Convert percentage back to decimal, cap at 1
    }
    // Ensure it's between 0 and 1
    return Math.min(Math.max(num, 0), 1)
  }

  // Sanitize recommendations
  if (data.recommendations && Array.isArray(data.recommendations)) {
    data.recommendations = data.recommendations.map((agent: any) => ({
      ...agent,
      name: cleanString(agent.name),
      profile: agent.profile ? {
        ...agent.profile,
        state: cleanString(agent.profile.state),
        city: cleanString(agent.profile.city),
        rating: cleanNumber(agent.profile.rating),
        review_count: cleanNumber(agent.profile.review_count),
        experience_years: cleanNumber(agent.profile.experience_years),
        specializations: cleanString(agent.profile.specializations),
        languages: cleanString(agent.profile.languages),
        agent_type: cleanString(agent.profile.agent_type),
        office_name: cleanString(agent.profile.office_name),
        phone: cleanString(agent.profile.phone),
        website: cleanString(agent.profile.website),
        bio: cleanString(agent.profile.bio),
      } : {},
      metrics: agent.metrics ? {
        ...agent.metrics,
        responsiveness: normalizeMetric(agent.metrics.responsiveness),
        negotiation: normalizeMetric(agent.metrics.negotiation),
        professionalism: normalizeMetric(agent.metrics.professionalism),
        market_expertise: normalizeMetric(agent.metrics.market_expertise),
        q_prior: normalizeMetric(agent.metrics.q_prior),
        wilson_lower_bound: normalizeMetric(agent.metrics.wilson_lower_bound),
        recency_score: normalizeMetric(agent.metrics.recency_score),
      } : {},
      utility_score: normalizeMetric(agent.utility_score),
      confidence_score: normalizeMetric(agent.confidence_score),
      availability_fit: normalizeMetric(agent.availability_fit),
      rank: cleanNumber(agent.rank),
      agent_id: cleanNumber(agent.agent_id),
    }))
  }

  // Sanitize explanations
  if (data.explanations && Array.isArray(data.explanations)) {
    data.explanations = data.explanations.map((explanation: any) => ({
      ...explanation,
      agent_name: cleanString(explanation.agent_name),
      why_recommended: cleanString(explanation.why_recommended),
      agent_id: cleanNumber(explanation.agent_id),
      rank: cleanNumber(explanation.rank),
    }))
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentFinderRequest = await request.json()

    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://localhost:8003"

    // Prepare the request payload for the Agent Finder ML system
    const agentFinderPayload = {
      preferences: {
        responsiveness: body.preferences?.responsiveness ?? 0.5,
        negotiation: body.preferences?.negotiation ?? 0.5,
        professionalism: body.preferences?.professionalism ?? 0.5,
        market_expertise: body.preferences?.market_expertise ?? 0.5,
      },
      filters: {
        state: body.filters?.state,
        city: body.filters?.city,
        transaction_type: body.filters?.transaction_type,
        price_min: body.filters?.price_min,
        price_max: body.filters?.price_max,
        language: body.filters?.language || "English",
        specialization: body.filters?.specialization,
        min_rating: body.filters?.min_rating,
        min_reviews: body.filters?.min_reviews,
        require_recent_activity: body.filters?.require_recent_activity || false,
        active_only: body.filters?.active_only ?? true,
      },
      top_k: body.top_k || 10,
      include_explanations: body.include_explanations ?? true,
    }

    console.log("Calling Agent Finder API at:", `${agentFinderApiUrl}/recommend`)
    console.log("Payload:", JSON.stringify(agentFinderPayload, null, 2))

    // Call the Agent Finder ML API
    const response = await fetch(`${agentFinderApiUrl}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentFinderPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Agent Finder API error:", response.status, errorText)
      
      // Check if it's a training issue
      if (response.status === 404 && errorText.includes("not trained")) {
        return NextResponse.json({ 
          error: "Agent Finder system is not trained yet. Please initialize the system first.",
          needs_training: true 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: "Failed to get agent recommendations",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Sanitize the data to handle nan values and ensure proper types
    const sanitizedData = sanitizeAgentFinderResponse(data)
    
    return NextResponse.json(sanitizedData)
  } catch (error) {
    console.error("Error in agent finder API:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
