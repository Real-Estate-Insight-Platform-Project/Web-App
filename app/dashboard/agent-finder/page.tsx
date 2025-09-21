"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  ExternalLink,
  Home,
  Building,
  Building2,
  TreePine,
  Warehouse,
} from "lucide-react"

interface Agent {
  rank: number
  agent_id: number
  name: string
  brokerage: string | null
  star_rating: number
  num_reviews: number
  past_year_deals: number
  avg_transaction_value: number
  service_regions: string[]
  comprehensive_areas: string[]
  business_market: string | null
  office_state: string | null
  property_types: string[]
  phone: string | null
  email: string | null
  profile_url: string | null
  is_premier: boolean
  is_active: boolean
  total_score: number
  breakdown: {
    performance: number
    market_expertise: number
    client_satisfaction: number
    professional_standing: number
    availability: number
  }
}

interface SearchCriteria {
  transaction_type: "buying" | "selling" | null
  locations: string[]
  property_types: string[]
  price_range: { min: number; max: number; label: string } | null
}

const PROPERTY_TYPES = [
  { value: "Single Family Residential", label: "Single-Family", icon: Home },
  { value: "Condo/Co-op", label: "Condo", icon: Building },
  { value: "Townhouse", label: "Townhouse", icon: Building2 },
  { value: "Vacant Land", label: "Vacant Lot / Land", icon: TreePine },
  { value: "Multi-Family (2-4 Unit)", label: "Multi-Family", icon: Warehouse },
  { value: "Other", label: "Other", icon: Building },
]

const PRICE_RANGES = [
  { label: "Under $200K", min: 0, max: 200000 },
  { label: "$200K - $400K", min: 200000, max: 400000 },
  { label: "$400K - $600K", min: 400000, max: 600000 },
  { label: "$600K - $800K", min: 600000, max: 800000 },
  { label: "$800K - $1M", min: 800000, max: 1000000 },
  { label: "$1M - $2M", min: 1000000, max: 2000000 },
  { label: "$2M - $5M", min: 2000000, max: 5000000 },
  { label: "Above $5M", min: 5000000, max: 50000000 },
]

const MAJOR_MARKETS = [
  "New York City, New York",
  "Los Angeles, California",
  "Chicago, Illinois",
  "Dallas, Texas",
  "Houston, Texas",
  "Washington, D.C.",
  "Miami, Florida",
  "Philadelphia, Pennsylvania",
  "Atlanta, Georgia",
  "Phoenix, Arizona",
  "Boston, Massachusetts",
  "San Francisco, California",
  "Detroit, Michigan",
  "Seattle, Washington",
  "Minneapolis, Minnesota",
  "San Diego, California",
  "Tampa, Florida",
  "Denver, Colorado",
  "St. Louis, Missouri",
  "Baltimore, Maryland",
  "Charlotte, North Carolina",
  "Portland, Oregon",
  "San Antonio, Texas",
  "Orlando, Florida",
  "Cincinnati, Ohio",
  "Cleveland, Ohio",
  "Kansas City, Missouri",
  "Las Vegas, Nevada",
  "Columbus, Ohio",
  "Indianapolis, Indiana",
  "Nashville, Tennessee",
  "Virginia Beach, Virginia",
  "Providence, Rhode Island",
  "Milwaukee, Wisconsin",
  "Jacksonville, Florida",
  "Memphis, Tennessee",
  "Oklahoma City, Oklahoma",
  "Louisville, Kentucky",
  "Hartford, Connecticut",
  "Richmond, Virginia",
  "New Orleans, Louisiana",
  "Buffalo, New York",
  "Raleigh, North Carolina",
  "Birmingham, Alabama",
  "Salt Lake City, Utah",
  "Austin, Texas",
  "Fort Worth, Texas",
  "Sacramento, California",
]

export default function AgentFinderPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    transaction_type: null,
    locations: [],
    property_types: [],
    price_range: null,
  })
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const steps = ["Transaction Type", "Location", "Property Type", "Price Range", "Results"]

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/agent-finder/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: searchCriteria.locations,
          property_types: searchCriteria.property_types,
          price_min: searchCriteria.price_range?.min,
          price_max: searchCriteria.price_range?.max,
          top_k: 10,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.results || [])
      }
    } catch (error) {
      console.error("Error searching for agents:", error)
    } finally {
      setIsLoading(false)
      setShowResults(true)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        handleSearch()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowResults(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return searchCriteria.transaction_type !== null
      case 1:
        return searchCriteria.locations.length > 0
      case 2:
        return searchCriteria.property_types.length > 0
      case 3:
        return searchCriteria.price_range !== null
      default:
        return true
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`
    }
    return `$${price.toLocaleString()}`
  }

  const getPropertyTypeIcon = (type: string) => {
    const propertyType = PROPERTY_TYPES.find((pt) => pt.value === type)
    return propertyType?.icon || Building
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Agent Recommendations
            </h1>
            <p className="text-muted-foreground mt-2">Found {agents.length} agents matching your criteria</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep(0)
              setShowResults(false)
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            New Search
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Searching for agents that match your needs...</p>
                <p className="text-muted-foreground">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {agents.map((agent) => (
              <Card key={agent.agent_id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src="/placeholder.svg" alt={agent.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                          #{agent.rank}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{agent.name}</h3>
                        <p className="text-muted-foreground">{agent.brokerage}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{agent.star_rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({agent.num_reviews} reviews)</span>
                          </div>
                          {agent.is_premier && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              Premier
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{Math.round(agent.total_score * 100)}%</div>
                      <p className="text-sm text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Deals This Year:</span>
                            <span className="font-medium">{agent.past_year_deals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Transaction:</span>
                            <span className="font-medium">{formatPrice(agent.avg_transaction_value)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Service Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.comprehensive_areas.slice(0, 3).map((area, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {area}
                            </Badge>
                          ))}
                          {agent.comprehensive_areas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.comprehensive_areas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Expertise Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(agent.breakdown).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{key.replace("_", " ")}</span>
                                <span>{Math.round(value * 100)}%</span>
                              </div>
                              <Progress value={value * 100} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {agent.phone && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      )}
                      {agent.email && (
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      )}
                    </div>
                    {agent.profile_url && (
                      <Button variant="default" size="sm">
                        View Profile
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Find Your Perfect Real Estate Agent
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with top-rated real estate professionals who specialize in your area and property type. Our AI-powered
          matching system finds agents with proven track records in your market.
        </p>
      </div>

      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Why Work with a Real Estate Agent?</CardTitle>
            <CardDescription>
              Professional agents provide invaluable expertise and support throughout your real estate journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Market Expertise</h4>
                    <p className="text-sm text-muted-foreground">
                      Local market knowledge, pricing strategies, and neighborhood insights
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Negotiation Skills</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional negotiation to get you the best deal possible
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Network Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Connections with lenders, inspectors, contractors, and other professionals
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Legal Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Navigate complex contracts and legal requirements safely
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Time Savings</h4>
                    <p className="text-sm text-muted-foreground">
                      Handle paperwork, scheduling, and coordination for you
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Market Access</h4>
                    <p className="text-sm text-muted-foreground">Access to MLS listings and off-market opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Are you buying or selling?</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={searchCriteria.transaction_type === "buying" ? "default" : "outline"}
                  className="h-20 text-left flex-col items-start justify-center"
                  onClick={() => setSearchCriteria((prev) => ({ ...prev, transaction_type: "buying" }))}
                >
                  <Home className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Buying</div>
                    <div className="text-sm opacity-70">Find your dream home</div>
                  </div>
                </Button>
                <Button
                  variant={searchCriteria.transaction_type === "selling" ? "default" : "outline"}
                  className="h-20 text-left flex-col items-start justify-center"
                  onClick={() => setSearchCriteria((prev) => ({ ...prev, transaction_type: "selling" }))}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Selling</div>
                    <div className="text-sm opacity-70">Get the best price</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Which area are you looking to {searchCriteria.transaction_type}?</CardTitle>
            <CardDescription>Select the locations where you want to find an agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {MAJOR_MARKETS.map((location) => (
                  <Button
                    key={location}
                    variant={searchCriteria.locations.includes(location) ? "default" : "outline"}
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => {
                      setSearchCriteria((prev) => ({
                        ...prev,
                        locations: prev.locations.includes(location)
                          ? prev.locations.filter((l) => l !== location)
                          : [...prev.locations, location],
                      }))
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{location}</span>
                  </Button>
                ))}
              </div>
              {searchCriteria.locations.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected locations:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchCriteria.locations.map((location) => (
                      <Badge key={location} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>What type of property are you interested in?</CardTitle>
            <CardDescription>Select all property types that apply to your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    variant={searchCriteria.property_types.includes(type.value) ? "default" : "outline"}
                    className="h-24 flex-col space-y-2"
                    onClick={() => {
                      setSearchCriteria((prev) => ({
                        ...prev,
                        property_types: prev.property_types.includes(type.value)
                          ? prev.property_types.filter((pt) => pt !== type.value)
                          : [...prev.property_types, type.value],
                      }))
                    }}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>What's your price range?</CardTitle>
            <CardDescription>Select the price range for your {searchCriteria.transaction_type} search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRICE_RANGES.map((range) => (
                <Button
                  key={range.label}
                  variant={searchCriteria.price_range?.label === range.label ? "default" : "outline"}
                  className="justify-start h-12"
                  onClick={() => setSearchCriteria((prev) => ({ ...prev, price_range: range }))}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {steps.slice(0, -1).map((_, index) => (
            <div key={index} className={`h-2 w-8 rounded-full ${index <= currentStep ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <Button onClick={nextStep} disabled={!canProceed() || currentStep >= steps.length - 1}>
          {currentStep === steps.length - 2 ? "Find Agents" : "Next"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
