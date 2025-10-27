"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import PropertyListView from "@/app/dashboard/search/components/PropertyListView"
import PropertyDetailView from "@/app/dashboard/search/components/PropertyDetailView"
import { getSimilarProperties } from "@/lib/recommendation"
import { Property } from "./types"

const USER_ACTIVITY_HISTORY_KEY = 'user_activity_history';
const MAX_HISTORY_LENGTH = 10;

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [similarPropertiesLoading, setSimilarPropertiesLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Filter states
  const [searchCity, setSearchCity] = useState("")
  const [propertyType, setPropertyType] = useState("any")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minBedrooms, setMinBedrooms] = useState("any")
  const [minBathrooms, setMinBathrooms] = useState("any")

  // AI Search states
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const supabase = createClient()

  // --- LocalStorage and History Management ---
  const saveUserActivity = useCallback((activity: { type: 'search', query: string } | { type: 'click', city: string, bedrooms: number, bathrooms: number }) => {
    try {
      const history = JSON.parse(localStorage.getItem(USER_ACTIVITY_HISTORY_KEY) || '[]');
      const newHistory = [activity, ...history];
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);
      localStorage.setItem(USER_ACTIVITY_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("Failed to save user activity:", error);
    }
  }, []);

  // --- Data Fetching Functions ---
  const handleAiSearch = async () => {
    if (!aiQuery) return;
    setIsAiLoading(true);
    setAiError(null);
    saveUserActivity({ type: 'search', query: aiQuery });

    try {
      const response = await fetch('https://real-estate-insight.duckdns.org/api/query/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'AI search failed');
      }

      const result = await response.json();
      setProperties(result.data || []);
      if (!result.data || result.data.length === 0) {
        setAiError("No properties found for your query.");
      }
    } catch (error) {
      console.error('Error during AI search:', error);
      setAiError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchRandomProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_random_properties', { limit_count: 15 });
    if (data) {
      setProperties(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchRecommendationsOrRandom = async () => {
      if (!isInitialLoad) return;
      
      setLoading(true);
      try {
        const historyStr = localStorage.getItem(USER_ACTIVITY_HISTORY_KEY);
        const history = historyStr ? JSON.parse(historyStr) : [];

        if (history.length > 0) {
          const latestPropertyId = history[0].id;
          const response = await fetch('http://34.72.69.249:8011/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
      property_id: latestPropertyId,
      limit: 10 // You can also add other expected fields like limit
    }),
          });

          if (!response.ok) throw new Error("Failed to fetch recommendations");

          const result = await response.json();
          if (result.data && result.data.length > 0) {
             setProperties(result.data);
          } else {
             // If recommendations return empty, fetch random ones
             await fetchRandomProperties();
          }
        } else {
          // New user or no history, fetch random properties
          await fetchRandomProperties();
        }
      } catch (error) {
        console.error("Failed to fetch initial properties:", error);
        await fetchRandomProperties(); // Fallback to random on any error
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchRecommendationsOrRandom();
    fetchFavorites();
  }, [isInitialLoad, saveUserActivity]);

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase.from("properties").select("*").eq("listing_status", "active");

    if (searchCity) {
      query = query.ilike("city", `%${searchCity}%`);
    }
    if (propertyType !== "any") {
      query = query.eq("property_type", propertyType);
    }
    if (minPrice) {
      query = query.gte("price", Number.parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", Number.parseInt(maxPrice));
    }
    if (minBedrooms !== "any") {
      query = query.gte("bedrooms", Number.parseInt(minBedrooms));
    }
    if (minBathrooms !== "any") {
      query = query.gte("bathrooms", Number.parseFloat(minBathrooms));
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (!error && data) {
      setProperties(data as Property[]);
    }
    setLoading(false);
  };


  const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data } = await supabase.from("user_favorites").select("property_id").eq("user_id", user.id);
          if (data) {
              setFavorites(new Set(data.map((fav) => fav.property_id)));
          }
      }
  };
  const toggleFavorite = async (propertyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (favorites.has(propertyId)) {
          await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
          setFavorites(prev => {
              const newSet = new Set(prev);
              newSet.delete(propertyId);
              return newSet;
          });
      } else {
          await supabase.from("user_favorites").insert({ user_id: user.id, property_id: propertyId });
          setFavorites(prev => new Set(prev).add(propertyId));
      }
  };
  const handleSearch = () => { fetchProperties() };
  const clearFilters = () => {
    setSearchCity("");
    setPropertyType("any");
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("any");
    setMinBathrooms("any");
    fetchProperties();
  };

  const showPropertyDetails = async (property: Property) => {
    // Save the click interaction to localStorage
    saveUserActivity({
      type: 'click',
      city: property.city,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
    });
    
    setSelectedProperty(property);
    setViewMode("detail");
    setSimilarPropertiesLoading(true);
    try {
      const response = await getSimilarProperties(property.id, {}, 6);
      setSimilarProperties(response.similar_properties);
    } catch (error) {
      console.error("Error fetching similar properties:", error);
      setSimilarProperties([]);
    } finally {
      setSimilarPropertiesLoading(false);
    }
  };
  const backToList = () => { 
    setViewMode("list");
    setSelectedProperty(null);
    setSimilarProperties([]);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Property Search</h1>
        <p className="text-muted-foreground mt-2">Find your perfect home with advanced search filters or our new AI assistant.</p>
      </div>

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
          setProperties={setProperties}
          aiQuery={aiQuery}
          setAiQuery={setAiQuery}
          isAiLoading={isAiLoading}
          aiError={aiError}
          onAiSearch={handleAiSearch}
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

