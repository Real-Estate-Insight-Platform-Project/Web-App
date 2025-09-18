"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Heart, MapPin, Bed, Bath, Square, Calendar, ExternalLink, X } from "lucide-react"
import Image from "next/image"

interface Property {
  id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  state: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  year_built: number
  listing_status: string
  property_image: string | null
  property_hyperlink: string | null
}

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Search filters
  const [searchCity, setSearchCity] = useState("")
  const [propertyType, setPropertyType] = useState("any")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minBedrooms, setMinBedrooms] = useState("any")
  const [minBathrooms, setMinBathrooms] = useState("any")

  const supabase = createClient()

  useEffect(() => {
    fetchProperties()
    fetchFavorites()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    let query = supabase.from("properties").select("*").eq("listing_status", "active")

    if (searchCity) {
      query = query.ilike("city", `%${searchCity}%`)
    }
    if (propertyType !== "any") {
      query = query.eq("property_type", propertyType)
    }
    if (minPrice) {
      query = query.gte("price", Number.parseInt(minPrice))
    }
    if (maxPrice) {
      query = query.lte("price", Number.parseInt(maxPrice))
    }
    if (minBedrooms !== "any") {
      query = query.gte("bedrooms", Number.parseInt(minBedrooms))
    }
    if (minBathrooms !== "any") {
      query = query.gte("bathrooms", Number.parseFloat(minBathrooms))
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (!error && data) {
      setProperties(data)
    }
    setLoading(false)
  }

  const fetchFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("user_favorites").select("property_id").eq("user_id", user.id)
      if (data) {
        setFavorites(new Set(data.map((fav) => fav.property_id)))
      }
    }
  }

  const toggleFavorite = async (propertyId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (favorites.has(propertyId)) {
      // Remove from favorites
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("property_id", propertyId)
      setFavorites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    } else {
      // Add to favorites
      await supabase.from("user_favorites").insert({ user_id: user.id, property_id: propertyId })
      setFavorites((prev) => new Set(prev).add(propertyId))
    }
  }

  const handleSearch = () => {
    fetchProperties()
  }

  const clearFilters = () => {
    setSearchCity("")
    setPropertyType("any")
    setMinPrice("")
    setMaxPrice("")
    setMinBedrooms("any")
    setMinBathrooms("any")
    fetchProperties()
  }

  // Function to validate and format URLs
  const formatUrl = (url: string | null) => {
    if (!url) return null;
    
    // Ensure the URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  };

  // Function to open modal with property details
  const openPropertyModal = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  // Function to close modal
  const closePropertyModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Search</h1>
        <p className="text-muted-foreground mt-2">Find your perfect home with advanced search filters</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Narrow down your search to find the perfect property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city name"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-type">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-price">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-price">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="No limit"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-bedrooms">Min Bedrooms</Label>
              <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-bathrooms">Min Bathrooms</Label>
              <Select value={minBathrooms} onValueChange={setMinBathrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="1.5">1.5+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="2.5">2.5+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
              Search Properties
            </Button>
            <Button variant="outline" onClick={clearFilters} className="bg-transparent">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{loading ? "Loading..." : `${properties.length} Properties Found`}</h2>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const formattedUrl = formatUrl(property.property_hyperlink);
              
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {property.property_image ? (
                      <div className="h-48 relative">
                        <Image
                          src={property.property_image}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            // You might want to show the placeholder div instead
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No Image Available</p>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 ${
                        favorites.has(property.id) ? "text-red-500" : "text-gray-400"
                      }`}
                      onClick={() => toggleFavorite(property.id)}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(property.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}, {property.city}, {property.state}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms} bed
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {property.bathrooms} bath
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          {property.square_feet?.toLocaleString()} sqft
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${property.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Math.round(property.price / property.square_feet)}/sqft
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {property.property_type}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Built in {property.year_built}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => openPropertyModal(property)}
                        >
                          View Details
                        </Button>
                        {formattedUrl && (
                          <Button 
                            asChild 
                            variant="outline" 
                            className="flex-initial"
                            title="Go to property website"
                          >
                            <a 
                              href={formattedUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p>Try adjusting your search filters to see more results.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Property Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background backdrop:blur-sm">
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={closePropertyModal}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {selectedProperty && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProperty.title}</DialogTitle>
                <DialogDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                </DialogDescription>
              </DialogHeader>

              <div className="relative h-64 w-full rounded-lg overflow-hidden">
                {selectedProperty.property_image ? (
                  <Image
                    src={selectedProperty.property_image}
                    alt={selectedProperty.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>No Image Available</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Property Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-2" />
                      <span>{selectedProperty.bedrooms} bedrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-2" />
                      <span>{selectedProperty.bathrooms} bathrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-2" />
                      <span>{selectedProperty.square_feet?.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Built in {selectedProperty.year_built}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Pricing Information</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">${selectedProperty.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      ${Math.round(selectedProperty.price / selectedProperty.square_feet)}/sqft
                    </p>
                    <Badge variant="secondary" className="capitalize mt-2">
                      {selectedProperty.property_type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">{selectedProperty.description}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90">Contact Agent</Button>
                {formatUrl(selectedProperty.property_hyperlink) && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1"
                  >
                    <a 
                      href={formatUrl(selectedProperty.property_hyperlink) as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Property Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}