"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Percent,
  Calculator,
  Star,
  Filter,
  Search,
  Bookmark,
  Eye,
  AlertTriangle,
} from "lucide-react"

// Mock user data
const mockUser = {
  role: "investor" as const,
  name: "Sarah Johnson",
  email: "sarah@example.com",
}

// Mock investment opportunities
const mockOpportunities = [
  {
    id: 1,
    address: "234 Investment Lane",
    city: "Emerging District",
    price: 385000,
    type: "Single-family",
    estimatedRent: 2800,
    capRate: 8.7,
    roi: 22.4,
    cashFlow: 1200,
    appreciation: 15.2,
    riskScore: 6.8,
    aiScore: 94,
    image: "/opportunity-1.png",
    highlights: ["Below Market Price", "High Rental Demand", "Gentrifying Area"],
    description: "Renovated single-family home in rapidly developing neighborhood with strong rental fundamentals.",
  },
  {
    id: 2,
    address: "567 Duplex Drive",
    city: "Rental District",
    price: 520000,
    type: "Multi-family",
    estimatedRent: 4200,
    capRate: 9.7,
    roi: 18.6,
    cashFlow: 1800,
    appreciation: 8.9,
    riskScore: 4.2,
    aiScore: 91,
    image: "/opportunity-2.png",
    highlights: ["Stable Tenants", "Low Maintenance", "Prime Location"],
    description: "Well-maintained duplex with long-term tenants in established rental market.",
  },
  {
    id: 3,
    address: "890 Commercial Plaza",
    city: "Business Hub",
    price: 750000,
    type: "Commercial",
    estimatedRent: 6500,
    capRate: 10.4,
    roi: 15.8,
    cashFlow: 2200,
    appreciation: 6.3,
    riskScore: 7.5,
    aiScore: 88,
    image: "/opportunity-3.png",
    highlights: ["Triple Net Lease", "Corporate Tenant", "Long-term Contract"],
    description: "Commercial property with established business tenant on long-term lease agreement.",
  },
]

export default function OpportunitiesPage() {
  const [priceRange, setPriceRange] = useState([200000, 800000])
  const [minROI, setMinROI] = useState([15])
  const [savedOpportunities, setSavedOpportunities] = useState<number[]>([])

  const toggleSaved = (opportunityId: number) => {
    setSavedOpportunities((prev) =>
      prev.includes(opportunityId) ? prev.filter((id) => id !== opportunityId) : [...prev, opportunityId],
    )
  }

  const getRiskColor = (score: number) => {
    if (score <= 4) return "text-green-600"
    if (score <= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Single-family":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Multi-family":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Commercial":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Opportunities</h1>
          <p className="text-muted-foreground mt-2">AI-curated investment properties with high return potential</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Investment Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Search */}
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City or neighborhood" className="pl-10" />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label>Price Range</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000000}
                  min={100000}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single-family</SelectItem>
                    <SelectItem value="multi">Multi-family</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum ROI */}
              <div className="space-y-3">
                <Label>Minimum ROI: {minROI[0]}%</Label>
                <Slider value={minROI} onValueChange={setMinROI} max={30} min={5} step={1} className="w-full" />
              </div>

              {/* Investment Strategy */}
              <div className="space-y-2">
                <Label>Strategy</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashflow">Cash Flow</SelectItem>
                    <SelectItem value="appreciation">Appreciation</SelectItem>
                    <SelectItem value="value-add">Value-Add</SelectItem>
                    <SelectItem value="fix-flip">Fix & Flip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>

          {/* Opportunities List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {mockOpportunities.length} opportunities • Sorted by AI Score
              </p>
              <Select defaultValue="ai-score">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-score">AI Score</SelectItem>
                  <SelectItem value="roi">ROI: High to Low</SelectItem>
                  <SelectItem value="cap-rate">Cap Rate</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opportunity Cards */}
            <div className="space-y-4">
              {mockOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="overflow-hidden">
                  <div className="md:flex">
                    {/* Property Image */}
                    <div className="md:w-80 h-48 md:h-auto relative">
                      <img
                        src={opportunity.image || "/placeholder.svg"}
                        alt={opportunity.address}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleSaved(opportunity.id)}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            savedOpportunities.includes(opportunity.id)
                              ? "fill-blue-500 text-blue-500"
                              : "text-gray-600"
                          }`}
                        />
                      </Button>
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge className={getTypeColor(opportunity.type)}>{opportunity.type}</Badge>
                        <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{opportunity.aiScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{opportunity.address}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opportunity.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">${opportunity.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Est. Rent: ${opportunity.estimatedRent.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Percent className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-muted-foreground">ROI</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">{opportunity.roi}%</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Calculator className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-muted-foreground">Cap Rate</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600">{opportunity.capRate}%</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-muted-foreground">Cash Flow</span>
                          </div>
                          <p className="text-lg font-bold text-purple-600">${opportunity.cashFlow}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-orange-600" />
                            <span className="text-xs text-muted-foreground">Appreciation</span>
                          </div>
                          <p className="text-lg font-bold text-orange-600">{opportunity.appreciation}%</p>
                        </div>
                      </div>

                      {/* Risk Score */}
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Risk Score:</span>
                        <span className={`font-medium ${getRiskColor(opportunity.riskScore)}`}>
                          {opportunity.riskScore}/10
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {opportunity.highlights.map((highlight) => (
                          <Badge key={highlight} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{opportunity.description}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>AI-analyzed opportunity</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Analysis
                          </Button>
                          <Button size="sm">Contact Agent</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
