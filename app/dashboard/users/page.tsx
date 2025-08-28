"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Mock user data
const mockUser = {
  role: "admin" as const,
  name: "Admin User",
  email: "admin@example.com",
}

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "buyer",
    status: "active",
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    propertiesViewed: 45,
    savedProperties: 12,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "investor",
    status: "active",
    joinDate: "2023-08-22",
    lastActive: "2024-01-19",
    propertiesOwned: 3,
    portfolioValue: 2450000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@example.com",
    role: "buyer",
    status: "inactive",
    joinDate: "2023-12-10",
    lastActive: "2024-01-05",
    propertiesViewed: 8,
    savedProperties: 2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    email: "emily@example.com",
    role: "investor",
    status: "suspended",
    joinDate: "2023-06-18",
    lastActive: "2024-01-18",
    propertiesOwned: 1,
    portfolioValue: 520000,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "buyer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "investor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive":
        return <Activity className="h-4 w-4 text-yellow-600" />
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const userStats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === "active").length,
    buyers: mockUsers.filter((u) => u.role === "buyer").length,
    investors: mockUsers.filter((u) => u.role === "investor").length,
  }

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage platform users and their activities</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.active}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((userStats.active / userStats.total) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.buyers}</div>
              <p className="text-xs text-muted-foreground">Home buyers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.investors}</div>
              <p className="text-xs text-muted-foreground">Real estate investors</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="user-insights">User Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="all-users" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedRole === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole("all")}
                      className={selectedRole !== "all" ? "bg-transparent" : ""}
                    >
                      All Roles
                    </Button>
                    <Button
                      variant={selectedRole === "buyer" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole("buyer")}
                      className={selectedRole !== "buyer" ? "bg-transparent" : ""}
                    >
                      Buyers
                    </Button>
                    <Button
                      variant={selectedRole === "investor" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole("investor")}
                      className={selectedRole !== "investor" ? "bg-transparent" : ""}
                    >
                      Investors
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedStatus === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus("all")}
                      className={selectedStatus !== "all" ? "bg-transparent" : ""}
                    >
                      All Status
                    </Button>
                    <Button
                      variant={selectedStatus === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus("active")}
                      className={selectedStatus !== "active" ? "bg-transparent" : ""}
                    >
                      Active
                    </Button>
                    <Button
                      variant={selectedStatus === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus("inactive")}
                      className={selectedStatus !== "inactive" ? "bg-transparent" : ""}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage and monitor platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(user.status)}
                            <Badge className={getStatusColor(user.status)}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.joinDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(user.lastActive).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.role === "buyer" ? (
                              <div>
                                <p>{user.propertiesViewed} viewed</p>
                                <p className="text-muted-foreground">{user.savedProperties} saved</p>
                              </div>
                            ) : (
                              <div>
                                <p>{user.propertiesOwned} properties</p>
                                <p className="text-muted-foreground">${user.portfolioValue?.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              {user.status === "active" ? (
                                <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">Activate User</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent-activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest user actions and platform interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "John Doe", action: "Saved property", details: "123 Oak Street", time: "2 minutes ago" },
                    {
                      user: "Sarah Johnson",
                      action: "Added property to portfolio",
                      details: "Investment property",
                      time: "15 minutes ago",
                    },
                    { user: "Mike Chen", action: "Searched properties", details: "Downtown area", time: "1 hour ago" },
                    {
                      user: "Emily Rodriguez",
                      action: "Updated profile",
                      details: "Contact information",
                      time: "2 hours ago",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {activity.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.action} • {activity.details}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-insights" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-medium">24 new users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Month</span>
                      <span className="font-medium">18 new users</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                      <span className="font-medium text-green-600">+33%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>Platform usage and activity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Active Users</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Session Duration</span>
                      <span className="font-medium">12m 34s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Return Rate</span>
                      <span className="font-medium">68%</span>
                    </div>
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
