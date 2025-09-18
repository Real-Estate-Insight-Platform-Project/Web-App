"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Heart, MapPin, Bed, Bath, Square, Calendar, Trash2 } from "lucide-react"
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
  property_image:string|null
}

interface Favorite {
  id: string
  property_id: string
  created_at: string
  properties: Property
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from("user_favorites")
        .select(`
          id,
          property_id,
          created_at,
          properties (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setFavorites(data as Favorite[])
      }
    }
    setLoading(false)
  }

  const removeFavorite = async (favoriteId: string, propertyId: string) => {
    const { error } = await supabase.from("user_favorites").delete().eq("id", favoriteId)

    if (!error) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Properties</h1>
        <p className="text-muted-foreground mt-2">Properties you've saved for later review</p>
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
      ) : favorites.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{favorites.length} saved properties</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const property = favorite.properties
              return (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {property.property_image ? (
                      <div className="h-48 relative">
                        <Image
                          src={property.property_image}
                          alt={property.title}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                      onClick={() => removeFavorite(favorite.id, property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Saved
                      </Badge>
                    </div>
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

                      <div className="text-xs text-muted-foreground">
                        Saved on {new Date(favorite.created_at).toLocaleDateString()}
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
            <p className="mb-4">Start saving properties you're interested in to see them here.</p>
            <Button className="bg-primary hover:bg-primary/90">Browse Properties</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
