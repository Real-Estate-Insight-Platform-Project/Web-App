"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Minus, BarChart3, Home, DollarSign, Calendar } from "lucide-react"

interface MarketData {
  year: number
  month: number
  state: string
  median_listing_price: number
  average_listing_price: number
  median_listing_price_per_square_foot: number
  total_listing_count: number
  median_days_on_market: number
  market_trend: string
}

export default function MarketInsightsPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [selectedCity, setSelectedCity] = useState("California")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchMarketData()
  }, [selectedCity])

  const fetchMarketData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("state", selectedCity)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      console.log("Market data fetched successfully:", data[0])
      setMarketData(data[0])
    } else {
      console.error("Error fetching market data:", error)
      setMarketData(null)
    }
    setLoading(false)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "rising":
        return "text-green-600 bg-green-50 border-green-200"
      case "declining":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Insights</h1>
          <p className="text-muted-foreground mt-2">Real-time market analytics and trends</p>
        </div>

        <div className="w-48">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="Florida">Florida</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : marketData ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.average_listing_price?.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(marketData.market_trend)}
                  <span className="capitalize">{marketData.market_trend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Median Price</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.median_listing_price?.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Latest prediction for {marketData.month}/{marketData.year}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price per Sq Ft</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.median_listing_price_per_square_foot}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Median price per square foot</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.median_days_on_market}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Median days on market</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Trend Badge */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Market Trend</h3>
                  <p className="text-muted-foreground">Current market direction in {selectedCity}</p>
                </div>
                <Badge className={`${getTrendColor(marketData.market_trend)} border`}>
                  {getTrendIcon(marketData.market_trend)}
                  <span className="ml-2 capitalize font-medium">{marketData.market_trend}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Key insights for {selectedCity} real estate market</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Total Listings</h4>
                  <p className="text-2xl font-bold text-primary">{marketData.total_listing_count}</p>
                  <p className="text-sm text-muted-foreground">Active listings</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Market Velocity</h4>
                  <p className="text-2xl font-bold text-primary">{marketData.median_days_on_market} days</p>
                  <p className="text-sm text-muted-foreground">Median time to sell</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Market Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  The {selectedCity} market is currently showing a{" "}
                  <strong className="capitalize">{marketData.market_trend}</strong> trend. With an average price of{" "}
                  <strong>${marketData.average_listing_price?.toLocaleString()}</strong> and properties spending an average of{" "}
                  <strong>{marketData.median_days_on_market} days</strong> on the market,
                  {marketData.market_trend === "rising" && " this indicates a seller's market with strong demand."}
                  {marketData.market_trend === "declining" && " buyers may have more negotiating power."}
                  {marketData.market_trend === "stable" &&
                    " the market shows balanced conditions for both buyers and sellers."}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No market data available</h3>
            <p>Market insights for {selectedCity} are not currently available.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
