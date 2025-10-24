import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Square, Calendar, ExternalLink, Loader2, Filter, Sparkles } from "lucide-react";
import Image from "next/image";
import { PropertySearchProps, Property } from "../types";
import { useState } from 'react';

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
  onViewDetails,
  setProperties
}: PropertySearchProps & { setProperties: (properties: Property[]) => void }) {
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filter visibility

  const handleAiSearch = async () => {
    if (!aiQuery) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('http://localhost:8010/query', { // Your Python agent URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });

      if (!response.ok) {
        throw new Error(`AI search failed with status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        setProperties(result.data);
      } else {
        setProperties([]);
        setAiError(result.error || "No results found.");
      }
    } catch (error) {
      console.error('Error fetching data from SQL agent:', error);
      setAiError("Failed to connect to the AI search service.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatUrl = (url: string | null) => {
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-6">
      {/* AI Search Section - Now at the top */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI-Powered Search
          </CardTitle>
          <CardDescription>Use natural language to find properties instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="ai-query"
              placeholder="e.g., Show me houses in Austin with at least 3 bedrooms under $500k"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              disabled={isAiLoading}
              className="flex-1"
            />
            <Button onClick={handleAiSearch} disabled={isAiLoading} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              {isAiLoading ? <Loader2 className="animate-spin" /> : "Search with AI"}
            </Button>
          </div>
          {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
        </CardContent>
      </Card>

      {/* Collapsible Search Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Filter Properties</CardTitle>
            <CardDescription>Refine your search with specific criteria.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show More Filters'}
          </Button>
        </CardHeader>

        {showFilters && (
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
                    <SelectValue placeholder="Any type"/>
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
                    <SelectValue placeholder="Any"/>
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
                    <SelectValue placeholder="Any"/>
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
        )}
      </Card>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{loading || isAiLoading ? "Loading..." : `${properties.length} Properties Found`}</h2>
        </div>

        {loading || isAiLoading ? (
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
              );
            })}
          </div>
        )}

        {!loading && !isAiLoading && properties.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p>Try adjusting your search filters or using the AI search.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
