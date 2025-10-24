export interface SentimentReview {
  review_id: string
  review_text: string
  review_rating: number
  sentiment: "good" | "bad" | "neutral"
  sentiment_score: number
  review_date: string
  reviewer_role: "BUYER" | "SELLER"
  sub_scores: {
    responsiveness: number | null
    negotiation: number | null
    professionalism: number | null
    market_expertise: number | null
  }
}

export interface SentimentSummary {
  good: number
  bad: number
  neutral: number
}

export interface SentimentDistribution {
  good: number
  bad: number
  neutral: number
}

export interface SentimentAnalysis {
  agent_id: number
  agent_name: string
  total_reviews: number
  recent_reviews_count: number
  sentiment_summary: SentimentSummary
  sentiment_distribution: SentimentDistribution
  classified_reviews: SentimentReview[]
}