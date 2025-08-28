"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Home, MapPin, Calendar, Target, AlertTriangle, Plus } from "lucide-react"

// Mock user data
const mockUser = {
  role: "investor" as const,
  name: "Sarah Johnson",
  email: "sarah@example.com",
}

// Mock portfolio data
const mockPortfolio = {
  totalValue: 2450000,
  totalInvested: 1850000,
  totalROI: 32.4,
  monthlyIncome: 18500,
  properties: [
    {
      id: 1,
      address: "123 Rental Street",
      city: "Downtown",
      type: "Multi-family",
      purchasePrice: 450000,
      currentValue: 520000,
      monthlyRent: 3200,
      expenses: 800,
      roi: 15.6,
      occupancy: 100,
      purchaseDate: "2022-03-15",
      image: "/investment-property-1.png",
    },
    {
      id: 2,
      address: "456 Investment Ave",
      city: "Suburbs",
      type: "Single-family",
      purchasePrice: 320000,
      currentValue: 385000,
      monthlyRent: 2400,
      expenses: 600,
      roi: 20.3,
      occupancy: 100,
      purchaseDate: "2021-08-22",
      image: "/investment-property-2.png",
    },
    {
      id: 3,
      address: "789 Commercial Blvd",
      city: "Business District",
      type: "Commercial",
      purchasePrice: 680000,
      currentValue: 750000,
      monthlyRent: 4800,
      expenses: 1200,
      roi: 10.6,
      occupancy: 85,
      purchaseDate: "2023-01-10",
      image: "/investment-property-3.png",
    },
  ],
}

export default function PortfolioPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("12m")

  const totalNetIncome = mockPortfolio.properties.reduce((sum, prop) => sum + (prop.monthlyRent - prop.expenses), 0)
  const averageROI = mockPortfolio.properties.reduce((sum, prop) => sum + prop.roi, 0) / mockPortfolio.properties.length

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
            <p className="text-muted-foreground mt-2">Track and manage your real estate investments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockPortfolio.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.4%</span> from last year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPortfolio.totalROI}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalNetIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Net after expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageROI.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across {mockPortfolio.properties.length} properties</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Properties ({mockPortfolio.properties.length})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="grid gap-6">
              {mockPortfolio.properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="md:flex">
                    {/* Property Image */}
                    <div className="md:w-80 h-48 md:h-auto relative">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">{property.type}</Badge>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{property.address}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {property.city}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            Purchased {new Date(property.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            ${property.currentValue.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Purchased: ${property.purchasePrice.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {property.currentValue > property.purchasePrice ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                property.currentValue > property.purchasePrice ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {(
                                ((property.currentValue - property.purchasePrice) / property.purchasePrice) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Monthly Rent</p>
                          <p className="text-lg font-semibold">${property.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Net Income</p>
                          <p className="text-lg font-semibold">
                            ${(property.monthlyRent - property.expenses).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className="text-lg font-semibold text-green-600">{property.roi}%</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Occupancy</p>
                          <p className="text-lg font-semibold">{property.occupancy}%</p>
                        </div>
                      </div>

                      {/* Occupancy Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                          <span className="text-sm font-medium">{property.occupancy}%</span>
                        </div>
                        <Progress value={property.occupancy} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {property.occupancy < 100 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Vacancy
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
                          </Button>
                          <Button size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Track your investment returns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Invested</span>
                      <span className="font-medium">${mockPortfolio.totalInvested.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Value</span>
                      <span className="font-medium">${mockPortfolio.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Gain</span>
                      <span className="font-medium text-green-600">
                        ${(mockPortfolio.totalValue - mockPortfolio.totalInvested).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Annual Return</span>
                      <span className="font-medium text-green-600">{mockPortfolio.totalROI}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income Distribution</CardTitle>
                  <CardDescription>Monthly rental income by property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPortfolio.properties.map((property) => {
                      const percentage = (property.monthlyRent / mockPortfolio.monthlyIncome) * 100
                      return (
                        <div key={property.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{property.address}</span>
                            <span className="text-sm font-medium">${property.monthlyRent.toLocaleString()}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Single-family", "Multi-family", "Commercial"].map((type) => {
                      const count = mockPortfolio.properties.filter((p) => p.type === type).length
                      const percentage = (count / mockPortfolio.properties.length) * 100
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{type}</span>
                            <span className="text-sm font-medium">{count} properties</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ROI Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPortfolio.properties.map((property) => (
                      <div key={property.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">{property.address}</span>
                          <span className="text-sm font-medium">{property.roi}%</span>
                        </div>
                        <Progress value={property.roi} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Cap Rate</span>
                      <span className="font-medium">8.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cash-on-Cash Return</span>
                      <span className="font-medium">12.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Debt Service Coverage</span>
                      <span className="font-medium">1.35x</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Loan-to-Value</span>
                      <span className="font-medium">72%</span>
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
