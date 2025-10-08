import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Bed, Bath, Square, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { PropertyDetailProps } from "../types"
import dynamic from "next/dynamic"

export default function PropertyDetailView({
  property,
  favorites,
  similarProperties,
  similarPropertiesLoading,
  onBack,
  onToggleFavorite,
  onViewDetails
}: PropertyDetailProps) {

  const PropertyLocationMap = dynamic(() => import('./PropertyLocationMap.tsx'), {
  ssr: false, // This line is crucial
  loading: () => <p>Loading map...</p>
});
  const formatUrl = (url: string | null) => {
    if (!url) return null;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  };

  const formattedUrl = formatUrl(property.property_hyperlink);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Button>

      {/* Property Details Card */}
      <Card className="overflow-hidden">
        {/* Property Image */}
        <div className="relative h-80 w-full">
          <div className="flex h-96 w-full">

            <div className="relative w-[70%]">

              {property.property_image ? (
                <Image
                  src={property.property_image}
                  alt={property.title}
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
            </div>
            <div className="w-[30%] h-full">
                {property.latitude_coordinates && property.longitude_coordinates ? (
                  <PropertyLocationMap 
                    latitude={property.latitude_coordinates} 
                    longitude={property.longitude_coordinates} 
                  />
                ) : (
                  <div>Location not available</div>
                )}
            </div>
          </div>
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm ${
              favorites.has(property.id) ? "text-red-500" : "text-gray-400"
            }`}
            onClick={() => onToggleFavorite(property.id)}
          >
            <Heart className={`h-5 w-5 ${favorites.has(property.id) ? "fill-current" : ""}`} />
          </Button>
        </div>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div>
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                  {property.property_type}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center text-lg">
                <MapPin className="h-4 w-4 mr-2" />
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            {/* Price Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-primary">${property.price.toLocaleString()}</p>
                  <p className="text-muted-foreground">
                    ${Math.round(property.price / property.square_feet)}/sqft
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Built in {property.year_built}
                </div>
              </div>
            </div>

            {/* Property Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg">{property.bedrooms}</p>
                <p className="text-sm text-muted-foreground">Bedrooms</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg">{property.bathrooms}</p>
                <p className="text-sm text-muted-foreground">Bathrooms</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg">{property.square_feet.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Sq Ft</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-lg">{property.year_built}</p>
                <p className="text-sm text-muted-foreground">Year Built</p>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Property Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
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

      {/* Similar Properties Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
        
        {similarPropertiesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
        ) : similarProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similarProperties.map((similarProperty) => {
              const similarFormattedUrl = formatUrl(similarProperty.property_hyperlink);
              
              return (
                <Card key={similarProperty.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {similarProperty.property_image ? (
                      <div className="h-48 relative">
                        <Image
                          src={similarProperty.property_image}
                          alt={similarProperty.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    {similarProperty.similarity_score && (
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        {Math.round(similarProperty.similarity_score * 100)}% Match
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 ${
                        favorites.has(similarProperty.id) ? "text-red-500" : "text-gray-400"
                      }`}
                      onClick={() => onToggleFavorite(similarProperty.id)}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(similarProperty.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{similarProperty.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {similarProperty.address}, {similarProperty.city}, {similarProperty.state}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {similarProperty.bedrooms} bed
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {similarProperty.bathrooms} bath
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          {similarProperty.square_feet?.toLocaleString()} sqft
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${similarProperty.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Math.round(similarProperty.price / similarProperty.square_feet)}/sqft
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {similarProperty.property_type}
                        </Badge>
                      </div>

                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => onViewDetails(similarProperty)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No similar properties found</h3>
              <p>Try adjusting your search filters to see more results.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}