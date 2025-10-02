export interface Property {
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
  latitude?: number
  longitude?: number
  similarity_score?: number
}

export interface PropertySearchProps {
  properties: Property[]
  loading: boolean
  favorites: Set<string>
  searchCity: string
  propertyType: string
  minPrice: string
  maxPrice: string
  minBedrooms: string
  minBathrooms: string
  onSearch: () => void
  onClearFilters: () => void
  onSearchCityChange: (value: string) => void
  onPropertyTypeChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onMinBedroomsChange: (value: string) => void
  onMinBathroomsChange: (value: string) => void
  onToggleFavorite: (propertyId: string) => void
  onViewDetails: (property: Property) => void
}

export interface PropertyDetailProps {
  property: Property
  favorites: Set<string>
  similarProperties: Property[]
  similarPropertiesLoading: boolean
  onBack: () => void
  onToggleFavorite: (propertyId: string) => void
  onViewDetails: (property: Property) => void
}

export interface RecommendationRequest {
  property_id: string
  filters?: {
    city?: string
    property_type?: string
    min_price?: string
    max_price?: string
    min_bedrooms?: string
    min_bathrooms?: string
  }
  limit?: number
}