import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Bed, Bath, Square, Calendar, ExternalLink } from "lucide-react"
import Image from "next/image"
import { PropertySearchProps } from "../types"

export default function PropertyListView({
  properties,
  loading,
  favorites,
  searchCity,
  propertyType,
  minPrice,
  maxPrice,
  minBedrooms,
  minBathrooms,
  onSearch,
  onClearFilters,
  onSearchCityChange,
  onPropertyTypeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMinBedroomsChange,
  onMinBathroomsChange,
  onToggleFavorite,
  onViewDetails
}: PropertySearchProps) {

  // Function to validate and format URLs
  const formatUrl = (url: string | null) => {
    if (!url) return null;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  };

  return (
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
                onChange={(e) => onSearchCityChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-type">Property Type</Label>
              <Select value={propertyType} onValueChange={onPropertyTypeChange}>
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
                onChange={(e) => onMinPriceChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-price">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                placeholder="No limit"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-bedrooms">Min Bedrooms</Label>
              <Select value={minBedrooms} onValueChange={onMinBedroomsChange}>
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
              <Select value={minBathrooms} onValueChange={onMinBathroomsChange}>
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
            <Button onClick={onSearch} className="bg-primary hover:bg-primary/90">
              Search Properties
            </Button>
            <Button variant="outline" onClick={onClearFilters} className="bg-transparent">
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
                      onClick={() => onToggleFavorite(property.id)}
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
                          onClick={() => onViewDetails(property)}
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
}