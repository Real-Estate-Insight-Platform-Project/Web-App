"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Star, 
  MessageSquare, 
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react"
import { SentimentAnalysis, SentimentReview } from "@/types/sentiment"

interface AgentSentimentProps {
  agentId: number
  agentName: string
  isExpanded?: boolean
  onToggle?: () => void
}

export function AgentSentiment({ agentId, agentName, isExpanded = false, onToggle }: AgentSentimentProps) {
  const [sentimentData, setSentimentData] = useState<SentimentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isExpanded && !sentimentData && !isLoading) {
      fetchSentimentData()
    }
  }, [isExpanded, agentId])

  const fetchSentimentData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/agents/${agentId}/reviews/sentiment`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch sentiment analysis")
      }
      
      const data = await response.json()
      setSentimentData(data)
    } catch (error) {
      console.error("Error fetching sentiment analysis:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "good": return <ThumbsUp className="h-4 w-4 text-green-600" />
      case "bad": return <ThumbsDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "good": return "bg-green-100 text-green-800 border-green-200"
      case "bad": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSentimentPercentage = (sentiment: SentimentAnalysis) => {
    const total = sentiment.sentiment_summary.good + sentiment.sentiment_summary.bad + sentiment.sentiment_summary.neutral
    return {
      good: total > 0 ? (sentiment.sentiment_summary.good / total) * 100 : 0,
      bad: total > 0 ? (sentiment.sentiment_summary.bad / total) * 100 : 0,
      neutral: total > 0 ? (sentiment.sentiment_summary.neutral / total) * 100 : 0
    }
  }

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const isReviewExpanded = (reviewId: string) => expandedReviews.has(reviewId)

  const shouldShowExpandButton = (text: string) => {
    // Show expand button if text is longer than approximately 3 lines (roughly 150 characters)
    return text.length > 150
  }

  return (
    <div className="border-t border-red-100">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onToggle}
        className="w-full justify-between text-red-700 hover:bg-red-50 px-6 py-4 rounded-none"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-semibold">Review Sentiment Analysis</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isExpanded && (
        <div className="px-6 pb-6 bg-white space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
                <p className="text-lg font-medium text-gray-900">Loading sentiment analysis...</p>
                <p className="text-sm text-gray-600">Analyzing review sentiment and patterns</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <Button 
                  size="sm" 
                  onClick={fetchSentimentData}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : sentimentData ? (
            <>
              {/* Sentiment Overview */}
              <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sentiment Overview
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                    <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-700">
                      {sentimentData.sentiment_summary.good}
                    </div>
                    <div className="text-xs font-medium text-green-600">Positive</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                    <Minus className="h-5 w-5 text-gray-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-700">
                      {sentimentData.sentiment_summary.neutral}
                    </div>
                    <div className="text-xs font-medium text-gray-600">Neutral</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                    <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-red-700">
                      {sentimentData.sentiment_summary.bad}
                    </div>
                    <div className="text-xs font-medium text-red-600">Negative</div>
                  </div>
                </div>

                {/* Sentiment Distribution Bar */}
                {sentimentData.total_reviews > 0 && (
                  <div className="space-y-3 mt-4">
                    <div className="text-sm font-semibold text-red-900">
                      Sentiment Distribution ({sentimentData.total_reviews} reviews)
                    </div>
                    <div className="flex h-3 bg-red-100 rounded-full overflow-hidden border border-red-200">
                      {(() => {
                        const percentages = getSentimentPercentage(sentimentData)
                        return (
                          <>
                            {percentages.good > 0 && (
                              <div 
                                className="bg-green-500" 
                                style={{ width: `${percentages.good}%` }}
                                title={`${percentages.good.toFixed(1)}% Positive`}
                              />
                            )}
                            {percentages.neutral > 0 && (
                              <div 
                                className="bg-gray-400" 
                                style={{ width: `${percentages.neutral}%` }}
                                title={`${percentages.neutral.toFixed(1)}% Neutral`}
                              />
                            )}
                            {percentages.bad > 0 && (
                              <div 
                                className="bg-red-500" 
                                style={{ width: `${percentages.bad}%` }}
                                title={`${percentages.bad.toFixed(1)}% Negative`}
                              />
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              {sentimentData.classified_reviews.length > 0 && (
                <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                  <h4 className="font-semibold text-red-900 mb-4">Recent Reviews</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sentimentData.classified_reviews.slice(0, 5).map((review) => (
                      <div key={review.review_id} className="bg-white border border-red-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.review_rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge className={`${getSentimentColor(review.sentiment)} text-xs border-0`}>
                              {getSentimentIcon(review.sentiment)}
                              <span className="ml-1 capitalize font-medium">{review.sentiment}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                              <User className="h-3 w-3 mr-1" />
                              {review.reviewer_role}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                            <Calendar className="h-3 w-3" />
                            {formatDate(review.review_date)}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="relative">
                            <p className={`text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-200 transition-all duration-300 ${
                              !isReviewExpanded(review.review_id) && shouldShowExpandButton(review.review_text) 
                                ? 'overflow-hidden' 
                                : ''
                            }`} style={
                              !isReviewExpanded(review.review_id) && shouldShowExpandButton(review.review_text)
                                ? {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical'
                                  }
                                : {}
                            }>
                              "{review.review_text}"
                            </p>
                            
                            {/* Gradient fade effect for truncated text */}
                            {!isReviewExpanded(review.review_id) && shouldShowExpandButton(review.review_text) && (
                              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                            )}
                          </div>
                          
                          {shouldShowExpandButton(review.review_text) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReviewExpansion(review.review_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto text-xs mt-2 transition-all duration-200"
                            >
                              {isReviewExpanded(review.review_id) ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Read More
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-600">Sentiment Confidence:</span>
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              {Math.round(review.sentiment_score * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {sentimentData.classified_reviews.length > 5 && (
                    <div className="text-center mt-4 pt-4 border-t border-red-200">
                      <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-md border border-red-100">
                        Showing 5 of <span className="font-semibold text-red-700">{sentimentData.classified_reviews.length}</span> reviews
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}