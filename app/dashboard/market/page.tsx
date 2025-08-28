"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  AlertCircle,
  Target,
  Activity,
} from "lucide-react"

// Mock user data
const mockUser = {
  role: "investor" as const,
  name: "Sarah Johnson",
  email: "sarah@example.com",
}

// Mock market data
const mockMarketData = {
  overview: {
    medianPrice: 485000,
    priceChange: 5.2,
    daysOnMarket: 28,
    inventoryLevel: "Low",
    marketTrend: "Seller's Market",
  },
  neighborhoods: [
    {
      name: "Downtown",
      medianPrice: 625000,
      priceChange: 8.1,
      rentYield: 4.2,
      appreciation: 12.3,
      riskLevel: "Medium",
      properties: 145,
    },
    {
      name: "Suburbs",
      medianPrice: 420000,
      priceChange: 3.8,
      rentYield: 5.8,
      appreciation: 8.7,
      riskLevel: "Low",
      properties: 289,
    },
    {
      name: "Riverside",
      medianPrice: 580000,
      priceChange: 6.4,
      rentYield: 3.9,
      appreciation: 15.2,
      riskLevel: "High",
      properties: 67,
    },
    {
      name: "Business District",
      medianPrice: 750000,
      priceChange: -2.1,
      rentYield: 6.2,
      appreciation: 4.5,
      riskLevel: "Medium",
      properties: 34,
    },
  ],
  trends: [
    {
      metric: "Median Home Price",
      current: "$485,000",
      change: "+5.2%",
      trend: "up",
      forecast: "Continued growth expected",
    },
    {
      metric: "Rental Rates",
      current: "$2,850/mo",
      change: "+7.8%",
      trend: "up",
      forecast: "Strong rental demand",
    },
    {
      metric: "Cap Rates",
      current: "5.4%",
      change: "-0.3%",
      trend: "down",
      forecast: "Compression continuing",
    },
    {
      metric: "Vacancy Rate",
      current: "3.2%",
      change: "-1.1%",
      trend: "down",
      forecast: "Tight rental market",
    },
  ],
}

export default function MarketAnalysisPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("12m")
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("all")

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Market Analysis</h1>
            <p className="text-muted-foreground mt-2">Real-time market insights and investment opportunities</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="12m">12 Months</SelectItem>
                <SelectItem value="24m">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Median Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockMarketData.overview.medianPrice.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{mockMarketData.overview.priceChange}%</span> YoY
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMarketData.overview.daysOnMarket}</div>
              <p className="text-xs text-muted-foreground">Average days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMarketData.overview.inventoryLevel}</div>
              <p className="text-xs text-muted-foreground">Supply level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Type</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{mockMarketData.overview.marketTrend}</div>
              <p className="text-xs text-muted-foreground">Current conditions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8.2</div>
              <p className="text-xs text-muted-foreground">Out of 10</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="neighborhoods" className="space-y-6">
          <TabsList>
            <TabsTrigger value="neighborhoods">Neighborhoods</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="neighborhoods" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Neighborhood Analysis</CardTitle>
                <CardDescription>Compare investment potential across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMarketData.neighborhoods.map((neighborhood) => (
                    <Card key={neighborhood.name} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground">{neighborhood.name}</h3>
                            <p className="text-sm text-muted-foreground">{neighborhood.properties} properties</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(neighborhood.riskLevel)}>{neighborhood.riskLevel} Risk</Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold">${neighborhood.medianPrice.toLocaleString()}</p>
                            <p
                              className={`text-sm ${neighborhood.priceChange > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {neighborhood.priceChange > 0 ? "+" : ""}
                              {neighborhood.priceChange}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Rent Yield</p>
                          <p className="text-lg font-semibold">{neighborhood.rentYield}%</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Appreciation</p>
                          <p className="text-lg font-semibold text-green-600">{neighborhood.appreciation}%</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Investment Score</p>
                          <p className="text-lg font-semibold">
                            {(neighborhood.rentYield + neighborhood.appreciation / 2).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {mockMarketData.trends.map((trend) => (
                <Card key={trend.metric}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {trend.trend === "up" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      {trend.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{trend.current}</span>
                        <span
                          className={`text-lg font-medium ${trend.trend === "up" ? "text-green-600" : "text-red-600"}`}
                        >
                          {trend.change}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{trend.forecast}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    12-Month Forecast
                  </CardTitle>
                  <CardDescription>Predicted market conditions for the next year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price Appreciation</span>
                    <span className="font-medium text-green-600">+6.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rental Growth</span>
                    <span className="font-medium text-green-600">+4.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Inventory Change</span>
                    <span className="font-medium text-red-600">-12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interest Rates</span>
                    <span className="font-medium">6.2% - 6.8%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Market Alerts
                  </CardTitle>
                  <CardDescription>Important market developments to watch</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Interest Rate Watch</p>
                      <p className="text-xs text-muted-foreground">Fed meeting next week may impact rates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">New Development</p>
                      <p className="text-xs text-muted-foreground">Major project announced in Downtown area</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Investment Opportunity</p>
                      <p className="text-xs text-muted-foreground">Riverside showing strong rental demand</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
