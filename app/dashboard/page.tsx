"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Timer, MapPin, ThumbsUp, PiggyBank } from "lucide-react"
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

interface GrowthStateData {
  state: string
  median_listing_price: number
  median_listing_price_mm: number
}

interface GrowthCountyData {
  county_name: string
  state: string
  median_listing_price: number
  median_listing_price_mm: number
}

interface ConsistentGrowthStateData {
  state: string
  growth_3month: number
}

interface ConsistentGrowthCountyData {
  county_name: string
  state: string
  growth_3month: number
}

interface StableStateData {
  state: string
  price_stddev: number
  price_avg: number
  coefficient_of_variation: number
}

interface InvestorInsights {
  highestGrowthStates: GrowthStateData[]
  highestGrowthCounties: GrowthCountyData[]
  consistentGrowthStates: ConsistentGrowthStateData[]
  consistentGrowthCounties: ConsistentGrowthCountyData[]
  stableStates: StableStateData[]
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
  const [investorInsights, setInvestorInsights] = useState<InvestorInsights>({
    highestGrowthStates: [],
    highestGrowthCounties: [],
    consistentGrowthStates: [],
    consistentGrowthCounties: [],
    stableStates: []
  })
  
  // Helper function to check if cached data is still valid
  const isCacheValid = (timestamp: number, ttl: number) => {
    return timestamp && Date.now() - timestamp < ttl
  }

  // Helper function to store data in localStorage with timestamp
  const cacheData = (key: string, data: any) => {
    const item = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  // Helper function to get cached data if valid
  const getCachedData = (key: string, ttl: number) => {
    const item = localStorage.getItem(key)
    if (!item) return null

    const parsedItem = JSON.parse(item)
    if (isCacheValid(parsedItem.timestamp, ttl)) {
      return parsedItem.data
    }
    return null
  }

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
        
        // TTL constants (in milliseconds)
        const PROFILE_TTL = 24 * 60 * 60 * 1000 // 24 hours
        const PROPERTIES_TTL = 6 * 60 * 60 * 1000 // 6 hours
        const MARKET_DATA_TTL = 12 * 60 * 60 * 1000 // 12 hours
        const BUYER_INSIGHTS_TTL = 12 * 60 * 60 * 1000 // 12 hours

        // Try to get profile data from cache first
        const cachedProfile = getCachedData(`profile_${userData.id}`, PROFILE_TTL)
        if (cachedProfile) {
          setProfile(cachedProfile as UserProfile)
        } else {
          // Fetch profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_role, full_name")
            .eq("id", userData.id)
            .single()
          
          if (profileData) {
            setProfile(profileData as UserProfile)
            cacheData(`profile_${userData.id}`, profileData)
          }
        }
        
        // Try to get properties from cache first
        const cachedProperties = getCachedData('dashboard_properties', PROPERTIES_TTL)
        if (cachedProperties) {
          setProperties(cachedProperties as Property[])
        } else {
          // Fetch properties
          const { data: propertiesData } = await supabase
            .from("properties")
            .select("*")
            .limit(3)
          
          if (propertiesData) {
            setProperties(propertiesData as Property[] || [])
            cacheData('dashboard_properties', propertiesData)
          }
        }
        
        // Try to get market data from cache first
        const cachedMarketData = getCachedData('market_data_austin', MARKET_DATA_TTL)
        if (cachedMarketData) {
          setMarketData(cachedMarketData as MarketData)
        } else {
          // Fetch market data
          const { data: marketDataRes } = await supabase
            .from("market_analytics")
            .select("*")
            .eq("city", "Austin")
            .order("month_year", { ascending: false })
            .limit(1)
            .single()
          
          if (marketDataRes) {
            setMarketData(marketDataRes as MarketData)
            cacheData('market_data_austin', marketDataRes)
          }
        }
        
        // Get user role for conditional data fetching
        const userRole = cachedProfile?.user_role || (await supabase
          .from("profiles")
          .select("user_role")
          .eq("id", userData.id)
          .single()).data?.user_role
        
        // Define constants for investor data
        const INVESTOR_INSIGHTS_TTL = 12 * 60 * 60 * 1000 // 12 hours
        
        if (userRole === "buyer") {
          // Try to get buyer insights from cache first
          const cachedInsights = getCachedData('buyer_insights', BUYER_INSIGHTS_TTL)
          if (cachedInsights) {
            setBuyerInsights(cachedInsights as BuyerInsights)
          } else {
            // Fetch buyer insights from our API endpoint
            const response = await fetch("/api/dashboard")
            if (response.ok) {
              const insightsData = await response.json()
              setBuyerInsights(insightsData as BuyerInsights)
              cacheData('buyer_insights', insightsData)
            }
          }
        } else if (userRole === "investor") {
          // Try to get investor insights from cache first
          const cachedInvestorInsights = getCachedData('investor_insights', INVESTOR_INSIGHTS_TTL)
          if (cachedInvestorInsights) {
            setInvestorInsights(cachedInvestorInsights as InvestorInsights)
          } else {
            // Fetch investor insights from our API endpoint with investor role parameter
            const response = await fetch("/api/dashboard?role=investor")
            if (response.ok) {
              const insightsData = await response.json()
              setInvestorInsights({
                highestGrowthStates: insightsData.highestGrowthStates || [],
                highestGrowthCounties: insightsData.highestGrowthCounties || [],
                consistentGrowthStates: insightsData.consistentGrowthStates || [],
                consistentGrowthCounties: insightsData.consistentGrowthCounties || [],
                stableStates: insightsData.stableStates || []
              })
              cacheData('investor_insights', {
                highestGrowthStates: insightsData.highestGrowthStates || [],
                highestGrowthCounties: insightsData.highestGrowthCounties || [],
                consistentGrowthStates: insightsData.consistentGrowthStates || [],
                consistentGrowthCounties: insightsData.consistentGrowthCounties || [],
                stableStates: insightsData.stableStates || []
              })
            }
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
        // Investor dashboard with enhanced insights
        <div className="space-y-8">
          {/* Investor Growth Insights - States & Counties */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* States with Highest Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 States with Highest Price Growth</CardTitle>
                <CardDescription>Best performing state markets</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {investorInsights.highestGrowthStates.map((state, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-white bg-opacity-60 hover:bg-opacity-100 transition-all">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>{state.median_listing_price_mm.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                  
                  {investorInsights.highestGrowthStates.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No growth data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Counties with Highest Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Counties with Highest Price Growth</CardTitle>
                <CardDescription>Local markets with exceptional growth</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {investorInsights.highestGrowthCounties.map((county, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-white bg-opacity-60 hover:bg-opacity-100 transition-all">
                      <div className="flex-1">
                        <span className="font-medium">{county.county_name} County</span>
                        <div className="text-xs text-muted-foreground">{county.state}</div>
                      </div>
                      <div className="flex items-center text-green-700">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>{county.median_listing_price_mm.toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                  
                  {investorInsights.highestGrowthCounties.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No growth data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consistent Growth - States & Counties */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* States with Consistent Growth */}
            <Card>
              <CardHeader>
                <CardTitle>States with Consistent Growth</CardTitle>
                <CardDescription>Sustained price increases over 3 months</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {investorInsights.consistentGrowthStates.map((state, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50 transition-all">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mr-2">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        +{state.growth_3month.toFixed(2)}% (3mo)
                      </Badge>
                    </div>
                  ))}
                  
                  {investorInsights.consistentGrowthStates.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No consistent growth data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Counties with Consistent Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Counties with Consistent Growth</CardTitle>
                <CardDescription>Local markets with stable price appreciation</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {investorInsights.consistentGrowthCounties.map((county, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50 transition-all">
                      <div className="flex-1">
                        <span className="font-medium">{county.county_name} County</span>
                        <div className="text-xs text-muted-foreground">{county.state}</div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        +{county.growth_3month.toFixed(2)}% (3mo)
                      </Badge>
                    </div>
                  ))}
                  
                  {investorInsights.consistentGrowthCounties.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">No consistent growth data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Stable States */}
          <Card>
            <CardHeader>
              <CardTitle>Most Stable States (Low Price Volatility)</CardTitle>
              <CardDescription>Markets with minimal price fluctuations over time</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-2">
                {investorInsights.stableStates.map((state, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50 transition-all">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mr-2">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-medium">{state.state}</span>
                        <div className="text-xs text-muted-foreground">Avg price: ${state.price_avg?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        volatility: {(state.coefficient_of_variation * 100).toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {investorInsights.stableStates.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">No stability data available</div>
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
      )}
    </div>
  )
}
