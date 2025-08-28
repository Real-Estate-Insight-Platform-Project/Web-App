"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Heart, MapPin, Bed, Bath, Square, Star, Car, Wifi, Dumbbell } from "lucide-react"

// Mock user data
const mockUser = {
  role: "buyer" as const,
  name: "John Doe",
  email: "john@example.com",
}

// Mock property data
const mockProperties = [
  {
    id: 1,
    address: "123 Oak Street",
    city: "Downtown",
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    image: "/modern-house-exterior.png",
    status: "New",
    aiScore: 92,
    features: ["Parking", "WiFi", "Gym"],
    description: "Beautiful modern home in prime downtown location with updated kitchen and hardwood floors.",
  },
  {
    id: 2,
    address: "456 Pine Avenue",
    city: "Suburbs",
    price: 380000,
    beds: 4,
    baths: 3,
    sqft: 2100,
    image: "/suburban-family-home.png",
    status: "Price Drop",
    aiScore: 88,
    features: ["Parking", "Gym"],
    description: "Spacious family home with large backyard, perfect for growing families.",
  },
  {
    id: 3,
    address: "789 Elm Drive",
    city: "Riverside",
    price: 520000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "/riverside-condo.png",
    status: "Hot",
    aiScore: 95,
    features: ["WiFi", "Gym"],
    description: "Luxury riverside condo with stunning water views and premium amenities.",
  },
]

export default function PropertySearchPage() {
  const [priceRange, setPriceRange] = useState([200000, 600000])
  const [searchQuery, setSearchQuery] = useState("")
  const [savedProperties, setSavedProperties] = useState<number[]>([])

  const toggleSaved = (propertyId: number) => {
    setSavedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId],
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Hot":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Price Drop":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "Parking":
        return <Car className="h-3 w-3" />
      case "WiFi":
        return <Wifi className="h-3 w-3" />
      case "Gym":
        return <Dumbbell className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Search</h1>
          <p className="text-muted-foreground mt-2">Find your perfect home with AI-powered recommendations</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Search */}
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="City, neighborhood, or ZIP"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
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
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {mockProperties.length} properties • Sorted by AI Match Score
              </p>
              <Select defaultValue="ai-score">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-score">AI Match Score</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Cards */}
            <div className="space-y-4">
              {mockProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="md:flex">
                    {/* Property Image */}
                    <div className="md:w-80 h-48 md:h-auto relative">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleSaved(property.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            savedProperties.includes(property.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{property.address}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {property.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">${property.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{property.aiScore}</span>
                              <span className="text-muted-foreground">AI Match</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.beds} beds
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.baths} baths
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {property.sqft.toLocaleString()} sqft
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{property.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {property.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {getFeatureIcon(feature)}
                              <span className="ml-1">{feature}</span>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
                          </Button>
                          <Button size="sm">Schedule Tour</Button>
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
