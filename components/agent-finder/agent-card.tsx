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
  MapPin, 
  TrendingUp, 
  Award, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Calendar,
  Building,
  ThumbsUp,
  ThumbsDown,
  Home,
  Target,
  Briefcase
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AgentRecommendation {
  advertiser_id: number
  full_name: string
  state: string
  agent_base_city: string
  agent_base_zipcode: string | null
  phone_primary: string | null
  office_phone: string | null
  agent_website: string | null
  office_name: string | null
  has_photo: boolean
  agent_photo_url: string | null
  experience_years: number | null
  matching_score: number
  proximity_score: number
  distance_km: number | null
  review_count: number
  agent_rating: number
  positive_review_count: number
  negative_review_count: number
  recently_sold_count: number
  active_listings_count: number
  days_since_last_sale: number | null
  property_types: string[]
  additional_specializations: string[]
  avg_responsiveness: number | null
  avg_negotiation: number | null
  avg_professionalism: number | null
  avg_market_expertise: number | null
  buyer_seller_fit: string
}

interface AgentCardProps {
  agent: AgentRecommendation
  onViewDetails?: (agentId: number) => void
  onContact?: (agentId: number, type: "phone" | "website") => void
}

export function AgentCard({ agent, onViewDetails, onContact }: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatPhone = (phone: string | null) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getMatchingScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-blue-600 bg-blue-50"
    if (score >= 40) return "text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  const getMatchingScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Possible Match"
  }

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatSpecialization = (spec: string) => {
    return spec.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

  const skillsData = [
    { key: "responsiveness", label: "Response Time", value: agent.avg_responsiveness },
    { key: "negotiation", label: "Negotiation", value: agent.avg_negotiation },
    { key: "professionalism", label: "Professional", value: agent.avg_professionalism },
    { key: "market_expertise", label: "Market Expert", value: agent.avg_market_expertise }
  ]

  const initials = agent.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-red-100">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-white p-4 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-red-200">
                  {agent.has_photo && agent.agent_photo_url ? (
                    <AvatarImage src={agent.agent_photo_url} alt={agent.full_name} />
                  ) : null}
                  <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {agent.experience_years && agent.experience_years > 10 && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{agent.full_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{agent.agent_base_city}, {agent.state}</span>
                  {agent.distance_km !== null && (
                    <span className="text-xs text-gray-500">
                      ({agent.distance_km.toFixed(1)} km away)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchingScoreColor(agent.matching_score)}`}>
                {agent.matching_score.toFixed(0)}% Match
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getMatchingScoreLabel(agent.matching_score)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-red-50 px-4 py-3 grid grid-cols-4 gap-2 text-center border-b border-red-100">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">{agent.agent_rating.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-gray-600">{agent.review_count} reviews</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    {agent.positive_review_count} positive
                  </div>
                  <div className="flex items-center gap-2 text-red-600 mt-1">
                    <ThumbsDown className="h-4 w-4" />
                    {agent.negative_review_count} negative
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">{agent.recently_sold_count}</span>
                  </div>
                  <div className="text-xs text-gray-600">Recent Sales</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Properties sold in last 12 months</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-center gap-1">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span className="text-lg font-bold text-gray-900">{agent.active_listings_count}</span>
                  </div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Current active listings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-center gap-1">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <span className="text-lg font-bold text-gray-900">{agent.experience_years?.toFixed(0) || "N/A"}</span>
                  </div>
                  <div className="text-xs text-gray-600">Years Exp.</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Years of experience</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Specializations & Type */}
        <div className="px-4 py-3 space-y-2 bg-white">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              {agent.buyer_seller_fit === "both" ? "Buyer & Seller" : agent.buyer_seller_fit.charAt(0).toUpperCase() + agent.buyer_seller_fit.slice(1)}
            </Badge>
            
            {agent.property_types.slice(0, 3).map((type, idx) => (
              <Badge key={idx} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                {formatPropertyType(type)}
              </Badge>
            ))}
            
            {agent.property_types.length > 3 && (
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                +{agent.property_types.length - 3} more
              </Badge>
            )}
          </div>
          
          {agent.additional_specializations.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {agent.additional_specializations.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 text-xs">
                  {formatSpecialization(spec)}
                </Badge>
              ))}
              {agent.additional_specializations.length > 3 && (
                <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600 text-xs">
                  +{agent.additional_specializations.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            {skillsData.map((skill) => {
              const skillInfo = getSkillLevel(skill.value)
              return (
                <div key={skill.key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">{skill.label}</span>
                    <span className="text-xs text-gray-600">{skillInfo.level}</span>
                  </div>
                  <Progress value={skillInfo.percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 space-y-3">
            {agent.office_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{agent.office_name}</span>
              </div>
            )}
            
            {agent.days_since_last_sale !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  Last sale: {agent.days_since_last_sale === 0 ? "Today" : `${agent.days_since_last_sale} days ago`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Proximity Score: {(agent.proximity_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                More
              </>
            )}
          </Button>

          {agent.phone_primary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact?.(agent.advertiser_id, "phone")}
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          )}

          {agent.agent_website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact?.(agent.advertiser_id, "website")}
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Website
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => onViewDetails?.(agent.advertiser_id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}