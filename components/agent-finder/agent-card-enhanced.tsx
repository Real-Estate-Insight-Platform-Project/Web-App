"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  Phone,
  MapPin,
  TrendingUp,
  Award,
  ExternalLink,
  MessageSquare,
  Home,
  Briefcase,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react"

interface AgentRecommendation {
  advertiser_id: number
  full_name: string
  state: string
  agent_base_city: string
  phone_primary: string | null
  agent_website: string | null
  office_name: string | null
  has_photo: boolean
  agent_photo_url: string | null
  experience_years: number | null
  matching_score: number
  distance_km: number | null
  review_count: number
  agent_rating: number
  positive_review_count: number
  negative_review_count: number
  recently_sold_count: number
  active_listings_count: number
  property_types: string[]
  additional_specializations: string[]
  avg_responsiveness: number | null
  avg_negotiation: number | null
  avg_professionalism: number | null
  avg_market_expertise: number | null
  buyer_seller_fit: string
}

interface Review {
  review_id: string
  review_rating: number
  review_comment: string | null
  review_created_date: string | null
  reviewer_role: string | null
  reviewer_location: string | null
  sentiment: string | null
  sentiment_confidence: number | null
}

interface AgentReviewsResponse {
  success: boolean
  review_counts: {
    total_review_count: number
    positive_review_count: number
    negative_review_count: number
    neutral_review_count: number
  }
  recent_reviews: Review[]
}

interface AgentCardEnhancedProps {
  agent: AgentRecommendation
  onContact?: (agentId: number, type: "phone" | "website") => void
}

export function AgentCardEnhanced({ agent, onContact }: AgentCardEnhancedProps) {
  const [reviews, setReviews] = useState<AgentReviewsResponse | null>(null)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/agent-finder/reviews/${agent.advertiser_id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const getSkillLevel = (value: number | null) => {
    if (value === null) return { level: "N/A", percentage: 0 }
    const percentage = value * 100
    if (percentage >= 80) return { level: "Expert", percentage }
    if (percentage >= 60) return { level: "Strong", percentage }
    if (percentage >= 40) return { level: "Good", percentage }
    return { level: "Fair", percentage }
  }

  const skillsData = [
    { label: "Response Time", value: agent.avg_responsiveness },
    { label: "Negotiation", value: agent.avg_negotiation },
    { label: "Professional", value: agent.avg_professionalism },
    { label: "Market Expert", value: agent.avg_market_expertise },
  ]

  const initials = agent.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <Badge className="bg-green-50 text-green-700 border border-green-200">Positive</Badge>
      case "negative":
        return <Badge className="bg-red-50 text-red-700 border border-red-200">Negative</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border border-gray-200">Neutral</Badge>
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Agent Details */}
          <div className="p-6 space-y-6">
            {/* Header with Avatar & Match Score */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-red-600">
                  {agent.has_photo && agent.agent_photo_url ? (
                    <AvatarImage src={agent.agent_photo_url} alt={agent.full_name} />
                  ) : null}
                  <AvatarFallback className="bg-red-50 text-red-600 text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {agent.full_name}
                    {agent.experience_years && agent.experience_years > 10 && (
                      <Award className="h-5 w-5 text-red-600" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {agent.agent_base_city}, {agent.state}
                    </span>
                    {agent.distance_km !== null && (
                      <span className="text-xs text-gray-500">
                        ({agent.distance_km.toFixed(1)} km away)
                      </span>
                    )}
                  </div>
                  {agent.office_name && (
                    <div className="text-sm text-gray-500 mt-1">{agent.office_name}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">{agent.matching_score.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Match</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Star className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{agent.agent_rating.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <MessageSquare className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{agent.review_count}</div>
                <div className="text-xs text-gray-600">Reviews</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <TrendingUp className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{agent.recently_sold_count}</div>
                <div className="text-xs text-gray-600">Sold</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Briefcase className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">
                  {agent.experience_years?.toFixed(0) || "N/A"}
                </div>
                <div className="text-xs text-gray-600">Years</div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                <Target className="h-4 w-4 text-red-600" />
                <span>Agent Skills</span>
              </div>
              <div className="space-y-2">
                {skillsData.map((skill, idx) => {
                  const skillInfo = getSkillLevel(skill.value)
                  return (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                      <span className="text-sm font-semibold text-red-600">{skillInfo.level}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-50 text-red-700 border border-red-200">
                {agent.buyer_seller_fit === "both"
                  ? "Buyer & Seller"
                  : agent.buyer_seller_fit.charAt(0).toUpperCase() + agent.buyer_seller_fit.slice(1)}
              </Badge>
              {agent.property_types.slice(0, 2).map((type, idx) => (
                <Badge key={idx} variant="outline" className="border-gray-300 text-gray-700">
                  {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {agent.phone_primary && (
                <Button
                  onClick={() => onContact?.(agent.advertiser_id, "phone")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Agent
                </Button>
              )}
              {agent.agent_website && (
                <Button
                  onClick={() => onContact?.(agent.advertiser_id, "website")}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT: Reviews & Analytics */}
          <div className="p-6 bg-gray-50 border-l border-gray-200 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-600" />
                Reviews & Analytics
              </h4>

              {isLoadingReviews ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : reviews ? (
                <div className="space-y-4">
                  {/* Review Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                      <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {reviews.review_counts.positive_review_count}
                      </div>
                      <div className="text-xs text-gray-600">Positive</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                      <Minus className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {reviews.review_counts.neutral_review_count}
                      </div>
                      <div className="text-xs text-gray-600">Neutral</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                      <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {reviews.review_counts.negative_review_count}
                      </div>
                      <div className="text-xs text-gray-600">Negative</div>
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {reviews.recent_reviews && reviews.recent_reviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Recent Reviews</div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {reviews.recent_reviews.slice(0, 5).map((review) => (
                          <div
                            key={review.review_id}
                            className="bg-white p-4 rounded-lg border border-gray-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.review_rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.sentiment && getSentimentBadge(review.sentiment)}
                              </div>
                              {review.review_created_date && (
                                <span className="text-xs text-gray-500">
                                  {new Date(review.review_created_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {review.review_comment && (
                              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                                {review.review_comment}
                              </p>
                            )}
                            {review.reviewer_role && (
                              <div className="text-xs text-gray-500">
                                {review.reviewer_role}
                                {review.reviewer_location && ` • ${review.reviewer_location}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No reviews available
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
