"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Search,
  Loader2,
  Brain,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { PreferenceSliders } from "@/components/agent-finder/preference-sliders"
import { AdvancedFilters } from "@/components/agent-finder/advanced-filters"
import { AgentCard } from "@/components/agent-finder/agent-card"
import { AgentDetailModal } from "@/components/agent-finder/agent-detail-modal"

// Updated interfaces to match backend models
interface SubScorePreferences {
  responsiveness?: number
  negotiation?: number
  professionalism?: number
  market_expertise?: number
}

interface SkillPreferences {
  communication?: number
  local_knowledge?: number
  attention_to_detail?: number
  patience?: number
  honesty?: number
  problem_solving?: number
  dedication?: number
}

interface SearchFilters {
  user_type: "buyer" | "seller"
  state: string
  city: string
  min_price?: number
  max_price?: number
  property_type?: string
  is_urgent?: boolean
  language?: string
  additional_specializations?: string[]
  max_results?: number
}

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

interface SearchResponse {
  success: boolean
  message: string
  total_results: number
  recommendations: AgentRecommendation[]
  search_params: any
}

export default function AgentFinderPage() {
  const [subScorePreferences, setSubScorePreferences] = useState<SubScorePreferences>({
    responsiveness: 0.25,
    negotiation: 0.25,
    professionalism: 0.25,
    market_expertise: 0.25,
  })
  
  const [skillPreferences, setSkillPreferences] = useState<SkillPreferences>({})
  
  const [filters, setFilters] = useState<SearchFilters>({
    user_type: "buyer",
    state: "",
    city: "",
    language: "English",
    is_urgent: false,
    max_results: 20,
  })
  
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleSearch = async () => {
    // Validate required fields
    if (!filters.state || !filters.city) {
      setError("Please select both state and city to search for agents")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Build preferences object for backend
      const searchRequest = {
        user_type: filters.user_type,
        state: filters.state,
        city: filters.city,
        min_price: filters.min_price,
        max_price: filters.max_price,
        property_type: filters.property_type,
        is_urgent: filters.is_urgent || false,
        language: filters.language || "English",
        sub_score_preferences: subScorePreferences,
        skill_preferences: skillPreferences,
        additional_specializations: filters.additional_specializations || [],
        max_results: filters.max_results || 20,
      }

      console.log("Search request:", searchRequest)

      const response = await fetch("/api/agent-finder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get recommendations")
      }

      const data: SearchResponse = await response.json()
      setResults(data)
      
      if (data.total_results === 0) {
        setError("No agents found matching your criteria. Try adjusting your filters.")
      }
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setError(error instanceof Error ? error.message : "An error occurred while searching for agents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (agentId: number) => {
    setSelectedAgentId(agentId)
    setIsDetailModalOpen(true)
  }

  const handleContact = (agentId: number, type: "phone" | "website") => {
    const agent = results?.recommendations.find(a => a.advertiser_id === agentId)
    if (!agent) return

    if (type === "phone" && agent.phone_primary) {
      window.open(`tel:${agent.phone_primary}`)
    } else if (type === "website" && agent.agent_website) {
      window.open(agent.agent_website, "_blank")
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
      </div>

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
                Our system analyzes review sentiment, agent performance patterns, and skill vectors
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-semibold text-lg text-gray-900">Personalized Matches</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Get ranked recommendations with matching scores showing how well each agent fits your needs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <div className="grid xl:grid-cols-2 gap-8">
        <PreferenceSliders
          preferences={subScorePreferences}
          skillPreferences={skillPreferences}
          onPreferencesChange={setSubScorePreferences}
          onSkillPreferencesChange={setSkillPreferences}
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
          disabled={isLoading || !filters.state || !filters.city}
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

      {/* Results Summary */}
      {results && results.total_results > 0 && (
        <div className="text-center">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <p className="text-green-800 font-medium">
                <Sparkles className="inline h-5 w-5 mr-2" />
                Found {results.total_results} matching agents in {filters.city}, {filters.state}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-8">
          {/* Agent Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.recommendations.map((agent) => (
              <AgentCard
                key={agent.advertiser_id}
                agent={agent}
                onViewDetails={handleViewDetails}
                onContact={handleContact}
              />
            ))}
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
                  onClick={() => setFilters({
                    user_type: "buyer",
                    state: "",
                    city: "",
                    language: "English",
                    is_urgent: false,
                    max_results: 20,
                  })}
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