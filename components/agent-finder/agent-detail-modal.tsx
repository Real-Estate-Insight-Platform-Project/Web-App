"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Star,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Building,
  Calendar,
  TrendingUp,
  Home,
  Briefcase,
  Award,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle
} from "lucide-react"

interface AgentDetailModalProps {
  agentId: number | null
  isOpen: boolean
  onClose: () => void
}

export function AgentDetailModal({ agentId, isOpen, onClose }: AgentDetailModalProps) {
  const [agent, setAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && agentId) {
      fetchAgentDetails()
    }
  }, [isOpen, agentId])

  const fetchAgentDetails = async () => {
    if (!agentId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/agent-finder/${agentId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch agent details")
      }

      const data = await response.json()
      setAgent(data.agent)
    } catch (error) {
      console.error("Error fetching agent details:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getSkillLevel = (value: number | null) => {
    if (value === null) return { level: "N/A", color: "bg-gray-200", percentage: 0 }
    const percentage = value * 100
    if (percentage >= 80) return { level: "Expert", color: "bg-red-500", percentage }
    if (percentage >= 60) return { level: "Strong", color: "bg-red-400", percentage }
    if (percentage >= 40) return { level: "Good", color: "bg-red-300", percentage }
    if (percentage >= 20) return { level: "Fair", color: "bg-red-200", percentage }
    return { level: "Basic", color: "bg-gray-200", percentage }
  }

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatSpecialization = (spec: string) => {
    return spec.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchAgentDetails} variant="outline">
              Try Again
            </Button>
          </div>
        ) : agent ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Agent Details</DialogTitle>
              <DialogDescription>
                Complete profile and performance information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header Section */}
              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 border-2 border-red-200">
                      {agent.has_photo && agent.agent_photo_url ? (
                        <AvatarImage src={agent.agent_photo_url} alt={agent.full_name} />
                      ) : null}
                      <AvatarFallback className="bg-red-100 text-red-700 text-2xl font-semibold">
                        {agent.full_name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{agent.full_name}</h3>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{agent.agent_base_city}, {agent.state}</span>
                            {agent.agent_base_zipcode && (
                              <span className="text-sm">({agent.agent_base_zipcode})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">{agent.agent_rating?.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({agent.review_count} reviews)</span>
                        </div>
                      </div>

                      {agent.office_name && (
                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                          <Building className="h-4 w-4" />
                          <span>{agent.office_name}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                          {agent.buyer_seller_fit === "both" ? "Buyer & Seller" : agent.buyer_seller_fit?.charAt(0).toUpperCase() + agent.buyer_seller_fit?.slice(1)}
                        </Badge>
                        {agent.experience_years && (
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {agent.experience_years?.toFixed(0)} years
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-green-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    {agent.phone_primary && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4" />
                          <span>Primary: {formatPhone(agent.phone_primary)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${agent.phone_primary}`)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    )}
                    {agent.office_phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4" />
                        <span>Office: {formatPhone(agent.office_phone)}</span>
                      </div>
                    )}
                    {agent.agent_website && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700">
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm truncate">{agent.agent_website}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(agent.agent_website, "_blank")}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          Visit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-orange-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{agent.recently_sold_count}</div>
                      <div className="text-xs text-gray-600">Recent Sales (12mo)</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Home className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{agent.active_listings_count}</div>
                      <div className="text-xs text-gray-600">Active Listings</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <ThumbsUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{agent.positive_review_count}</div>
                      <div className="text-xs text-gray-600">Positive Reviews</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <ThumbsDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{agent.negative_review_count}</div>
                      <div className="text-xs text-gray-600">Negative Reviews</div>
                    </div>
                  </div>
                  {agent.days_since_last_sale !== null && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Last sale: {agent.days_since_last_sale === 0 ? "Today" : `${agent.days_since_last_sale} days ago`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Ratings */}
              <Card className="border-purple-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Skills & Ratings</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Responsiveness", value: agent.avg_responsiveness },
                      { label: "Negotiation", value: agent.avg_negotiation },
                      { label: "Professionalism", value: agent.avg_professionalism },
                      { label: "Market Expertise", value: agent.avg_market_expertise },
                    ].map((skill) => {
                      const skillInfo = getSkillLevel(skill.value)
                      return (
                        <div key={skill.label} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                            <span className="text-sm text-gray-600">{skillInfo.level}</span>
                          </div>
                          <Progress value={skillInfo.percentage} className="h-3" />
                          <div className="text-xs text-right text-gray-500">
                            {skillInfo.percentage > 0 ? `${skillInfo.percentage.toFixed(0)}%` : "Not rated"}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              {(agent.property_types?.length > 0 || agent.additional_specializations?.length > 0) && (
                <Card className="border-indigo-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Specializations</h4>
                    <div className="space-y-3">
                      {agent.property_types?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Property Types:</p>
                          <div className="flex flex-wrap gap-2">
                            {agent.property_types.map((type: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                {formatPropertyType(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {agent.additional_specializations?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Additional:</p>
                          <div className="flex flex-wrap gap-2">
                            {agent.additional_specializations.map((spec: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                                {formatSpecialization(spec)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}