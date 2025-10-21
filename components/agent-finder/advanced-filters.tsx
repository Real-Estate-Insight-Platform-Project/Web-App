"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"

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

interface AdvancedFiltersProps {
  filters: UserFilters
  onChange: (filters: UserFilters) => void
  className?: string
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
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
  "Other"
]

const SPECIALIZATIONS = [
  "First-time buyers",
  "Luxury homes",
  "Investment properties",
  "Commercial real estate",
  "Condominiums",
  "New construction",
  "Foreclosures/REO",
  "Senior housing",
  "Relocation",
  "Waterfront properties",
  "Historic homes",
  "Green/sustainable homes"
]

export function AdvancedFilters({ filters, onChange, className }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof UserFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key: keyof UserFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onChange(newFilters)
  }

  const clearAllFilters = () => {
    onChange({
      active_only: true, // Keep this default
      language: "English" // Keep this default
    })
  }

  const getActiveFiltersCount = () => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === "active_only" && value === true) return false // Don't count default
      if (key === "language" && value === "English") return false // Don't count default
      return value !== undefined && value !== null && value !== ""
    })
    return activeFilters.length
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
    return `$${price.toLocaleString()}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Advanced Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Refine your search with specific requirements
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Clear All
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {/* Filter Categories as Cards */}
          <div className="grid gap-6">
            
            {/* Location Card */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800">
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-medium">State</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={filters.state || ""} 
                        onValueChange={(value) => updateFilter("state", value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.state && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => clearFilter("state")}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-medium">City</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="city"
                        placeholder="Enter city name"
                        value={filters.city || ""}
                        onChange={(e) => updateFilter("city", e.target.value)}
                        className="h-8 text-sm"
                      />
                      {filters.city && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => clearFilter("city")}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Type & Price Range Card */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800">
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Transaction Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.transaction_type === "buying" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("transaction_type", "buying")}
                      className={`h-8 text-xs ${filters.transaction_type === "buying" ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-700 hover:bg-red-50"}`}
                    >
                      Buying
                    </Button>
                    <Button
                      variant={filters.transaction_type === "selling" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("transaction_type", "selling")}
                      className={`h-8 text-xs ${filters.transaction_type === "selling" ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-700 hover:bg-red-50"}`}
                    >
                      Selling
                    </Button>
                    {filters.transaction_type && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => clearFilter("transaction_type")}
                        className="h-8 text-xs text-red-600 hover:bg-red-100"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Price Range</Label>
                  {(() => {
                  function PriceRangeControl() {
                    const [localRange, setLocalRange] = useState<[number, number]>([
                    filters.price_min ?? 0,
                    filters.price_max ?? 2000000,
                    ])

                    return (
                    <div className="space-y-3">
                      <div className="px-3">
                      <Slider
                        min={0}
                        max={2000000}
                        step={50000}
                        value={localRange}
                        onValueChange={(values: number[]) => {
                        const [a, b] = values
                        const minVal = Math.min(a, b)
                        const maxVal = Math.max(a, b)
                        setLocalRange([minVal, maxVal])
                        }}
                        onValueCommit={(values: number[]) => {
                        const [a, b] = values
                        const minVal = Math.min(a, b)
                        const maxVal = Math.max(a, b)
                        // Update local state and send a single update to the parent
                        setLocalRange([minVal, maxVal])
                        onChange({
                          ...filters,
                          price_min: minVal,
                          price_max: maxVal
                        })
                        }}
                        className="w-full"
                      />
                      </div>

                      <div className="flex justify-between text-xs text-red-700">
                      <span>{formatPrice(localRange[0])}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {formatPrice(localRange[0])} - {formatPrice(localRange[1])}
                      </span>
                      <span>{formatPrice(localRange[1])}</span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                      <span>0% (Start)</span>
                      <span>50% (Middle)</span>
                      <span>100% (End)</span>
                      </div>
                    </div>
                    )
                  }

                  // key ensures the nested component re-inits if external filters change
                  return (
                    <PriceRangeControl
                    key={`${filters.price_min ?? 0}-${filters.price_max ?? 2000000}`}
                    />
                  )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Agent Quality Card */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800">
                  Agent Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min_rating" className="text-xs font-medium">Minimum Rating</Label>
                    <Select 
                      value={filters.min_rating?.toString() || ""} 
                      onValueChange={(value) => updateFilter("min_rating", parseFloat(value))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.0">3.0+ Stars</SelectItem>
                        <SelectItem value="3.5">3.5+ Stars</SelectItem>
                        <SelectItem value="4.0">4.0+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="5.0">5.0 Stars Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min_reviews" className="text-xs font-medium">Minimum Reviews</Label>
                    <Input
                      id="min_reviews"
                      type="number"
                      placeholder="Any"
                      value={filters.min_reviews || ""}
                      onChange={(e) => updateFilter("min_reviews", parseInt(e.target.value) || undefined)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language & Specialization Card */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Language & Specialization</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-xs font-medium">Language</Label>
                    <Select 
                      value={filters.language || "English"} 
                      onValueChange={(value) => updateFilter("language", value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-xs font-medium">Specialization</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={filters.specialization || ""} 
                        onValueChange={(value) => updateFilter("specialization", value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Any specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALIZATIONS.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.specialization && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => clearFilter("specialization")}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Options Card */}
            <Card className="border-red-100 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border border-red-100 rounded bg-white">
                    <div>
                      <Label htmlFor="recent_activity" className="text-xs font-medium">Recent Activity Required</Label>
                      <p className="text-xs text-muted-foreground">Only show agents with recent client work</p>
                    </div>
                    <Switch
                      id="recent_activity"
                      checked={filters.require_recent_activity || false}
                      onCheckedChange={(checked) => updateFilter("require_recent_activity", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border border-red-100 rounded bg-white">
                    <div>
                      <Label htmlFor="active_only" className="text-xs font-medium">Active Agents Only</Label>
                      <p className="text-xs text-muted-foreground">Only show currently active agents</p>
                    </div>
                    <Switch
                      id="active_only"
                      checked={filters.active_only ?? true}
                      onCheckedChange={(checked) => updateFilter("active_only", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      )}
    </Card>
  )
}