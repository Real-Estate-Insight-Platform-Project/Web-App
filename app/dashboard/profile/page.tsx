import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, MapPin, Calendar, Mail, Phone, Building2 } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/professional-headshot.png" />
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mb-2">
                <Building2 className="w-3 h-3 mr-1" />
                Buyer
              </Badge>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                San Francisco, CA
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Jan 2024
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Properties saved</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Searches performed</span>
              <span className="font-medium">47</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex">
                <Mail className="w-4 h-4 mt-3 mr-3 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="john.doe@example.com" className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex">
                <Phone className="w-4 h-4 mt-3 mr-3 text-muted-foreground" />
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex">
                <MapPin className="w-4 h-4 mt-3 mr-3 text-muted-foreground" />
                <Input id="location" defaultValue="San Francisco, CA" className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your real estate goals..."
                defaultValue="First-time homebuyer looking for a modern condo in the Bay Area. Interested in properties with good investment potential and proximity to tech hubs."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience and search preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Search Preferences</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="priceRange">Preferred Price Range</Label>
                    <Select defaultValue="500k-1m">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500k">Under $500K</SelectItem>
                        <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                        <SelectItem value="over-2m">Over $2M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select defaultValue="condo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Preferences</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="emailFreq">Email Notifications</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alertType">Price Alert Sensitivity</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (All changes)</SelectItem>
                        <SelectItem value="medium">Medium (5%+ changes)</SelectItem>
                        <SelectItem value="low">Low (10%+ changes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
