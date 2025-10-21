"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  TrendingUp, 
  Award, 
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Calendar,
  Building
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AgentSentiment } from "./agent-sentiment"

interface AgentMetrics {
  responsiveness: number
  negotiation: number
  professionalism: number
  market_expertise: number
  q_prior?: number
  wilson_lower_bound?: number
  recency_score?: number
}

interface AgentProfile {
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

interface AgentRecommendation {
  agent_id: number
  name: string
  rank: number
  utility_score: number
  availability_fit?: number
  confidence_score: number
  profile: AgentProfile
  metrics: AgentMetrics
}

interface ExplanationItem {
  agent_id: number
  agent_name: string
  rank: number
  preference_matches?: Array<{
    aspect: string
    match_quality: string
    agent_performance: string
  }>
  theme_strengths?: Array<{
    theme_name: string
    strength_score: number
    examples: string[]
  }>
  confidence_metrics?: {
    confidence_level: string
    review_count: number
    wilson_lower_bound: number
  }
  why_recommended: string
}

interface AgentCardProps {
  agent: AgentRecommendation
  explanation?: ExplanationItem
  onViewDetails?: (agentId: number) => void
  onContact?: (agentId: number, type: "phone" | "email") => void
}

export function AgentCard({ agent, explanation, onViewDetails, onContact }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSentimentExpanded, setIsSentimentExpanded] = useState(false)

  const formatPhone = (phone: string) => {
    if (!phone) return null
    // Basic phone formatting
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High Confidence"
    if (score >= 0.6) return "Medium Confidence" 
    return "Low Confidence"
  }

  const getMatchQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800"
      case "very good": return "bg-blue-100 text-blue-800"
      case "good": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSkillLevel = (value: number) => {
    if (value >= 0.8) return { level: "Expert", color: "bg-red-500", dots: 5 }
    if (value >= 0.6) return { level: "Strong", color: "bg-red-400", dots: 4 }
    if (value >= 0.4) return { level: "Good", color: "bg-red-300", dots: 3 }
    if (value >= 0.2) return { level: "Fair", color: "bg-red-200", dots: 2 }
    return { level: "Basic", color: "bg-gray-200", dots: 1 }
  }

  const skillsData = [
    { key: "responsiveness", label: "Response Time"},
    { key: "negotiation", label: "Negotiation"},
    { key: "professionalism", label: "Professional"},
    { key: "market_expertise", label: "Market Expert" }
  ]

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-red-100">
      <CardContent className="p-0">
        {/* Header with clean, compact design */}
        <div className="bg-white p-4 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-16 w-16 border-3 border-white shadow-md">
                  <AvatarFallback className="bg-red-600 text-white text-lg font-bold">
                    {agent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -left-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                  #{agent.rank}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{agent.name}</h3>
                </div>
                {agent.profile.office_name && (
                  <p className="text-red-700 text-sm font-medium mb-2 truncate">
                    {agent.profile.office_name}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{agent.profile.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">{Math.round(agent.profile.experience_years)} years</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">{agent.profile.city}, {agent.profile.state}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {Math.round(agent.utility_score * 100)}%
              </div>
              <p className="text-xs text-gray-600 font-medium">Match Score</p>
              <div className={`text-xs mt-1 px-2 py-1 rounded-full border ${getConfidenceColor(agent.confidence_score)} ${
                agent.confidence_score >= 0.8 ? 'bg-green-50 border-green-200' : 
                agent.confidence_score >= 0.6 ? 'bg-yellow-50 border-yellow-200' : 
                'bg-red-50 border-red-200'
              }`}>
                {getConfidenceLabel(agent.confidence_score)}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section with Creative Representation */}
        <div className="p-6 bg-white">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Skill Profile
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {skillsData.map(({ key, label }) => {
              const value = agent.metrics[key as keyof AgentMetrics] as number
              const skill = getSkillLevel(value)
              return (
                <div key={key} className="text-center group cursor-help">
                  <div className="text-xs font-medium text-gray-900 mb-2">{label}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full mx-0.5 transition-all duration-300 ${
                          i < skill.dots ? skill.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">{skill.level}</div>
                  <div className="text-xs font-bold text-red-600">{Math.round(value * 100)}%</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Specializations & Languages */}
        {(agent.profile.specializations || (agent.profile.languages && agent.profile.languages !== "English")) && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {agent.profile.languages && agent.profile.languages !== "English" && (
                <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                  🌐 {agent.profile.languages}
                </Badge>
              )}
              {agent.profile.specializations && 
                agent.profile.specializations.split(",").slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-red-50 text-red-700 border border-red-200">
                    {spec.trim()}
                  </Badge>
                ))
              }
            </div>
          </div>
        )}

        {/* Why Recommended */}
        {explanation && (
          <div className="mx-6 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Why We Recommend This Agent</p>
                <p className="text-sm text-red-800 leading-relaxed">{explanation.why_recommended}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Detailed Analysis */}
        {explanation && (explanation.preference_matches || explanation.theme_strengths) && (
          <div className="px-6 pb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-red-700 hover:bg-red-50"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Detailed Analysis
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isExpanded && (
              <div className="mt-4 space-y-4 text-sm bg-gray-50 p-4 rounded-lg">
                {explanation.preference_matches && explanation.preference_matches.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-3 text-gray-900">How They Match Your Preferences</h5>
                    <div className="space-y-2">
                      {explanation.preference_matches.map((match, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="font-medium text-gray-700">{match.aspect}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getMatchQualityColor(match.match_quality)}>
                              {match.match_quality}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {match.agent_performance}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {explanation.theme_strengths && explanation.theme_strengths.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-3 text-gray-900">Key Strengths from Reviews</h5>
                    <div className="space-y-3">
                      {explanation.theme_strengths.map((theme, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{theme.theme_name}</span>
                            <Badge variant="outline" className="text-red-700 border-red-200">
                              {Math.round(theme.strength_score * 100)}%
                            </Badge>
                          </div>
                          {theme.examples && theme.examples.length > 0 && (
                            <p className="text-xs text-gray-600 italic">
                              "{theme.examples[0]}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sentiment Analysis Section */}
        <AgentSentiment 
          agentId={agent.agent_id}
          agentName={agent.name}
          isExpanded={isSentimentExpanded}
          onToggle={() => setIsSentimentExpanded(!isSentimentExpanded)}
        />

        {/* Action Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {agent.profile.phone && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onContact?.(agent.agent_id, "phone")}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {formatPhone(agent.profile.phone)}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {agent.profile.website && (
                <Button variant="outline" size="sm" asChild className="border-red-200 text-red-700 hover:bg-red-50">
                  <a href={agent.profile.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onViewDetails?.(agent.agent_id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                View Full Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}