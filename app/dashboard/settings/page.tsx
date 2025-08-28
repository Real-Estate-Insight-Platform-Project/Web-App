import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Bell,
  Eye,
  Smartphone,
  Mail,
  Lock,
  Key,
  Trash2,
  Download,
  Moon,
  Sun,
  Globe,
  CreditCard,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Enabled
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base">Change Password</Label>
                <div className="grid gap-3 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-fit">
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Receive updates about properties and market changes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base flex items-center">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts on your mobile device</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Price Drop Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when saved properties drop in price</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Market Reports</Label>
                  <p className="text-sm text-muted-foreground">Weekly market analysis and trends</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">New Listings</Label>
                  <p className="text-sm text-muted-foreground">Alert when new properties match your criteria</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Privacy
            </CardTitle>
            <CardDescription>Control your privacy and data sharing preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                </div>
                <Select defaultValue="private">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Data Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve our service with anonymous usage data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="w-5 h-5 mr-2" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <Select defaultValue="system">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        English
                      </div>
                    </SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Account Management
            </CardTitle>
            <CardDescription>Manage your subscription and account data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Export Data</Label>
                  <p className="text-sm text-muted-foreground">Download a copy of your account data</p>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base text-destructive">Danger Zone</Label>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
