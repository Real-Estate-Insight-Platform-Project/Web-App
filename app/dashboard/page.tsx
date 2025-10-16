"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Home, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Timer, Map, MapPin, ThumbsUp, PiggyBank } from "lucide-react"
import { useEffect, useState } from "react"

interface Property {
  id: string
  title: string
  city: string
  state: string
  property_type: string
  bedrooms: number
  bathrooms: number
  price: number
  square_feet: number
}

interface MarketData {
  avg_price: number
  market_trend: string
  price_per_sqft: number
  days_on_market: number
}

interface StateData {
  state: string
  median_listing_price: number
  median_listing_price_mm: number
  median_days_on_market: number
}

interface CountyData {
  county_name: string
  state: string
  median_listing_price: number
  median_listing_price_mm: number
  median_days_on_market: number
}

interface BuyerInsights {
  mostAffordableState: StateData | null
  mostAffordableCounty: CountyData | null
  priceDroppingStates: StateData[]
  priceDroppingCounties: CountyData[]
  fastSellingStates: StateData[]
  fastSellingCounties: CountyData[]
  buyerFriendlyCounties: CountyData[]
}

interface UserProfile {
  user_role: string
  full_name: string
}

interface User {
  email: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [buyerInsights, setBuyerInsights] = useState<BuyerInsights>({
    mostAffordableState: null,
    mostAffordableCounty: null,
    priceDroppingStates: [],
    priceDroppingCounties: [],
    fastSellingStates: [],
    fastSellingCounties: [],
    buyerFriendlyCounties: []
  })
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user and profile data using Supabase client-side
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        
        const { data: { user: userData } } = await supabase.auth.getUser()
        if (!userData) {
          window.location.href = "/auth/login"
          return
        }
        setUser(userData as User)
        
        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_role, full_name")
          .eq("id", userData.id)
          .single()
        setProfile(profileData as UserProfile)
        
        // Fetch properties
        const { data: propertiesData } = await supabase
          .from("properties")
          .select("*")
          .limit(3)
        setProperties(propertiesData as Property[] || [])
        
        // Fetch market data
        const { data: marketDataRes } = await supabase
          .from("market_analytics")
          .select("*")
          .eq("city", "Austin")
          .order("month_year", { ascending: false })
          .limit(1)
          .single()
        setMarketData(marketDataRes as MarketData)
        
        // Fetch buyer insights from our new API endpoint
        if (profileData?.user_role === "buyer") {
          const response = await fetch("/api/dashboard")
          if (response.ok) {
            const insightsData = await response.json()
            setBuyerInsights(insightsData as BuyerInsights)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded-md animate-pulse w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded-md animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  const userRole = profile?.user_role || "buyer"
  const userName = profile?.full_name || user?.email?.split("@")[0]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground mt-2">
          {userRole === "buyer"
            ? "Here's what's happening in your local real estate market."
            : "Track your investments and discover new opportunities."}
        </p>
      </div>

      {userRole === "buyer" ? (
        // Buyer-focused market insights
        <div className="space-y-6">
          {/* Top Row - Most Affordable State & County */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Most Affordable State</CardTitle>
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {buyerInsights.mostAffordableState ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800">{buyerInsights.mostAffordableState.state}</h3>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Best Value
                      </Badge>
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        Median price: ${buyerInsights.mostAffordableState.median_listing_price?.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Data not available</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Most Affordable County</CardTitle>
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {buyerInsights.mostAffordableCounty ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {buyerInsights.mostAffordableCounty.county_name} County
                    </h3>
                    <p className="text-sm text-muted-foreground">{buyerInsights.mostAffordableCounty.state}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Best Value
                      </Badge>
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        Median price: ${buyerInsights.mostAffordableCounty.median_listing_price?.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Data not available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Drop Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>States with Biggest Price Drops</CardTitle>
                <CardDescription>Best opportunities for value purchases</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-1">
                  {buyerInsights.priceDroppingStates.map((state: StateData, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span>{Math.abs(state.median_listing_price_mm).toFixed(3)}%</span>
                      </div>
                    </div>
                  ))}
                  
                  {buyerInsights.priceDroppingStates.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No price drop data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Counties with Biggest Price Drops</CardTitle>
                <CardDescription>Local markets with decreasing prices</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-1">
                  {buyerInsights.priceDroppingCounties.map((county: CountyData, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{county.county_name} County</span>
                        <div className="text-xs text-muted-foreground">{county.state}</div>
                      </div>
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span>{Math.abs(county.median_listing_price_mm).toFixed(3)}%</span>
                      </div>
                    </div>
                  ))}
                  
                  {buyerInsights.priceDroppingCounties.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No price drop data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fast Selling Markets */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fast-Moving State Markets</CardTitle>
                <CardDescription>Where properties sell quickest</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-1">
                  {buyerInsights.fastSellingStates.map((state: StateData, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="h-4 w-4 text-amber-500" />
                        <span>{state.median_days_on_market} days</span>
                      </div>
                    </div>
                  ))}
                  
                  {buyerInsights.fastSellingStates.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No market speed data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fast-Moving County Markets</CardTitle>
                <CardDescription>Local areas with quick property turnover</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-1">
                  {buyerInsights.fastSellingCounties.map((county: CountyData, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{county.county_name} County</span>
                        <div className="text-xs text-muted-foreground">{county.state}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Timer className="h-4 w-4 text-amber-500" />
                        <span>{county.median_days_on_market} days</span>
                      </div>
                    </div>
                  ))}
                  
                  {buyerInsights.fastSellingCounties.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No market speed data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buyer-Friendly Counties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Buyer-Friendly Counties</CardTitle>
                  <CardDescription>Markets predicted to favor buyers</CardDescription>
                </div>
                <ThumbsUp className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <div className="grid gap-2 md:grid-cols-2">
                {buyerInsights.buyerFriendlyCounties.map((county: CountyData, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50">
                    <div>
                      <span className="font-medium">{county.county_name} County</span>
                      <div className="text-xs text-muted-foreground">{county.state}</div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Buyer's Market
                    </Badge>
                  </div>
                ))}
                
                {buyerInsights.buyerFriendlyCounties.length === 0 && (
                  <div className="text-center py-4 col-span-2 text-muted-foreground text-sm">No buyer-friendly markets currently available</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <Button className="px-8" onClick={() => window.location.href = "/dashboard/market-insights"}>
              Explore Detailed Market Insights
            </Button>
          </div>
        </div>
      ) : (
        // Investor dashboard (keeping the original content)
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Opportunities</CardTitle>
              <CardDescription>New investment opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {properties && properties.length > 0 ? (
                properties.slice(0, 3).map((property: any) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{property.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{property.property_type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {property.bedrooms}bd • {property.bathrooms}ba
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${property.price?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ${Math.round(property.price / property.square_feet)}/sqft
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No properties available</div>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                View All Properties
              </Button>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Latest trends in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketData ? (
                <>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Average Home Price</h4>
                      <p className="text-sm text-muted-foreground">Austin, TX</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${marketData.avg_price?.toLocaleString()}</p>
                      <div className="flex items-center text-sm text-green-600">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {marketData.market_trend}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Price per Sq Ft</h4>
                      <p className="text-sm text-muted-foreground">Market average</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${marketData.price_per_sqft}</p>
                      <p className="text-sm text-muted-foreground">+$12 from last month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Days on Market</h4>
                      <p className="text-sm text-muted-foreground">Average listing time</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{marketData.days_on_market} days</p>
                      <div className="flex items-center text-sm text-green-600">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        Faster sales
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No market data available</div>
              )}

              <Button variant="outline" className="w-full bg-transparent" onClick={() => window.location.href = "/dashboard/market-insights"}>
                View Detailed Market Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
