"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Minus, BarChart3, Home, DollarSign, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface MarketData {
  id: string
  city: string
  state: string
  avg_price: number
  median_price: number
  price_per_sqft: number
  market_trend: string
  inventory_level: number
  days_on_market: number
  month_year: string
}

export default function MarketInsightsPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [selectedCity, setSelectedCity] = useState("Austin")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchMarketData()
  }, [selectedCity])

  const fetchMarketData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("market_analytics")
      .select("*")
      .eq("city", selectedCity)
      .order("month_year", { ascending: true })

    if (!error && data) {
      setMarketData(data)
    }
    setLoading(false)
  }

  const latestData = marketData[marketData.length - 1]
  const previousData = marketData[marketData.length - 2]

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

  const formatChartData = () => {
    return marketData.map((data) => ({
      month: new Date(data.month_year).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      avgPrice: data.avg_price,
      medianPrice: data.median_price,
      pricePerSqft: data.price_per_sqft,
      daysOnMarket: data.days_on_market,
      inventory: data.inventory_level,
    }))
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
              <SelectItem value="Austin">Austin, TX</SelectItem>
              <SelectItem value="Dallas">Dallas, TX</SelectItem>
              <SelectItem value="Houston">Houston, TX</SelectItem>
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
      ) : latestData ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${latestData.avg_price?.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(latestData.market_trend)}
                  <span className="capitalize">{latestData.market_trend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Median Price</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${latestData.median_price?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {previousData && (
                    <>
                      {latestData.median_price > previousData.median_price ? "+" : ""}
                      {(
                        ((latestData.median_price - previousData.median_price) / previousData.median_price) *
                        100
                      ).toFixed(1)}
                      % from last month
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price per Sq Ft</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${latestData.price_per_sqft}</div>
                <p className="text-xs text-muted-foreground">
                  {previousData && (
                    <>
                      {latestData.price_per_sqft > previousData.price_per_sqft ? "+" : ""}$
                      {(latestData.price_per_sqft - previousData.price_per_sqft).toFixed(2)} from last month
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData.days_on_market}</div>
                <p className="text-xs text-muted-foreground">
                  {previousData && (
                    <>
                      {latestData.days_on_market < previousData.days_on_market ? "-" : "+"}
                      {Math.abs(latestData.days_on_market - previousData.days_on_market)} from last month
                    </>
                  )}
                </p>
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
                <Badge className={`${getTrendColor(latestData.market_trend)} border`}>
                  {getTrendIcon(latestData.market_trend)}
                  <span className="ml-2 capitalize font-medium">{latestData.market_trend}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Price Trends Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends</CardTitle>
                <CardDescription>Average and median home prices over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line type="monotone" dataKey="avgPrice" stroke="#dc2626" strokeWidth={2} name="Average Price" />
                      <Line
                        type="monotone"
                        dataKey="medianPrice"
                        stroke="#7c2d12"
                        strokeWidth={2}
                        name="Median Price"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Activity</CardTitle>
                <CardDescription>Days on market and inventory levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="daysOnMarket" fill="#dc2626" name="Days on Market" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Key insights for {selectedCity} real estate market</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Inventory Level</h4>
                  <p className="text-2xl font-bold text-primary">{latestData.inventory_level?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active listings</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Market Velocity</h4>
                  <p className="text-2xl font-bold text-primary">{latestData.days_on_market} days</p>
                  <p className="text-sm text-muted-foreground">Average time to sell</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Market Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  The {selectedCity} market is currently showing a{" "}
                  <strong className="capitalize">{latestData.market_trend}</strong> trend. With an average price of{" "}
                  <strong>${latestData.avg_price?.toLocaleString()}</strong> and properties spending an average of{" "}
                  <strong>{latestData.days_on_market} days</strong> on the market,
                  {latestData.market_trend === "rising" && " this indicates a seller's market with strong demand."}
                  {latestData.market_trend === "declining" && " buyers may have more negotiating power."}
                  {latestData.market_trend === "stable" &&
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
