"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Bed, Bath, Square, Star, TrendingUp, Calendar, Eye, Trash2, Share } from "lucide-react"

// Mock user data
const mockUser = {
  role: "buyer" as const,
  name: "John Doe",
  email: "john@example.com",
}

// Mock saved properties
const mockSavedProperties = [
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
    savedDate: "2024-01-15",
    priceHistory: [
      { date: "2024-01-01", price: 435000 },
      { date: "2024-01-15", price: 425000 },
    ],
    notes: "Love the kitchen renovation and location near downtown",
  },
  {
    id: 2,
    address: "789 Elm Drive",
    city: "Riverside",
    price: 520000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "/riverside-condo.png",
    status: "Hot",
    aiScore: 95,
    savedDate: "2024-01-10",
    priceHistory: [{ date: "2024-01-10", price: 520000 }],
    notes: "Amazing water views, but might be too small for future family",
  },
]

const mockRecentlyViewed = [
  {
    id: 3,
    address: "456 Pine Avenue",
    city: "Suburbs",
    price: 380000,
    beds: 4,
    baths: 3,
    sqft: 2100,
    image: "/suburban-family-home.png",
    viewedDate: "2024-01-20",
  },
  {
    id: 4,
    address: "321 Maple Street",
    city: "Westside",
    price: 295000,
    beds: 2,
    baths: 1,
    sqft: 950,
    image: "/cozy-starter-home.png",
    viewedDate: "2024-01-19",
  },
]

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState(mockSavedProperties)

  const removeSaved = (propertyId: number) => {
    setSavedProperties((prev) => prev.filter((property) => property.id !== propertyId))
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

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saved Properties</h1>
          <p className="text-muted-foreground mt-2">Keep track of properties you're interested in</p>
        </div>

        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="saved">Saved Properties ({savedProperties.length})</TabsTrigger>
            <TabsTrigger value="recent">Recently Viewed ({mockRecentlyViewed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            {savedProperties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No saved properties yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start saving properties you're interested in to keep track of them here
                  </p>
                  <Button>Browse Properties</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {savedProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="md:flex">
                      {/* Property Image */}
                      <div className="md:w-80 h-48 md:h-auto relative">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.address}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800">
                          Saved {new Date(property.savedDate).toLocaleDateString()}
                        </Badge>
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

                        {/* Price History */}
                        {property.priceHistory.length > 1 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                Price dropped by $
                                {(property.priceHistory[0].price - property.priceHistory[1].price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {property.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground italic">"{property.notes}"</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Tour
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSaved(property.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockRecentlyViewed.map((property) => (
                <Card key={property.id}>
                  <div className="relative">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.address}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800">
                      Viewed {new Date(property.viewedDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{property.address}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {property.city}
                    </p>
                    <p className="text-lg font-bold text-foreground mb-2">${property.price.toLocaleString()}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span>{property.beds} beds</span>
                      <span>{property.baths} baths</span>
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        View Again
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
