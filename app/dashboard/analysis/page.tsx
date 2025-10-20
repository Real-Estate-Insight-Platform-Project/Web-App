"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, MapPin, Activity, Target, DollarSign } from "lucide-react"
import stateToCounties from "../../../state_to_counties.json"


type RiskLevel = "Low" | "Medium" | "High"

interface MarketData {
  state: string
  county: string | null
  expectedGrowth: number
  volatility: number
  liquidity: number
  ioi: number
  riskLevel: RiskLevel
  yearMonth: string | null
  horizonMonths: number
}

interface ComparisonRegion {
  state: string
  county?: string | null
}

const buildRegionKey = (state: string, county: string | null | undefined, horizon: string) => {
  const normalizedState = state.trim().toLowerCase()
  const normalizedCounty = (county ?? "state").trim().toLowerCase()
  return `${normalizedState}::${normalizedCounty}::${horizon}`
}

const formatCountyLabel = (value: string) => {
  if (!value) return ""
  return value
    .split(" ")
    .map(segment =>
      segment
        .split("-")
        .map(part => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join("-")
    )
    .join(" ")
}

const riskLevels: RiskLevel[] = ["Low", "Medium", "High"]


export default function MarketAnalysisPage() {
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCounty, setSelectedCounty] = useState<string>("")
  const [forecastHorizon, setForecastHorizon] = useState<string>("12")
  const [comparisonRegions, setComparisonRegions] = useState<ComparisonRegion[]>([])
  const [loading, setLoading] = useState(false)
  const [availableCounties, setAvailableCounties] = useState<string[]>([])
  const [dataCache, setDataCache] = useState<Record<string, MarketData>>({})
  const [currentMarketData, setCurrentMarketData] = useState<MarketData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const states = useMemo(
    () => Object.keys(stateToCounties).sort((a, b) => a.localeCompare(b)),
    []
  )

  const sortedCounties = useMemo(
    () =>
      [...availableCounties].sort((a, b) =>
        formatCountyLabel(a).localeCompare(formatCountyLabel(b))
      ),
    [availableCounties]
  )

  const fetchRegionData = useCallback(
    async (state: string, county: string | null, horizon: string): Promise<MarketData> => {
      const cacheKey = buildRegionKey(state, county, horizon)
      if (dataCache[cacheKey]) {
        return dataCache[cacheKey]
      }

      const params = new URLSearchParams({ state, horizon })
      if (county) {
        params.append("county", county)
      }

      const response = await fetch(`/api/analysis?${params.toString()}`)
      if (!response.ok) {
        let message = "Failed to fetch analysis data."
        const text = await response.text()
        if (text) {
          try {
            const parsed = JSON.parse(text)
            if (parsed?.error) {
              message = parsed.error
            } else {
              message = text
            }
          } catch {
            message = text
          }
        }
        throw new Error(message)
      }

      const payload = await response.json()

      const payloadRisk = riskLevels.includes(payload.riskLevel as RiskLevel)
        ? (payload.riskLevel as RiskLevel)
        : "Medium"

      const resolvedCounty = payload.county ?? (county ? county : null)
      const formattedCounty = resolvedCounty ? formatCountyLabel(resolvedCounty) : null

      const transformed: MarketData = {
        state: payload.state ?? state,
        county: formattedCounty,
        expectedGrowth: Number(payload.appreciation ?? 0),
        volatility: Number(payload.volatility ?? 0),
        liquidity: Number(payload.liquidity ?? 0),
        ioi: Number(payload.ioi ?? 0),
        riskLevel: payloadRisk,
        yearMonth: payload.yearMonth ?? null,
        horizonMonths: Number(payload.horizonMonths ?? Number(horizon)) || Number(horizon)
      }

      setDataCache(prev => ({ ...prev, [cacheKey]: transformed }))

      return transformed
    },
    [dataCache]
  )

  useEffect(() => {
    if (!selectedState) {
      setAvailableCounties([])
      setSelectedCounty("")
      return
    }

    const countiesForState = (stateToCounties as Record<string, string[]>)[selectedState] || []
    setAvailableCounties(countiesForState)
    setSelectedCounty("")
  }, [selectedState])

  useEffect(() => {
    let isActive = true

    if (!selectedState || !selectedCounty) {
      setCurrentMarketData(null)
      setError(null)
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchRegionData(selectedState, selectedCounty, forecastHorizon)
        if (isActive) {
          setCurrentMarketData(data)
        }
      } catch (err) {
        if (isActive) {
          const message = err instanceof Error && err.message
            ? err.message
            : "Unable to load analysis data for the selected region."
          setError(message)
          setCurrentMarketData(null)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [selectedState, selectedCounty, forecastHorizon, fetchRegionData])

  useEffect(() => {
    if (!comparisonRegions.length) return

    comparisonRegions.forEach(region => {
      const countyValue = region.county && region.county !== "" ? region.county : null
      fetchRegionData(region.state, countyValue, forecastHorizon).catch(() => undefined)
    })
  }, [comparisonRegions, forecastHorizon, fetchRegionData])

  const addComparisonRegion = () => {
    if (!selectedState || !selectedCounty || comparisonRegions.length >= 3 || !currentMarketData) {
      return
    }

    const newRegion: ComparisonRegion = { state: selectedState, county: selectedCounty }
    const exists = comparisonRegions.some(
      region => region.state === newRegion.state && (region.county || "") === (newRegion.county || "")
    )

    if (!exists) {
      setComparisonRegions(prev => [...prev, newRegion])
    }
  }

  const removeComparisonRegion = (index: number) => {
    setComparisonRegions(comparisonRegions.filter((_, i) => i !== index))
  }

  const getComparisonData = (region: ComparisonRegion): MarketData | null => {
    const countyValue = region.county && region.county !== "" ? region.county : null
    return dataCache[buildRegionKey(region.state, countyValue, forecastHorizon)] || null
  }

  const getRiskColor = (riskLevel: RiskLevel | undefined) => {
    switch (riskLevel) {
      case "Low":
        return "text-green-600 bg-green-50"
      case "Medium":
        return "text-yellow-600 bg-yellow-50"
      case "High":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const formatMetricValue = (value: number | null | undefined, digits = 1) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "—"
    }
    return value.toFixed(digits)
  }

  const formatPercentValue = (value: number | null | undefined, digits = 1) => {
    const formatted = formatMetricValue(value, digits)
    return formatted === "—" ? formatted : `${formatted}%`
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
                  disabled={!selectedState || sortedCounties.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a county" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCounties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {formatCountyLabel(county)}
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
                disabled={!selectedState || !selectedCounty || comparisonRegions.length >= 3 || loading || !currentMarketData}
                className="w-full"
                variant="outline"
              >
                Add Current Region
              </Button>

              <div className="space-y-2">
                {comparisonRegions.map((region, index) => {
                  const regionData = getComparisonData(region)
                  const label = regionData
                    ? regionData.county
                      ? `${regionData.county}, ${regionData.state}`
                      : regionData.state
                    : region.county
                      ? `${formatCountyLabel(region.county)}, ${region.state}`
                      : region.state

                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{label}</span>
                      <Button
                        onClick={() => removeComparisonRegion(index)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <div className="lg:col-span-2 space-y-6">
          {error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Unable to load data</h3>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : loading && selectedState && selectedCounty ? (
            <Card>
              <CardContent className="p-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-24 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : currentMarketData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Market Insights
                    <Badge variant="outline" className="ml-2">
                      {currentMarketData.horizonMonths} month forecast
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {currentMarketData.county
                      ? `${currentMarketData.county}, ${currentMarketData.state}`
                      : currentMarketData.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Expected Price Growth</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPercentValue(currentMarketData.expectedGrowth, 1)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Activity className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-600">
                          {formatPercentValue(currentMarketData.volatility, 1)}
                        </p>
                        <Badge
                          variant="outline"
                          className={getRiskColor(currentMarketData.riskLevel)}
                        >
                          {currentMarketData.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-muted-foreground">Liquidity</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentValue(currentMarketData.liquidity, 1)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-muted-foreground">Investment Opportunity Index</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatMetricValue(currentMarketData.ioi, 1)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">IOI Calculation</h4>
                    <p className="text-sm text-muted-foreground">
                      IOI = Appreciation Score + (0.2 × Liquidity Score) - (0.3 × Volatility Risk)
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
                            if (!data) return null
                            return (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">
                                  {data.county ? `${data.county}, ${data.state}` : data.state}
                                </td>
                                <td className="p-2 text-right text-blue-600 font-medium">
                                  {formatPercentValue(data.expectedGrowth, 1)}
                                </td>
                                <td className="p-2 text-right">
                                  {formatPercentValue(data.volatility, 1)}
                                </td>
                                <td className="p-2 text-right text-green-600 font-medium">
                                  {formatPercentValue(data.liquidity, 1)}
                                </td>
                                <td className="p-2 text-right text-purple-600 font-bold">
                                  {formatMetricValue(data.ioi, 1)}
                                </td>
                                <td className="p-2 text-center">
                                  <Badge variant="outline" className={getRiskColor(data.riskLevel)}>
                                    {data.riskLevel}
                                  </Badge>
                                </td>
                              </tr>
                            )
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
