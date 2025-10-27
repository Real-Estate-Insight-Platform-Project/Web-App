"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Step1UserType } from "@/components/agent-finder/wizard/step1-user-type"
import { Step2LocationProperty } from "@/components/agent-finder/wizard/step2-location-property"
import { Step3Priorities } from "@/components/agent-finder/wizard/step3-priorities"
import { Step4AdditionalQualities } from "@/components/agent-finder/wizard/step4-additional-qualities"
import { Step5FinalPreferences } from "@/components/agent-finder/wizard/step5-final-preferences"
import { AgentCardEnhanced } from "@/components/agent-finder/agent-card-enhanced"

// Form data interface
interface FormData {
  // Step 1
  userType: "buyer" | "seller"
  
  // Step 2
  state: string
  city: string
  minPrice: number
  maxPrice: number
  propertyType: string
  
  // Step 3
  subScorePreferences: Record<string, number>
  
  // Step 4
  skillPreferences: Record<string, number>
  
  // Step 5
  language: string
  additionalSpecializations: string[]
  isUrgent: boolean
  maxResults: number
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResponse | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    userType: "buyer",
    state: "",
    city: "",
    minPrice: 0,
    maxPrice: 5000000,
    propertyType: "",
    subScorePreferences: {
      responsiveness: 0.25,
      negotiation: 0.25,
      professionalism: 0.25,
      market_expertise: 0.25,
    },
    skillPreferences: {
      communication: 0.25,
      local_knowledge: 0.25,
      attention_to_detail: 0.25,
      patience: 0.25,
      honesty: 0.25,
      problem_solving: 0.25,
    },
    language: "English",
    additionalSpecializations: [],
    isUrgent: false,
    maxResults: 20,
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.state || !formData.city) {
      setError("Please select both state and city to search for agents")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Build search request for backend API
      const searchRequest = {
        user_type: formData.userType,
        state: formData.state,
        city: formData.city,
        min_price: formData.minPrice,
        max_price: formData.maxPrice,
        property_type: formData.propertyType || undefined,
        is_urgent: formData.isUrgent,
        language: formData.language,
        sub_score_preferences: formData.subScorePreferences,
        skill_preferences: formData.skillPreferences,
        additional_specializations: formData.additionalSpecializations,
        max_results: formData.maxResults,
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
      } else {
        // Move to results view
        setCurrentStep(6)
      }
    } catch (error) {
      console.error("Error getting recommendations:", error)
      setError(error instanceof Error ? error.message : "An error occurred while searching for agents")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep(1)
    setResults(null)
    setError(null)
    setFormData({
      userType: "buyer",
      state: "",
      city: "",
      minPrice: 0,
      maxPrice: 5000000,
      propertyType: "",
      subScorePreferences: {
        responsiveness: 0.25,
        negotiation: 0.25,
        professionalism: 0.25,
        market_expertise: 0.25,
      },
      skillPreferences: {
        communication: 0.25,
        local_knowledge: 0.25,
        attention_to_detail: 0.25,
        patience: 0.25,
        honesty: 0.25,
        problem_solving: 0.25,
      },
      language: "English",
      additionalSpecializations: [],
      isUrgent: false,
      maxResults: 20,
    })
  }

  // Render results view
  if (currentStep === 6 && results) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleStartOver}
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Start New Search
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 justify-center">
              <Sparkles className="h-8 w-8 text-red-600" />
              Your Perfect Agents
            </h1>
            <p className="text-gray-600 mt-1">
              Found {results.total_results} agent{results.total_results !== 1 ? 's' : ''} matching your criteria
            </p>
          </div>
          
          <div className="w-[160px]"></div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.recommendations.map((agent) => (
            <AgentCardEnhanced
              key={agent.advertiser_id}
              agent={agent}
            />
          ))}
        </div>

        {/* No Results Message */}
        {results.total_results === 0 && (
          <Card className="border-gray-200">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Agents Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any agents matching your criteria. Try adjusting your filters.
              </p>
              <Button onClick={handleStartOver}>
                Adjust Search Criteria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Render wizard view
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 justify-center">
          <Brain className="h-10 w-10 text-red-600" />
          Find Your Perfect Real Estate Agent
        </h1>
        <p className="text-lg text-gray-600">
          Connect with top-rated real estate professionals who specialize in your area and property type.
        </p>
        <p className="text-sm text-gray-500">
          Our matching system finds agents with proven track records in your market.
        </p>
      </div>

      {/* Why Work with a Real Estate Agent - Only on first step */}
      {currentStep === 1 && (
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6 pb-8">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">
              Why Work with a Real Estate Agent?
            </h3>
            <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional agents provide invaluable expertise and support throughout your real estate journey
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Market Expertise</h4>
                  <p className="text-sm text-gray-600">
                    Local market knowledge, pricing strategies, and neighborhood insights
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Legal Protection</h4>
                  <p className="text-sm text-gray-600">
                    Navigate complex contracts and legal requirements safely
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Negotiation Skills</h4>
                  <p className="text-sm text-gray-600">
                    Professional negotiation to get you the best deal possible
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Time Savings</h4>
                  <p className="text-sm text-gray-600">
                    Handle paperwork, scheduling, and coordination for you
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Network Access</h4>
                  <p className="text-sm text-gray-600">
                    Connections with lenders, inspectors, contractors, and other professionals
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 rounded-full border-2 border-red-600 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-red-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Market Access</h4>
                  <p className="text-sm text-gray-600">
                    Access to MLS listings and off-market opportunities
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      {currentStep !== 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Step {currentStep} of {totalSteps}</span>
                <span className="text-red-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>User Type</span>
                <span>Location</span>
                <span>Priorities</span>
                <span>Qualities</span>
                <span>Preferences</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Wizard Steps */}
      {currentStep === 1 && (
        <>
          <Step1UserType
            userType={formData.userType}
            onUserTypeChange={(type) =>
              setFormData({ ...formData, userType: type })
            }
            onNext={handleNext}
          />
          
          {/* How It Works - Only on first step, at bottom */}
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-center text-red-800 mb-6">
                How Our AI Agent Finder Works
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-red-600 shadow-sm">
                    <span className="text-2xl font-bold text-red-600">1</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Set Your Preferences</h4>
                  <p className="text-sm text-gray-600">
                    Tell us what matters most in your ideal agent
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-red-600 shadow-sm">
                    <Brain className="h-7 w-7 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Our system analyzes thousands of reviews and agent data
                  </p>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-red-600 shadow-sm">
                    <CheckCircle className="h-7 w-7 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Perfect Matches</h4>
                  <p className="text-sm text-gray-600">
                    Get ranked recommendations tailored to your needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {currentStep === 2 && (
        <Step2LocationProperty
          state={formData.state}
          city={formData.city}
          minPrice={formData.minPrice}
          maxPrice={formData.maxPrice}
          propertyType={formData.propertyType}
          onStateChange={(state) => {
            setFormData({ ...formData, state, city: "" })
          }}
          onCityChange={(city) => {
            setFormData({ ...formData, city })
          }}
          onPriceRangeChange={(min, max) =>
            setFormData({ ...formData, minPrice: min, maxPrice: max })
          }
          onPropertyTypeChange={(type: string) =>
            setFormData({ ...formData, propertyType: type })
          }
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {currentStep === 3 && (
        <Step3Priorities
          subScorePreferences={formData.subScorePreferences}
          onSubScoreChange={(key: string, value: number) =>
            setFormData({
              ...formData,
              subScorePreferences: { ...formData.subScorePreferences, [key]: value }
            })
          }
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {currentStep === 4 && (
        <Step4AdditionalQualities
          skillPreferences={formData.skillPreferences}
          onSkillChange={(key: string, value: number) =>
            setFormData({
              ...formData,
              skillPreferences: { ...formData.skillPreferences, [key]: value }
            })
          }
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {currentStep === 5 && (
        <Step5FinalPreferences
          language={formData.language}
          additionalSpecializations={formData.additionalSpecializations}
          isUrgent={formData.isUrgent}
          maxResults={formData.maxResults}
          onLanguageChange={(language) =>
            setFormData({ ...formData, language })
          }
          onSpecializationsChange={(specializations: string[]) =>
            setFormData({ ...formData, additionalSpecializations: specializations })
          }
          onUrgentChange={(isUrgent) =>
            setFormData({ ...formData, isUrgent })
          }
          onMaxResultsChange={(maxResults) =>
            setFormData({ ...formData, maxResults })
          }
          onBack={handleBack}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
