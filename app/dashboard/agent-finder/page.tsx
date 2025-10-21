"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Search,
  Loader2,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { PreferenceSliders } from "@/components/agent-finder/preference-sliders"
import { AdvancedFilters } from "@/components/agent-finder/advanced-filters"
import { AgentCard } from "@/components/agent-finder/agent-card"
import { AgentDetailModal } from "@/components/agent-finder/agent-detail-modal"

interface UserPreferences {
  responsiveness: number
  negotiation: number
  professionalism: number
  market_expertise: number
}

interface UserFilters {
  state?: string
  city?: string
  transaction_type?: "buying" | "selling"
  price_min?: number
  price_max?: number
  language?: string
  specialization?: string
  min_rating?: number
  min_reviews?: number
  require_recent_activity?: boolean
  active_only?: boolean
}

interface AgentRecommendation {
  agent_id: number
  name: string
  rank: number
  utility_score: number
  availability_fit?: number
  confidence_score: number
  profile: {
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
    q_prior?: number
    wilson_lower_bound?: number
    recency_score?: number
  }
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

interface RecommendationResponse {
  recommendations: AgentRecommendation[]
  explanations: ExplanationItem[]
  metadata: any
  summary: {
    total_candidates: number
    after_filtering: number
    recommended: number
    preference_personalization: string
  }
}

export default function AgentFinderPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    responsiveness: 0.5,
    negotiation: 0.5,
    professionalism: 0.5,
    market_expertise: 0.5,
  })
  
  const [filters, setFilters] = useState<UserFilters>({
    active_only: true,
    language: "English",
  })
  
  const [results, setResults] = useState<RecommendationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Check system health on load
  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch("/api/agent-finder/train")
      if (response.ok) {
        const health = await response.json()
        setSystemHealth(health)
      }
    } catch (error) {
      console.error("Failed to check system health:", error)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/agent-finder/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          filters,
          top_k: 10,
          include_explanations: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.needs_training) {
          setError("The Agent Finder system needs to be trained first. Please initialize the system.")
          return
        }
        
        throw new Error(errorData.error || "Failed to get recommendations")
      }

      const data: RecommendationResponse = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrainSystem = async () => {
    setIsTraining(true)
    setError(null)
    
    try {
      const response = await fetch("/api/agent-finder/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          use_cache: true,
          save_cache: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to train system")
      }

      const data = await response.json()
      console.log("Training completed:", data)
      await checkSystemHealth()
      
      // Auto-search after training if we have some preferences set
      const hasPreferences = Object.values(preferences).some(p => p !== 0.5)
      if (hasPreferences || filters.state) {
        await handleSearch()
      }
    } catch (error) {
      console.error("Error training system:", error)
      setError(error instanceof Error ? error.message : "Training failed")
    } finally {
      setIsTraining(false)
    }
  }

  const handleViewDetails = (agentId: number) => {
    setSelectedAgentId(agentId)
    setIsDetailModalOpen(true)
  }

  const handleContact = (agentId: number, type: "phone" | "email") => {
    const agent = results?.recommendations.find(a => a.agent_id === agentId)
    if (!agent) return

    if (type === "phone" && agent.profile.phone) {
      window.open(`tel:${agent.profile.phone}`)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              AI-Powered Agent Finder
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Find your perfect real estate agent using advanced machine learning
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
        </div>
      </div>

      {/* System Status & Training */}
      {systemHealth && !systemHealth.system_trained && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between text-red-800">
            <span>
              The AI agent recommendation system needs to be initialized before making recommendations.
            </span>
            <Button
              onClick={handleTrainSystem}
              disabled={isTraining}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isTraining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Initialize System
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* How It Works */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-red-800">
            How Our AI Agent Finder Works
          </CardTitle>
          <CardDescription className="text-red-600">
            Advanced machine learning system that learns from thousands of reviews and agent data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900">Set Your Preferences</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tell us what matters most: responsiveness, negotiation skills, professionalism, or market expertise
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <Brain className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900">AI Analysis</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our ML system analyzes review sentiment, agent performance patterns, and skill vectors
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900">Personalized Matches</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get ranked recommendations with explanations of why each agent is a good fit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <div className="grid xl:grid-cols-2 gap-8">
        <PreferenceSliders
          preferences={preferences}
          onChange={setPreferences}
        />
        
        <AdvancedFilters
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Search Button */}
      <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isLoading || isTraining || (systemHealth && !systemHealth.system_trained)}
              size="lg"
              className="text-lg px-12 py-4 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Finding Your Perfect Agents...
                </>
              ) : (
                <>
                  <Search className="h-6 w-6 mr-3" />
                  Find My Ideal Agents
                </>
              )}
            </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-8">

          {/* Agent Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.recommendations.map((agent, index) => {
              const explanation = results.explanations.find(e => e.agent_id === agent.agent_id)
              return (
                <AgentCard
                  key={agent.agent_id}
                  agent={agent}
                  explanation={explanation}
                  onViewDetails={handleViewDetails}
                  onContact={handleContact}
                />
              )
            })}
          </div>

          {results.recommendations.length === 0 && (
            <Card className="border-red-200">
              <CardContent className="text-center py-16">
                <div className="p-4 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">No agents found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or preferences to find more matches. Our system works best with some flexibility.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ active_only: true, language: "English" })}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Reset All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agentId={selectedAgentId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  )
}
