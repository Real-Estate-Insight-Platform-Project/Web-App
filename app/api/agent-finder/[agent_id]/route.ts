import { type NextRequest, NextResponse } from "next/server"

// Function to sanitize agent details data
function sanitizeAgentDetailsResponse(data: any): any {
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

  return {
    ...data,
    agent_id: cleanNumber(data.agent_id),
    profile: data.profile ? {
      ...data.profile,
      name: cleanString(data.profile.name),
      state: cleanString(data.profile.state),
      city: cleanString(data.profile.city),
      rating: cleanNumber(data.profile.rating),
      review_count: cleanNumber(data.profile.review_count),
      experience_years: cleanNumber(data.profile.experience_years),
      specializations: cleanString(data.profile.specializations),
      languages: cleanString(data.profile.languages),
      agent_type: cleanString(data.profile.agent_type),
      office_name: cleanString(data.profile.office_name),
      phone: cleanString(data.profile.phone),
      website: cleanString(data.profile.website),
      bio: cleanString(data.profile.bio),
    } : {},
    metrics: data.metrics ? {
      ...data.metrics,
      responsiveness: normalizeMetric(data.metrics.responsiveness),
      negotiation: normalizeMetric(data.metrics.negotiation),
      professionalism: normalizeMetric(data.metrics.professionalism),
      market_expertise: normalizeMetric(data.metrics.market_expertise),
      q_prior: normalizeMetric(data.metrics.q_prior),
      confidence_score: normalizeMetric(data.metrics.confidence_score),
    } : {},
    reviews: data.reviews ? {
      ...data.reviews,
      total_count: cleanNumber(data.reviews.total_count),
      recent_reviews: Array.isArray(data.reviews.recent_reviews) 
        ? data.reviews.recent_reviews.map((review: any) => ({
            ...review,
            rating: cleanNumber(review.rating),
            comment: cleanString(review.comment),
            date: cleanString(review.date),
            transaction_type: cleanString(review.transaction_type),
          }))
        : []
    } : { total_count: 0, recent_reviews: [] }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { agent_id: string } }
) {
  try {
    const agentId = params.agent_id

    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://localhost:8003"

    console.log("Fetching agent details for ID:", agentId)

    // Call the Agent Finder ML API for agent details
    const response = await fetch(`${agentFinderApiUrl}/agents/${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Agent Finder API error:", response.status, errorText)
      
      if (response.status === 404) {
        return NextResponse.json({ 
          error: "Agent not found" 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: "Failed to get agent details",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Sanitize the data to handle nan values and ensure proper types
    const sanitizedData = sanitizeAgentDetailsResponse(data)
    
    return NextResponse.json(sanitizedData)
  } catch (error) {
    console.error("Error in agent details API:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}