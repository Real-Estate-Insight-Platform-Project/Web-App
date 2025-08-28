"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, Eye, Clock, DollarSign, Home, Activity, Target } from "lucide-react"

// Mock user data
const mockUser = {
  role: "admin" as const,
  name: "Admin User",
  email: "admin@example.com",
}

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalUsers: 1247,
    activeUsers: 892,
    totalProperties: 15420,
    totalTransactions: 234,
    revenue: 125000,
    conversionRate: 3.2,
  },
  userMetrics: {
    newUsers: 156,
    returningUsers: 736,
    avgSessionDuration: "12m 34s",
    bounceRate: 24.5,
    pageViews: 45230,
    uniqueVisitors: 12450,
  },
  propertyMetrics: {
    propertiesViewed: 8920,
    propertiesSaved: 2340,
    searchQueries: 15670,
    contactRequests: 890,
    tourScheduled: 234,
    avgTimeOnProperty: "4m 12s",
  },
  topPages: [
    { page: "/dashboard/search", views: 12450, change: 8.2 },
    { page: "/dashboard", views: 9870, change: -2.1 },
    { page: "/dashboard/saved", views: 7650, change: 15.3 },
    { page: "/dashboard/calculator", views: 5430, change: 22.1 },
    { page: "/dashboard/portfolio", views: 4320, change: 5.7 },
  ],
  userTypes: [
    { type: "Buyers", count: 789, percentage: 63.3 },
    { type: "Investors", count: 345, percentage: 27.7 },
    { type: "Admins", count: 113, percentage: 9.0 },
  ],
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
            <p className="text-muted-foreground mt-2">Monitor platform performance and user behavior</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((mockAnalytics.overview.activeUsers / mockAnalytics.overview.totalUsers) * 100)}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalProperties.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.3%</span> new listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.2%</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockAnalytics.overview.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+22.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.overview.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.3%</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="properties">Property Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user types on the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.userTypes.map((userType) => (
                    <div key={userType.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{userType.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {userType.count} ({userType.percentage}%)
                        </span>
                      </div>
                      <Progress value={userType.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>Most visited pages in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topPages.map((page, index) => (
                      <div key={page.page} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{page.page}</p>
                            <p className="text-xs text-muted-foreground">{page.views.toLocaleString()} views</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {page.change > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={`text-xs ${page.change > 0 ? "text-green-600" : "text-red-600"}`}>
                            {page.change > 0 ? "+" : ""}
                            {page.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Acquisition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Users</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.newUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Returning Users</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.returningUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Return Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (mockAnalytics.userMetrics.returningUsers /
                          (mockAnalytics.userMetrics.newUsers + mockAnalytics.userMetrics.returningUsers)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Session Duration</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.avgSessionDuration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bounce Rate</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.bounceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pages per Session</span>
                    <span className="font-medium">4.2</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Page Views</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.pageViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unique Visitors</span>
                    <span className="font-medium">{mockAnalytics.userMetrics.uniqueVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views per Visitor</span>
                    <span className="font-medium">3.6</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Engagement</CardTitle>
                  <CardDescription>How users interact with property listings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Properties Viewed</span>
                    <span className="font-medium">
                      {mockAnalytics.propertyMetrics.propertiesViewed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Properties Saved</span>
                    <span className="font-medium">
                      {mockAnalytics.propertyMetrics.propertiesSaved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Save Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (mockAnalytics.propertyMetrics.propertiesSaved /
                          mockAnalytics.propertyMetrics.propertiesViewed) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Time on Property</span>
                    <span className="font-medium">{mockAnalytics.propertyMetrics.avgTimeOnProperty}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Actions</CardTitle>
                  <CardDescription>Property-related user activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Search Queries</span>
                    <span className="font-medium">{mockAnalytics.propertyMetrics.searchQueries.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contact Requests</span>
                    <span className="font-medium">
                      {mockAnalytics.propertyMetrics.contactRequests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tours Scheduled</span>
                    <span className="font-medium">{mockAnalytics.propertyMetrics.tourScheduled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (mockAnalytics.propertyMetrics.contactRequests /
                          mockAnalytics.propertyMetrics.propertiesViewed) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Platform speed and reliability metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Load Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Error Rate</span>
                    <span className="font-medium">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Response Time</span>
                    <span className="font-medium">245ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Platform growth and expansion indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Growth Rate</span>
                    <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Retention (30d)</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Feature Adoption</span>
                    <span className="font-medium">84%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-medium">4.6/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
