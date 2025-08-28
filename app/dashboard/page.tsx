import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Home, TrendingUp, Users, Activity } from "lucide-react"

// This would normally come from authentication/session
const mockUser = {
  role: "buyer" as const,
  name: "John Doe",
  email: "john@example.com",
}

export default function DashboardPage() {
  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {mockUser.name}!</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your real estate journey today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Alerts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">New opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Property Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$485K</div>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Radius</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15mi</div>
              <p className="text-xs text-muted-foreground">From your location</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Property Views</CardTitle>
              <CardDescription>Properties you've viewed recently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { address: "123 Oak Street, Downtown", price: "$425,000", status: "New" },
                { address: "456 Pine Avenue, Suburbs", price: "$380,000", status: "Price Drop" },
                { address: "789 Elm Drive, Riverside", price: "$520,000", status: "Hot" },
              ].map((property, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{property.address}</p>
                    <p className="text-sm text-muted-foreground">{property.price}</p>
                  </div>
                  <Badge
                    variant={
                      property.status === "New" ? "default" : property.status === "Hot" ? "destructive" : "secondary"
                    }
                  >
                    {property.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent">
                View All Properties
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>Latest trends in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Days on Market</span>
                  <span className="font-medium">28 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Price per Sq Ft</span>
                  <span className="font-medium">$245</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Market Competition</span>
                  <Badge variant="secondary">Moderate</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                View Full Report
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
