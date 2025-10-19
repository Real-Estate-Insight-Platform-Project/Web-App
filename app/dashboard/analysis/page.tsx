"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, MapPin, Activity, Target, DollarSign } from "lucide-react"

interface MarketData {
  state: string
  county: string
  expectedGrowth: number
  volatility: number
  liquidity: number
  ioi: number
  riskLevel: "Low" | "Medium" | "High"
}

interface ComparisonRegion {
  state: string
  county: string
}

export default function MarketAnalysisPage() {
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCounty, setSelectedCounty] = useState<string>("")
  const [forecastHorizon, setForecastHorizon] = useState<string>("12")
  const [comparisonRegions, setComparisonRegions] = useState<ComparisonRegion[]>([])
  const [loading, setLoading] = useState(false)

  // Hard-coded market data
  const states = [
    "California", "Texas", "Florida", "New York", "Pennsylvania", 
    "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan"
  ]

  const counties = {
    "California": ["Los Angeles", "San Diego", "Orange", "Riverside", "San Bernardino", "Alameda", "Sacramento"],
    "Texas": ["Harris", "Dallas", "Tarrant", "Bexar", "Travis", "Collin", "Fort Bend"],
    "Florida": ["Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange", "Pinellas", "Duval"],
    "New York": ["Kings", "Queens", "New York", "Suffolk", "Bronx", "Nassau", "Westchester"],
    "Pennsylvania": ["Philadelphia", "Allegheny", "Montgomery", "Bucks", "Chester", "Delaware", "Lancaster"],
    "Illinois": ["Cook", "DuPage", "Lake", "Will", "Kane", "McHenry", "Winnebago"],
    "Ohio": ["Cuyahoga", "Franklin", "Hamilton", "Summit", "Montgomery", "Lucas", "Stark"],
    "Georgia": ["Fulton", "Gwinnett", "DeKalb", "Cobb", "Clayton", "Cherokee", "Forsyth"],
    "North Carolina": ["Mecklenburg", "Wake", "Guilford", "Forsyth", "Cumberland", "Durham", "Union"],
    "Michigan": ["Wayne", "Oakland", "Macomb", "Kent", "Genesee", "Washtenaw", "Ottawa"]
  }

  // Hard-coded market data with realistic values
  const marketData: Record<string, MarketData> = {
    "California-Los Angeles": {
      state: "California",
      county: "Los Angeles",
      expectedGrowth: 8.5,
      volatility: 65,
      liquidity: 85,
      ioi: 78.2,
      riskLevel: "Medium"
    },
    "California-San Diego": {
      state: "California",
      county: "San Diego",
      expectedGrowth: 9.2,
      volatility: 58,
      liquidity: 78,
      ioi: 82.4,
      riskLevel: "Medium"
    },
    "Texas-Harris": {
      state: "Texas",
      county: "Harris",
      expectedGrowth: 7.8,
      volatility: 45,
      liquidity: 92,
      ioi: 88.6,
      riskLevel: "Low"
    },
    "Florida-Miami-Dade": {
      state: "Florida",
      county: "Miami-Dade",
      expectedGrowth: 6.9,
      volatility: 72,
      liquidity: 88,
      ioi: 75.8,
      riskLevel: "High"
    },
    "New York-Kings": {
      state: "New York",
      county: "Kings",
      expectedGrowth: 5.4,
      volatility: 38,
      liquidity: 95,
      ioi: 84.2,
      riskLevel: "Low"
    },
    "Pennsylvania-Philadelphia": {
      state: "Pennsylvania",
      county: "Philadelphia",
      expectedGrowth: 4.2,
      volatility: 42,
      liquidity: 76,
      ioi: 72.8,
      riskLevel: "Low"
    },
    "Illinois-Cook": {
      state: "Illinois",
      county: "Cook",
      expectedGrowth: 3.8,
      volatility: 48,
      liquidity: 82,
      ioi: 71.4,
      riskLevel: "Medium"
    },
    "Ohio-Cuyahoga": {
      state: "Ohio",
      county: "Cuyahoga",
      expectedGrowth: 5.1,
      volatility: 35,
      liquidity: 68,
      ioi: 76.5,
      riskLevel: "Low"
    },
    "Georgia-Fulton": {
      state: "Georgia",
      county: "Fulton",
      expectedGrowth: 8.9,
      volatility: 52,
      liquidity: 79,
      ioi: 85.7,
      riskLevel: "Medium"
    },
    "North Carolina-Mecklenburg": {
      state: "North Carolina",
      county: "Mecklenburg",
      expectedGrowth: 9.6,
      volatility: 48,
      liquidity: 73,
      ioi: 87.2,
      riskLevel: "Medium"
    }
  }

  // Top 10 counties by IOI (hard-coded)
  const topCountiesByIOI = [
    { name: "Harris, TX", ioi: 88.6 },
    { name: "Mecklenburg, NC", ioi: 87.2 },
    { name: "Fulton, GA", ioi: 85.7 },
    { name: "Kings, NY", ioi: 84.2 },
    { name: "San Diego, CA", ioi: 82.4 },
    { name: "Los Angeles, CA", ioi: 78.2 },
    { name: "Cuyahoga, OH", ioi: 76.5 },
    { name: "Miami-Dade, FL", ioi: 75.8 },
    { name: "Philadelphia, PA", ioi: 72.8 },
    { name: "Cook, IL", ioi: 71.4 }
  ]

  const getCurrentMarketData = (): MarketData | null => {
    if (!selectedState || !selectedCounty) return null
    const key = `${selectedState}-${selectedCounty}`
    return marketData[key] || null
  }

  const addComparisonRegion = () => {
    if (selectedState && selectedCounty && comparisonRegions.length < 3) {
      const newRegion = { state: selectedState, county: selectedCounty }
      if (!comparisonRegions.some(r => r.state === selectedState && r.county === selectedCounty)) {
        setComparisonRegions([...comparisonRegions, newRegion])
      }
    }
  }

  const removeComparisonRegion = (index: number) => {
    setComparisonRegions(comparisonRegions.filter((_, i) => i !== index))
  }

  const getComparisonData = (region: ComparisonRegion): MarketData | null => {
    const key = `${region.state}-${region.county}`
    return marketData[key] || null
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low": return "text-green-600 bg-green-50"
      case "Medium": return "text-yellow-600 bg-yellow-50"
      case "High": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze market trends and investment opportunities across different regions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selection Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Region Selection
              </CardTitle>
              <CardDescription>Choose a region to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="state">Select State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">Select County</Label>
                <Select 
                  value={selectedCounty} 
                  onValueChange={setSelectedCounty}
                  disabled={!selectedState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a county" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedState && counties[selectedState as keyof typeof counties]?.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forecast">Forecast Horizon</Label>
                <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compare Regions</CardTitle>
              <CardDescription>Add up to 3 regions for comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={addComparisonRegion}
                disabled={!selectedState || !selectedCounty || comparisonRegions.length >= 3}
                className="w-full"
                variant="outline"
              >
                Add Current Region
              </Button>

              <div className="space-y-2">
                {comparisonRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{region.county}, {region.state}</span>
                    <Button
                      onClick={() => removeComparisonRegion(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <div className="lg:col-span-2 space-y-6">
          {getCurrentMarketData() ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Market Insights
                    <Badge variant="outline" className="ml-2">
                      {forecastHorizon} month forecast
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {getCurrentMarketData()?.county}, {getCurrentMarketData()?.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Expected Price Growth</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {getCurrentMarketData()?.expectedGrowth.toFixed(1)}%
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Activity className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-600">
                          {getCurrentMarketData()?.volatility}%
                        </p>
                        <Badge 
                          variant="outline" 
                          className={getRiskColor(getCurrentMarketData()?.riskLevel || "Medium")}
                        >
                          {getCurrentMarketData()?.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Liquidity</p>
                      <p className="text-2xl font-bold text-green-600">
                        {getCurrentMarketData()?.liquidity}%
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-muted-foreground">Investment Opportunity Index</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {getCurrentMarketData()?.ioi.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">IOI Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      IOI = (0.4 × Appreciation Score) + (0.3 × Liquidity Score) - (0.3 × Volatility Risk)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher scores indicate better investment opportunities
                    </p>
                  </div>
                </CardContent>
              </Card>

              {comparisonRegions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Comparison</CardTitle>
                    <CardDescription>Side-by-side analysis of selected regions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Region</th>
                            <th className="text-right p-2">Growth %</th>
                            <th className="text-right p-2">Volatility %</th>
                            <th className="text-right p-2">Liquidity %</th>
                            <th className="text-right p-2">IOI Score</th>
                            <th className="text-center p-2">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonRegions.map((region, index) => {
                            const data = getComparisonData(region)
                            return data ? (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">{region.county}, {region.state}</td>
                                <td className="p-2 text-right text-blue-600 font-medium">
                                  {data.expectedGrowth.toFixed(1)}%
                                </td>
                                <td className="p-2 text-right">{data.volatility}%</td>
                                <td className="p-2 text-right text-green-600 font-medium">
                                  {data.liquidity}%
                                </td>
                                <td className="p-2 text-right text-purple-600 font-bold">
                                  {data.ioi.toFixed(1)}
                                </td>
                                <td className="p-2 text-center">
                                  <Badge 
                                    variant="outline" 
                                    className={getRiskColor(data.riskLevel)}
                                  >
                                    {data.riskLevel}
                                  </Badge>
                                </td>
                              </tr>
                            ) : null
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Region</h3>
                <p className="text-muted-foreground">
                  Choose a state and county to view detailed market analysis and investment insights.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Top Counties Chart
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Top 10 Counties by Investment Opportunity Index
              </CardTitle>
              <CardDescription>Highest scoring regions for real estate investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCountiesByIOI.map((county, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{county.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(county.ioi / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-purple-600 font-bold min-w-[3rem] text-right">
                        {county.ioi.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
