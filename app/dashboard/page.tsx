import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Home, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("user_role, full_name").eq("id", user.id).single()

  const userRole = profile?.user_role || "buyer"
  const userName = profile?.full_name || user.email?.split("@")[0]

  // Get some sample data for the dashboard
  const { data: properties } = await supabase.from("properties").select("*").limit(3)

  const { data: marketData } = await supabase
    .from("market_analytics")
    .select("*")
    .eq("city", "Austin")
    .order("month_year", { ascending: false })
    .limit(1)
    .single()

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "buyer" ? "Saved Properties" : "Portfolio Value"}
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === "buyer" ? "12" : "$2.4M"}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "buyer" ? "+2 from last week" : "+12% from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "buyer" ? "Market Trend" : "Monthly Cash Flow"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRole === "buyer" ? (
                <div className="flex items-center">
                  Rising
                  <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                </div>
              ) : (
                "$8,450"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {userRole === "buyer" ? "Austin market up 5.2%" : "+$320 from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "buyer" ? "Avg. Price/SqFt" : "Total Properties"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === "buyer" ? "$285" : "7"}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "buyer" ? "+$12 from last month" : "2 new acquisitions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "buyer" ? "Days on Market" : "Avg. ROI"}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRole === "buyer" ? "28" : "14.2%"}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === "buyer" ? "-3 days from last month" : "+1.8% from last quarter"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Properties */}
        <Card>
          <CardHeader>
            <CardTitle>{userRole === "buyer" ? "Recently Viewed" : "Recent Opportunities"}</CardTitle>
            <CardDescription>
              {userRole === "buyer" ? "Properties you've recently looked at" : "New investment opportunities"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {properties?.slice(0, 3).map((property) => (
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
                  <p className="font-semibold">${property.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    ${Math.round(property.price / property.square_feet)}/sqft
                  </p>
                </div>
              </div>
            ))}
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
            {marketData && (
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
            )}

            <Button variant="outline" className="w-full bg-transparent">
              View Detailed Market Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
