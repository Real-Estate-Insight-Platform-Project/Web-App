"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Award,
  ExternalLink,
  Loader2,
  User,
  BarChart3,
  MessageSquare,
  Globe,
  Clock
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AgentSentiment } from "./agent-sentiment"

interface AgentDetails {
  agent_id: number
  profile: {
    name: string
    state: string
    city: string
    rating: number
    review_count: number
    experience_years: number
    specializations: string
    languages: string
    agent_type: string
    office_name: string
    phone: string
    website: string
    bio: string
  }
  metrics: {
    responsiveness: number
    negotiation: number
    professionalism: number
    market_expertise: number
    q_prior: number
    confidence_score: number
  }
  reviews: {
    total_count: number
    recent_reviews: Array<{
      rating: number
      comment: string
      date: string
      transaction_type?: string
    }>
  }
}

interface AgentDetailModalProps {
  agentId: number | null
  isOpen: boolean
  onClose: () => void
}

export function AgentDetailModal({ agentId, isOpen, onClose }: AgentDetailModalProps) {
  const [agent, setAgent] = useState<AgentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (agentId && isOpen) {
      fetchAgentDetails(agentId)
    }
  }, [agentId, isOpen])

  const fetchAgentDetails = async (id: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/agent-finder/${id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch agent details")
      }
      
      const data = await response.json()
      setAgent(data)
    } catch (error) {
      console.error("Error fetching agent details:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getSkillLevel = (score: number) => {
    if (score >= 0.9) return { label: "Expert", color: "bg-red-600", bgColor: "bg-red-50", textColor: "text-red-800" }
    if (score >= 0.8) return { label: "Excellent", color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-800" }
    if (score >= 0.7) return { label: "Very Good", color: "bg-red-400", bgColor: "bg-yellow-50", textColor: "text-yellow-800" }
    if (score >= 0.6) return { label: "Good", color: "bg-red-300", bgColor: "bg-blue-50", textColor: "text-blue-800" }
    return { label: "Average", color: "bg-gray-400", bgColor: "bg-gray-50", textColor: "text-gray-800" }
  }

  const handleContact = (type: "phone" | "email" | "website") => {
    if (!agent) return

    switch (type) {
      case "phone":
        if (agent.profile.phone) {
          window.open(`tel:${agent.profile.phone}`)
        }
        break
      case "email":
        // Note: Email not available in current data structure
        break
      case "website":
        if (agent.profile.website) {
          window.open(agent.profile.website, "_blank")
        }
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-red-200 shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-600" />
              <p className="text-lg font-medium text-gray-900">Loading agent details...</p>
              <p className="text-sm text-gray-600">Please wait while we gather the information</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 mb-4 font-medium">{error}</p>
              <Button 
                onClick={() => agentId && fetchAgentDetails(agentId)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : agent ? (
          <>
            <DialogHeader className="space-y-6 bg-gradient-to-r from-red-50 to-red-100/50 p-6 -m-6 mb-6 border-b border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src="/placeholder.svg" alt={agent.profile.name} />
                      <AvatarFallback className="bg-red-600 text-white text-2xl font-bold">
                        {agent.profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      #1
                    </div>
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">{agent.profile.name}</DialogTitle>
                    <DialogDescription className="space-y-2">
                      {agent.profile.office_name && (
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                          <Building className="h-5 w-5" />
                          {agent.profile.office_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <MapPin className="h-5 w-5" />
                        {agent.profile.city}, {agent.profile.state}
                      </div>
                    </DialogDescription>
                  </div>
                </div>
                <div className="text-right bg-white rounded-lg p-4 shadow-md border border-red-200">
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900">{agent.profile.rating.toFixed(1)}</span>
                    <span className="text-gray-600">({agent.profile.review_count})</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{Math.round(agent.profile.experience_years)} years exp.</span>
                  </div>
                  <div className="mt-3 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                    Top Agent
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-red-50 border border-red-200 rounded-lg p-1">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md">
                  <User className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md">
                  <BarChart3 className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md">
                  <MessageSquare className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md">
                  <Phone className="h-4 w-4" />
                  Contact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                    <CardTitle className="text-red-900 font-bold">Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {agent.profile.bio && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{agent.profile.bio}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Award className="h-4 w-4 text-red-600" />
                          Agent Type
                        </h4>
                        <Badge className="bg-red-100 text-red-800 border border-red-200">
                          {agent.profile.agent_type || "Real Estate Agent"}
                        </Badge>
                      </div>
                      
                      {agent.profile.languages && agent.profile.languages !== "English" && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-red-600" />
                            Languages
                          </h4>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                              {agent.profile.languages}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {agent.profile.specializations && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Building className="h-4 w-4 text-red-600" />
                          Specializations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.profile.specializations.split(",").map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="border-red-200 text-red-700 bg-red-50">
                              {spec.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                    <CardTitle className="text-red-900 font-bold">Performance Metrics</CardTitle>
                    <CardDescription className="text-gray-600">
                      Overall confidence score based on review data and performance analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-6 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-gray-900">Overall Confidence Score</span>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-red-600">
                              {Math.round(agent.metrics.confidence_score * 100)}%
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Award className="h-5 w-5 text-red-600" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-white border border-red-200">
                                  <p>Based on review volume, consistency, and performance metrics</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <Progress 
                          value={agent.metrics.confidence_score * 100} 
                          className="h-4 bg-red-100"
                        />
                        <div className="mt-2 text-sm text-gray-600">
                          {agent.metrics.confidence_score >= 0.8 ? "Excellent reliability" : 
                           agent.metrics.confidence_score >= 0.6 ? "Good reliability" : "Average reliability"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6 mt-6">
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                    <CardTitle className="text-red-900 font-bold">Skill Assessment</CardTitle>
                    <CardDescription className="text-gray-600">
                      Based on machine learning analysis of reviews and performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    {Object.entries(agent.metrics).map(([key, value]) => {
                      if (["q_prior", "confidence_score"].includes(key)) return null
                      
                      const skillLevel = getSkillLevel(value)
                      return (
                        <div key={key} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${skillLevel.color}`}></div>
                              <span className="font-semibold text-gray-900 text-lg capitalize">
                                {key.replace("_", " ")}
                              </span>
                              <Badge className={`${skillLevel.bgColor} ${skillLevel.textColor} border-0`}>
                                {skillLevel.label}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-red-600">
                                {Math.round(value * 100)}%
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={value * 100} 
                            className="h-4 bg-gray-100"
                          />
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md">
                            {key === "responsiveness" && "How quickly the agent responds to calls, emails, and requests from clients"}
                            {key === "negotiation" && "Ability to negotiate deals and secure favorable terms for clients"}
                            {key === "professionalism" && "Professional conduct, reliability, and expertise in all interactions"}
                            {key === "market_expertise" && "Deep knowledge of local market trends, pricing, and neighborhood insights"}
                          </p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                    <CardTitle className="text-red-900 font-bold">Client Reviews</CardTitle>
                    <CardDescription className="text-gray-600">
                      Latest client feedback • {agent.reviews.total_count} total reviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {agent.reviews.recent_reviews.length > 0 ? (
                      <div className="space-y-6">
                        {agent.reviews.recent_reviews.map((review, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="font-semibold ml-2 text-gray-900">{review.rating}/5</span>
                                </div>
                                {review.transaction_type && (
                                  <Badge className="bg-red-100 text-red-800 border border-red-200">
                                    {review.transaction_type}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {review.date}
                              </div>
                            </div>
                            {review.comment && (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No recent reviews available</p>
                        <p className="text-sm text-gray-500 mt-2">Check back later for updated client feedback</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sentiment Analysis in Modal */}
                <Card className="border-red-200 shadow-sm">
                  <AgentSentiment 
                    agentId={agent.agent_id}
                    agentName={agent.profile.name}
                    isExpanded={true}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6 mt-6">
                <Card className="border-red-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                    <CardTitle className="text-red-900 font-bold">Contact Information</CardTitle>
                    <CardDescription className="text-gray-600">
                      Get in touch with {agent.profile.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {agent.profile.phone && (
                      <div className="flex items-center justify-between p-6 border border-red-200 rounded-lg bg-gradient-to-r from-red-50 to-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="bg-red-600 p-3 rounded-full">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Phone</p>
                            <p className="text-gray-700 font-medium">{formatPhone(agent.profile.phone)}</p>
                            <p className="text-sm text-gray-500">Available for immediate consultation</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleContact("phone")}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          Call Now
                        </Button>
                      </div>
                    )}

                    {agent.profile.website && (
                      <div className="flex items-center justify-between p-6 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-600 p-3 rounded-full">
                            <ExternalLink className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Professional Website</p>
                            <p className="text-gray-700">View full profile and current listings</p>
                            <p className="text-sm text-gray-500">See portfolio and client testimonials</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleContact("website")}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-3 text-lg font-medium"
                        >
                          Visit Website
                        </Button>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Professional Tip
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        When contacting <span className="font-semibold text-red-700">{agent.profile.name}</span>, mention that you found them through our AI-powered
                        agent finder. This helps agents understand how clients discover their services and ensures
                        you receive priority attention as a qualified lead.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Why Choose This Agent?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                          <Star className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="font-semibold text-red-900">{agent.profile.rating.toFixed(1)}/5 Rating</p>
                          <p className="text-sm text-gray-600">Top-rated performance</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="font-semibold text-blue-900">{Math.round(agent.profile.experience_years)} Years</p>
                          <p className="text-sm text-gray-600">Proven experience</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="font-semibold text-green-900">{agent.profile.review_count} Reviews</p>
                          <p className="text-sm text-gray-600">Client testimonials</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}