"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import PropertyListView from "./components/PropertyListView"
import PropertyDetailView from "./components/PropertyDetailView"
import { getSimilarProperties } from "@/lib/recommendation"
import { Property } from "./types"

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [similarPropertiesLoading, setSimilarPropertiesLoading] = useState(false)
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
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("property_id", propertyId)
      setFavorites((prev) => {
        const newSet = new Set(prev)
        newSet.delete(propertyId)
        return newSet
      })
    } else {
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

  // Function to show property details and fetch similar properties
  const showPropertyDetails = async (property: Property) => {
    setSelectedProperty(property)
    setViewMode("detail")
    setSimilarPropertiesLoading(true)
    
    try {
      // Prepare filters based on current search state
      const filters = {
        city: searchCity || undefined,
        property_type: propertyType !== "any" ? propertyType : undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        min_bedrooms: minBedrooms !== "any" ? minBedrooms : undefined,
        min_bathrooms: minBathrooms !== "any" ? minBathrooms : undefined
      }

      const response = await getSimilarProperties(property.id, filters, 6)
      setSimilarProperties(response.similar_properties)
    } catch (error) {
      console.error("Error fetching similar properties:", error)
      setSimilarProperties([])
    } finally {
      setSimilarPropertiesLoading(false)
    }
  }

  // Function to go back to property list
  const backToList = () => {
    setViewMode("list")
    setSelectedProperty(null)
    setSimilarProperties([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Search</h1>
        <p className="text-muted-foreground mt-2">Find your perfect home with advanced search filters</p>
      </div>

      {/* Conditionally render list view or detail view */}
      {viewMode === "list" ? (
        <PropertyListView
          properties={properties}
          loading={loading}
          favorites={favorites}
          searchCity={searchCity}
          propertyType={propertyType}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minBedrooms={minBedrooms}
          minBathrooms={minBathrooms}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
          onSearchCityChange={setSearchCity}
          onPropertyTypeChange={setPropertyType}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onMinBedroomsChange={setMinBedrooms}
          onMinBathroomsChange={setMinBathrooms}
          onToggleFavorite={toggleFavorite}
          onViewDetails={showPropertyDetails}
        />
      ) : (
        selectedProperty && (
          <PropertyDetailView
            property={selectedProperty}
            favorites={favorites}
            similarProperties={similarProperties}
            similarPropertiesLoading={similarPropertiesLoading}
            onBack={backToList}
            onToggleFavorite={toggleFavorite}
            onViewDetails={showPropertyDetails}
          />
        )
      )}
    </div>
  )
}