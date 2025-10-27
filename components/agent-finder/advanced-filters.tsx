"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, MapPin, Home, DollarSign, Globe, Zap, Loader2 } from "lucide-react"

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

interface AdvancedFiltersProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  className?: string
}

interface StatesResponse {
  success: boolean
  total_states: number
  states: string[]
}

interface CitiesResponse {
  success: boolean
  state_name: string
  total_cities: number
  cities: string[]
}

// State name to code mapping for backend API
const STATE_NAME_TO_CODE: Record<string, string> = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
}

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "luxury", label: "Luxury" },
  { value: "new_construction", label: "New Construction" },
]

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Vietnamese",
  "Tagalog",
  "Polish",
  "Greek",
  "Hebrew",
  "Thai",
  "Dutch"
]

const ADDITIONAL_SPECIALIZATIONS = [
  { value: "first_time_buyer", label: "First Time Buyer" },
  { value: "investor", label: "Investor" },
  { value: "veteran", label: "Veteran" },
  { value: "senior", label: "Senior" },
  { value: "relocation", label: "Relocation" },
  { value: "foreclosure", label: "Foreclosure" },
  { value: "short_sale", label: "Short Sale" },
  { value: "rental", label: "Rental" },
]

export function AdvancedFilters({ filters, onChange, className }: AdvancedFiltersProps) {
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [statesError, setStatesError] = useState<string | null>(null)
  const [citiesError, setCitiesError] = useState<string | null>(null)
  const [selectedStateName, setSelectedStateName] = useState<string>("")

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoadingStates(true)
      setStatesError(null)
      try {
        const response = await fetch("/api/agent-finder/locations/states")
        if (!response.ok) {
          throw new Error("Failed to fetch states")
        }
        const data: StatesResponse = await response.json()
        if (data.success && data.states) {
          setStates(data.states)
        }
      } catch (error) {
        console.error("Error fetching states:", error)
        setStatesError("Failed to load states")
      } finally {
        setIsLoadingStates(false)
      }
    }

    fetchStates()
  }, [])

  // Fetch cities when state name changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedStateName) {
        setCities([])
        return
      }

      setIsLoadingCities(true)
      setCitiesError(null)
      try {
        const response = await fetch(
          `/api/agent-finder/locations/cities?state_name=${encodeURIComponent(selectedStateName)}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch cities")
        }
        const data: CitiesResponse = await response.json()
        if (data.success && data.cities) {
          setCities(data.cities)
          // Clear city selection if it's not in the new list
          if (filters.city && !data.cities.includes(filters.city)) {
            updateFilter("city", "")
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
        setCitiesError("Failed to load cities")
        setCities([])
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [selectedStateName])
  
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const handleStateChange = (stateName: string) => {
    setSelectedStateName(stateName)
    // Convert state name to code for the backend
    const stateCode = STATE_NAME_TO_CODE[stateName] || stateName
    // Update both state and city at once to avoid React batching issues
    onChange({ ...filters, state: stateCode, city: "" })
  }

  const toggleSpecialization = (spec: string) => {
    const current = filters.additional_specializations || []
    if (current.includes(spec)) {
      updateFilter("additional_specializations", current.filter(s => s !== spec))
    } else {
      updateFilter("additional_specializations", [...current, spec])
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className={`border-red-200 ${className || ""}`}>
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Search Criteria
        </CardTitle>
        <CardDescription className="text-red-600">
          Tell us what you're looking for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">I am a *</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={filters.user_type === "buyer" ? "default" : "outline"}
              className={`flex-1 ${
                filters.user_type === "buyer"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-red-200 text-red-700 hover:bg-red-50"
              }`}
              onClick={() => updateFilter("user_type", "buyer")}
            >
              <Home className="h-4 w-4 mr-2" />
              Buyer
            </Button>
            <Button
              type="button"
              variant={filters.user_type === "seller" ? "default" : "outline"}
              className={`flex-1 ${
                filters.user_type === "seller"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border-red-200 text-red-700 hover:bg-red-50"
              }`}
              onClick={() => updateFilter("user_type", "seller")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Seller
            </Button>
          </div>
        </div>

        {/* Location - Required */}
        <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <MapPin className="h-4 w-4" />
            <span>Location (Required)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-gray-900">
                State *
              </Label>
              <Select 
                value={selectedStateName} 
                onValueChange={handleStateChange}
                disabled={isLoadingStates}
              >
                <SelectTrigger id="state" className="bg-white">
                  <SelectValue placeholder={isLoadingStates ? "Loading states..." : "Select state"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {isLoadingStates ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </SelectItem>
                  ) : statesError ? (
                    <SelectItem value="error" disabled>
                      {statesError}
                    </SelectItem>
                  ) : states.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No states available
                    </SelectItem>
                  ) : (
                    states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-900">
                City *
              </Label>
              <Select 
                value={filters.city} 
                onValueChange={(value) => updateFilter("city", value)}
                disabled={!selectedStateName || isLoadingCities}
              >
                <SelectTrigger id="city" className="bg-white">
                  <SelectValue 
                    placeholder={
                      !selectedStateName 
                        ? "Select state first" 
                        : isLoadingCities 
                        ? "Loading cities..." 
                        : "Select city"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {isLoadingCities ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading cities...
                      </div>
                    </SelectItem>
                  ) : citiesError ? (
                    <SelectItem value="error" disabled>
                      {citiesError}
                    </SelectItem>
                  ) : cities.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {selectedStateName ? "No cities found" : "Select a state first"}
                    </SelectItem>
                  ) : (
                    cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price" className="text-xs text-gray-600">Minimum</Label>
              <Input
                id="min_price"
                type="number"
                placeholder="Min price"
                value={filters.min_price || ""}
                onChange={(e) => updateFilter("min_price", e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                step={10000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_price" className="text-xs text-gray-600">Maximum</Label>
              <Input
                id="max_price"
                type="number"
                placeholder="Max price"
                value={filters.max_price || ""}
                onChange={(e) => updateFilter("max_price", e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                step={10000}
              />
            </div>
          </div>
          {filters.min_price && filters.max_price && (
            <p className="text-xs text-gray-600 mt-1">
              {formatCurrency(filters.min_price)} - {formatCurrency(filters.max_price)}
            </p>
          )}
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="property_type" className="text-sm font-medium text-gray-900">
            Property Type (Optional)
          </Label>
          <Select 
            value={filters.property_type || "any"} 
            onValueChange={(value) => updateFilter("property_type", value === "any" ? undefined : value)}
          >
            <SelectTrigger id="property_type">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferred Language
          </Label>
          <Select value={filters.language} onValueChange={(value) => updateFilter("language", value)}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Urgency */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-600" />
            <div>
              <Label htmlFor="is_urgent" className="text-sm font-medium text-gray-900 cursor-pointer">
                Urgent Need
              </Label>
              <p className="text-xs text-gray-600">
                Prioritize agents with high activity
              </p>
            </div>
          </div>
          <Switch
            id="is_urgent"
            checked={filters.is_urgent}
            onCheckedChange={(checked) => updateFilter("is_urgent", checked)}
          />
        </div>

        {/* Additional Specializations */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Additional Specializations (Optional)
          </Label>
          <div className="flex flex-wrap gap-2">
            {ADDITIONAL_SPECIALIZATIONS.map((spec) => {
              const isSelected = (filters.additional_specializations || []).includes(spec.value)
              return (
                <Badge
                  key={spec.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                  }`}
                  onClick={() => toggleSpecialization(spec.value)}
                >
                  {spec.label}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              )
            })}
          </div>
          {filters.additional_specializations && filters.additional_specializations.length > 0 && (
            <p className="text-xs text-gray-600">
              Selected: {filters.additional_specializations.length} specialization(s)
            </p>
          )}
        </div>

        {/* Max Results */}
        <div className="space-y-2">
          <Label htmlFor="max_results" className="text-sm font-medium text-gray-900">
            Maximum Results
          </Label>
          <Select 
            value={String(filters.max_results || 20)} 
            onValueChange={(value) => updateFilter("max_results", Number(value))}
          >
            <SelectTrigger id="max_results">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 agents</SelectItem>
              <SelectItem value="20">20 agents</SelectItem>
              <SelectItem value="30">30 agents</SelectItem>
              <SelectItem value="50">50 agents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => onChange({
            user_type: "buyer",
            state: "",
            city: "",
            language: "English",
            is_urgent: false,
            max_results: 20,
          })}
        >
          Reset All Filters
        </Button>
      </CardContent>
    </Card>
  )
}