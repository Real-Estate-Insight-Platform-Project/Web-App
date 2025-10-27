"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MapPin, DollarSign, Home, Loader2, CheckCircle2, Building2, Users, Landmark, TreePine, Store, Gem, HardHat } from "lucide-react"

interface Step2Props {
  state: string
  city: string
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  onPriceRangeChange: (min: number, max: number) => void
  onPropertyTypeChange: (type: string) => void
  onNext: () => void
  onBack: () => void
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

const STATE_NAME_TO_CODE: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY"
}

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family", icon: Home },
  { value: "multi_family", label: "Multi Family", icon: Users },
  { value: "condo", label: "Condo", icon: Building2 },
  { value: "townhouse", label: "Townhouse", icon: Building2 },
  { value: "land", label: "Land", icon: TreePine },
  { value: "commercial", label: "Commercial", icon: Store },
  { value: "luxury", label: "Luxury", icon: Gem },
  { value: "new_construction", label: "New Construction", icon: HardHat },
]

export function Step2LocationProperty(props: Step2Props) {
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [selectedStateName, setSelectedStateName] = useState("")
  const [priceRange, setPriceRange] = useState([props.minPrice || 0, props.maxPrice || 2000000])

  useEffect(() => {
    fetchStates()
  }, [])

  useEffect(() => {
    if (selectedStateName) {
      fetchCities(selectedStateName)
    }
  }, [selectedStateName])

  const fetchStates = async () => {
    setIsLoadingStates(true)
    try {
      const response = await fetch("/api/agent-finder/locations/states")
      const data: StatesResponse = await response.json()
      if (data.success && data.states) {
        setStates(data.states)
      }
    } catch (error) {
      console.error("Error fetching states:", error)
    } finally {
      setIsLoadingStates(false)
    }
  }

  const fetchCities = async (stateName: string) => {
    setIsLoadingCities(true)
    try {
      const response = await fetch(
        `/api/agent-finder/locations/cities?state_name=${encodeURIComponent(stateName)}`
      )
      const data: CitiesResponse = await response.json()
      if (data.success && data.cities) {
        setCities(data.cities)
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }

  const handleStateChange = (stateName: string) => {
    setSelectedStateName(stateName)
    setCities([]) // Clear cities array
    const stateCode = STATE_NAME_TO_CODE[stateName] || stateName
    props.onStateChange(stateCode)
    // Don't call props.onCityChange("") here - let parent handle it
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    props.onPriceRangeChange(values[0], values[1])
  }

  const canProceed = props.state && props.city

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Property Details</h2>
        <p className="text-lg text-gray-600">Where are you looking and what's your budget?</p>
      </div>

      <Card className="border-red-100 w-full">
        <CardContent className="p-8 space-y-8 w-full">
          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <MapPin className="h-5 w-5" />
              <span>Location</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State *
                </Label>
                <Select
                  value={selectedStateName}
                  onValueChange={handleStateChange}
                  disabled={isLoadingStates}
                >
                  <SelectTrigger id="state" className="h-12 w-full">
                    <SelectValue placeholder={isLoadingStates ? "Loading..." : "Select state"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City *
                </Label>
                <Select
                  value={props.city}
                  onValueChange={props.onCityChange}
                  disabled={!selectedStateName || isLoadingCities}
                >
                  <SelectTrigger id="city" className="h-12 w-full">
                    <SelectValue
                      placeholder={
                        !selectedStateName
                          ? "Select state first"
                          : isLoadingCities
                          ? "Loading..."
                          : "Select city"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <DollarSign className="h-5 w-5" />
              <span>Price Range (Optional)</span>
            </div>

            <div className="space-y-4 bg-red-50 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Minimum</span>
                <span className="text-lg font-bold text-red-700">{formatPrice(priceRange[0])}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={5000000}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Maximum</span>
                <span className="text-lg font-bold text-red-700">{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <Home className="h-5 w-5" />
              <span>Property Type (Optional)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROPERTY_TYPES.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      props.propertyType === type.value
                        ? "border-red-600 border-2 shadow-lg bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                    onClick={() => props.onPropertyTypeChange(type.value)}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={`mx-auto w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                        props.propertyType === type.value
                          ? "border-red-600 bg-white"
                          : "border-gray-300"
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          props.propertyType === type.value ? "text-red-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      {props.propertyType === type.value && (
                        <CheckCircle2 className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          onClick={props.onBack}
          variant="outline"
          size="lg"
          className="px-8 border-red-200 text-red-700 hover:bg-red-50"
        >
          Back
        </Button>
        <Button
          onClick={props.onNext}
          disabled={!canProceed}
          size="lg"
          className="px-12 bg-red-600 hover:bg-red-700 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
