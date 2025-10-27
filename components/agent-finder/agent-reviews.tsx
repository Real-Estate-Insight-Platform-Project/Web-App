"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
// Removed AgentSentiment import - using custom visualization

interface ReviewCounts {
  total_review_count: number
  positive_review_count: number
  negative_review_count: number
  neutral_review_count: number
}

interface Review {
  review_id: string
  advertiser_id: number
  review_rating: number
  review_comment: string | null
  review_created_date: string | null
  transaction_date: string | null
  reviewer_role: string | null
  reviewer_location: string | null
  sentiment: string | null
  sentiment_confidence: number | null
}

interface AgentReviewsResponse {
  success: boolean
  agent_id: number
  agent_name: string
  review_counts: ReviewCounts
  recent_reviews: Review[]
}

interface AgentReviewsProps {
  agentId: number
}

export function AgentReviews({ agentId }: AgentReviewsProps) {
  const [reviews, setReviews] = useState<AgentReviewsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/agent-finder/reviews/${agentId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data: AgentReviewsResponse = await response.json()
        
        if (data.success) {
          setReviews(data)
        } else {
          throw new Error("Failed to load reviews")
        }
      } catch (err) {
        console.error("Error fetching reviews:", err)
        setError(err instanceof Error ? err.message : "Failed to load reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [agentId])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentBadgeClass = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-700 border-green-300"
      case "negative":
        return "bg-red-100 text-red-700 border-red-300"
      case "neutral":
        return "bg-gray-100 text-gray-700 border-gray-300"
      default:
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  if (isLoading) {
    return (
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!reviews) {
    return null
  }

  const { review_counts, recent_reviews } = reviews
  const totalReviews = review_counts.total_review_count
  const positivePercentage = totalReviews > 0 ? (review_counts.positive_review_count / totalReviews) * 100 : 0

  return (
    <Card className="border-purple-100">
      <CardHeader className="bg-purple-50 border-b border-purple-100">
        <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          Reviews & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Review Counts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Total Reviews</span>
              <Star className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {review_counts.total_review_count}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900">Positive</span>
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {review_counts.positive_review_count}
            </div>
            <div className="text-xs text-green-700 mt-1">
              {positivePercentage.toFixed(0)}% positive
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-900">Negative</span>
              <ThumbsDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {review_counts.negative_review_count}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Neutral</span>
              <Minus className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {review_counts.neutral_review_count}
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        {review_counts.total_review_count > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm font-semibold text-purple-900 mb-3">
              Sentiment Distribution
            </div>
            <div className="flex h-4 bg-white rounded-full overflow-hidden border border-purple-200">
              <div
                className="bg-gradient-to-r from-green-400 to-green-500"
                style={{
                  width: `${(review_counts.positive_review_count / totalReviews) * 100}%`,
                }}
                title={`${positivePercentage.toFixed(1)}% Positive`}
              />
              <div
                className="bg-gradient-to-r from-gray-300 to-gray-400"
                style={{
                  width: `${(review_counts.neutral_review_count / totalReviews) * 100}%`,
                }}
                title={`${((review_counts.neutral_review_count / totalReviews) * 100).toFixed(1)}% Neutral`}
              />
              <div
                className="bg-gradient-to-r from-red-400 to-red-500"
                style={{
                  width: `${(review_counts.negative_review_count / totalReviews) * 100}%`,
                }}
                title={`${((review_counts.negative_review_count / totalReviews) * 100).toFixed(1)}% Negative`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{positivePercentage.toFixed(0)}% Positive</span>
              <span>{((review_counts.negative_review_count / totalReviews) * 100).toFixed(0)}% Negative</span>
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {recent_reviews.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
              <TrendingUp className="h-4 w-4" />
              Recent Reviews
            </div>
            
            {recent_reviews.map((review, idx) => (
              <div
                key={review.review_id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getSentimentBadgeClass(review.sentiment)}>
                      <span className="flex items-center gap-1">
                        {getSentimentIcon(review.sentiment)}
                        <span className="capitalize">{review.sentiment || "Unknown"}</span>
                      </span>
                    </Badge>
                    {review.sentiment_confidence && (
                      <span className="text-xs text-gray-500">
                        {(review.sentiment_confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {review.review_rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                {review.review_comment && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                    "{review.review_comment}"
                  </p>
                )}

                {/* Review Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  {review.reviewer_role && (
                    <Badge variant="outline" className="text-xs">
                      {review.reviewer_role}
                    </Badge>
                  )}
                  {review.reviewer_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {review.reviewer_location}
                    </span>
                  )}
                  {review.review_created_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(review.review_created_date)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent reviews available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
