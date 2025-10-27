import { NextRequest, NextResponse } from 'next/server'

interface SentimentReview {
  review_id: string
  review_text: string
  review_rating: number
  sentiment: "good" | "bad" | "neutral"
  sentiment_score: number
  review_date: string
  reviewer_role: "BUYER" | "SELLER"
  sub_scores: {
    responsiveness: number
    negotiation: number
    professionalism: number
    market_expertise: number
  }
}

interface SentimentResponse {
  agent_id: number
  agent_name: string
  total_reviews: number
  sentiment_summary: {
    good: number
    bad: number
    neutral: number
  }
  sentiment_distribution: {
    good: number
    bad: number
    neutral: number
  }
  classified_reviews: SentimentReview[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { agent_id: string } }
) {
  try {
    const agentId = parseInt(params.agent_id)

    if (isNaN(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      )
    }

    // Get the Agent Finder API URL from environment variables
    const agentFinderApiUrl = process.env.AGENT_FINDER_API_URL || "http://34.72.69.249:8003"

    console.log("Fetching sentiment analysis for agent ID:", agentId)

    // Call the Agent Finder ML API for sentiment analysis
    const response = await fetch(`${agentFinderApiUrl}/agents/${agentId}/reviews/sentiment`, {
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
          error: "Agent sentiment analysis not found" 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: "Failed to get sentiment analysis",
        details: errorText 
      }, { status: response.status })
    }

    const data = await response.json()
    
    // Sanitize the data to handle any potential issues
    const sanitizedData: SentimentResponse = {
      agent_id: Number(data.agent_id) || agentId,
      agent_name: String(data.agent_name || "Unknown Agent"),
      total_reviews: Number(data.total_reviews) || 0,
      sentiment_summary: {
        good: Number(data.sentiment_summary?.good) || 0,
        bad: Number(data.sentiment_summary?.bad) || 0,
        neutral: Number(data.sentiment_summary?.neutral) || 0,
      },
      sentiment_distribution: {
        good: Number(data.sentiment_distribution?.good) || 0,
        bad: Number(data.sentiment_distribution?.bad) || 0,
        neutral: Number(data.sentiment_distribution?.neutral) || 0,
      },
      classified_reviews: Array.isArray(data.classified_reviews) 
        ? data.classified_reviews.map((review: any) => ({
            review_id: String(review.review_id || ""),
            review_text: String(review.review_text || ""),
            review_rating: Number(review.review_rating) || 0,
            sentiment: review.sentiment || "neutral",
            sentiment_score: Number(review.sentiment_score) || 0,
            review_date: String(review.review_date || ""),
            reviewer_role: review.reviewer_role || "BUYER",
            sub_scores: {
              responsiveness: review.sub_scores?.responsiveness ? Number(review.sub_scores.responsiveness) : 0,
              negotiation: review.sub_scores?.negotiation ? Number(review.sub_scores.negotiation) : 0,
              professionalism: review.sub_scores?.professionalism ? Number(review.sub_scores.professionalism) : 0,
              market_expertise: review.sub_scores?.market_expertise ? Number(review.sub_scores.market_expertise) : 0,
            }
          }))
        : []
    }
    
    return NextResponse.json(sanitizedData)

  } catch (error) {
    console.error('Error fetching sentiment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment analysis' },
      { status: 500 }
    )
  }
}