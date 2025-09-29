"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Heart, MapPin, Bed, Bath, Square, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
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
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")

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

  // Function to show property details
  const showPropertyDetails = (property: Property) => {
    setSelectedProperty(property)
    setViewMode("detail")
  }

  // Function to go back to property list
  const backToList = () => {
    setViewMode("list")
    setSelectedProperty(null)
  }

  // Property Details View
  const PropertyDetailView = () => {
    if (!selectedProperty) return null;

    const formattedUrl = formatUrl(selectedProperty.property_hyperlink);

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={backToList}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>

        {/* Property Details Card */}
        <Card className="overflow-hidden">
          {/* Property Image */}
          <div className="relative h-80 w-full">
            {selectedProperty.property_image ? (
              <Image
                src={selectedProperty.property_image}
                alt={selectedProperty.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg">No Image Available</p>
                </div>
              </div>
            )}
            
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm ${
                favorites.has(selectedProperty.id) ? "text-red-500" : "text-gray-400"
              }`}
              onClick={() => toggleFavorite(selectedProperty.id)}
            >
              <Heart className={`h-5 w-5 ${favorites.has(selectedProperty.id) ? "fill-current" : ""}`} />
            </Button>
          </div>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div>
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <h1 className="text-3xl font-bold">{selectedProperty.title}</h1>
                  <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                    {selectedProperty.property_type}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center text-lg">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                </p>
              </div>

              {/* Price Section */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">${selectedProperty.price.toLocaleString()}</p>
                    <p className="text-muted-foreground">
                      ${Math.round(selectedProperty.price / selectedProperty.square_feet)}/sqft
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Built in {selectedProperty.year_built}
                  </div>
                </div>
              </div>

              {/* Property Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-lg">{selectedProperty.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-lg">{selectedProperty.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-lg">{selectedProperty.square_feet.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Sq Ft</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-lg">{selectedProperty.year_built}</p>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Property Description</h2>
                <p className="text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90 py-3 text-lg">
                  Contact Agent
                </Button>
                {formattedUrl && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 py-3 text-lg"
                  >
                    <a 
                      href={formattedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Visit Property Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Property List View
  const PropertyListView = () => (
    <div className="space-y-6">
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
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
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
                          onClick={() => showPropertyDetails(property)}
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Search</h1>
        <p className="text-muted-foreground mt-2">Find your perfect home with advanced search filters</p>
      </div>

      {/* Conditionally render list view or detail view */}
      {viewMode === "list" ? <PropertyListView /> : <PropertyDetailView />}
    </div>
  )
}