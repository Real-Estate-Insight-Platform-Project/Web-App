"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { User, Mail, Calendar, MapPin, Save, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  full_name: string
  user_role: "buyer" | "investor"
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [userRole, setUserRole] = useState<"buyer" | "investor">("buyer")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!error && data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setUserRole(data.user_role || "buyer")
      } else if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create one
        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          user_role: (user.user_metadata?.user_role as "buyer" | "investor") || "buyer",
        }

        const { error: insertError } = await supabase.from("profiles").insert(newProfile)
        if (!insertError) {
          setProfile({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          setFullName(newProfile.full_name)
          setUserRole(newProfile.user_role)
        }
      }
    }
    setLoading(false)
  }

  const updateProfile = async () => {
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        user_role: userRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (!error) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName,
              user_role: userRole,
              updated_at: new Date().toISOString(),
            }
          : null,
      )
      // Refresh the page to update the dashboard layout
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Profile not found</h3>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details and account type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt={profile.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {profile.user_role}
                </Badge>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed from this page</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role">Account Type</Label>
                <Select value={userRole} onValueChange={(value: "buyer" | "investor") => setUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Home Buyer</SelectItem>
                    <SelectItem value="investor">Real Estate Investor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changing your account type will update your dashboard features
                </p>
              </div>

              <Button onClick={updateProfile} disabled={saving} className="w-full bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-xs text-muted-foreground">Your login email</p>
                  </div>
                </div>
                <p className="text-sm">{profile.email}</p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <p className="text-xs text-muted-foreground">Your user role</p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {profile.user_role}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">Account creation date</p>
                  </div>
                </div>
                <p className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">Profile last modified</p>
                  </div>
                </div>
                <p className="text-sm">{new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{profile.user_role === "buyer" ? "12" : "7"}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.user_role === "buyer" ? "Saved Properties" : "Properties Owned"}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{profile.user_role === "buyer" ? "45" : "23"}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.user_role === "buyer" ? "Properties Viewed" : "Analyses Created"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
