"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Server,
  Database,
  Shield,
  Bell,
  Mail,
  Globe,
  HardDrive,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

// Mock user data
const mockUser = {
  role: "admin" as const,
  name: "Admin User",
  email: "admin@example.com",
}

// Mock system data
const mockSystemData = {
  status: {
    overall: "healthy",
    database: "healthy",
    api: "healthy",
    storage: "warning",
    cdn: "healthy",
  },
  performance: {
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 23,
  },
  settings: {
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    dataBackup: true,
    autoUpdates: true,
  },
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(mockSystemData.settings)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Unknown</Badge>
    }
  }

  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name} userEmail={mockUser.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-2">Manage platform configuration and monitor system health</p>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* System Status Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(mockSystemData.status.overall)}
                {getStatusBadge(mockSystemData.status.overall)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(mockSystemData.status.database)}
                {getStatusBadge(mockSystemData.status.database)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Services</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(mockSystemData.status.api)}
                {getStatusBadge(mockSystemData.status.api)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(mockSystemData.status.storage)}
                {getStatusBadge(mockSystemData.status.storage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CDN</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(mockSystemData.status.cdn)}
                {getStatusBadge(mockSystemData.status.cdn)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Resources
                  </CardTitle>
                  <CardDescription>Current system resource utilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">{mockSystemData.performance.cpuUsage}%</span>
                    </div>
                    <Progress value={mockSystemData.performance.cpuUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">{mockSystemData.performance.memoryUsage}%</span>
                    </div>
                    <Progress value={mockSystemData.performance.memoryUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-muted-foreground">{mockSystemData.performance.diskUsage}%</span>
                    </div>
                    <Progress value={mockSystemData.performance.diskUsage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network Latency</span>
                      <span className="text-sm text-muted-foreground">
                        {mockSystemData.performance.networkLatency}ms
                      </span>
                    </div>
                    <Progress value={mockSystemData.performance.networkLatency} max={100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>Recent system events and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "10:30 AM", level: "info", message: "Database backup completed successfully" },
                      { time: "10:15 AM", level: "warning", message: "High disk usage detected (78%)" },
                      { time: "09:45 AM", level: "info", message: "User authentication service restarted" },
                      { time: "09:30 AM", level: "error", message: "Failed to connect to external API" },
                      { time: "09:15 AM", level: "info", message: "System health check completed" },
                    ].map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              log.level === "error"
                                ? "bg-red-500"
                                : log.level === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                        </div>
                        <p className="text-sm flex-1">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>Configure core platform functionality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user signups</p>
                    </div>
                    <Switch
                      checked={settings.userRegistration}
                      onCheckedChange={(checked) => setSettings({ ...settings, userRegistration: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatic daily backups</p>
                    </div>
                    <Switch
                      checked={settings.dataBackup}
                      onCheckedChange={(checked) => setSettings({ ...settings, dataBackup: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Updates</Label>
                      <p className="text-sm text-muted-foreground">Automatic system updates</p>
                    </div>
                    <Switch
                      checked={settings.autoUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoUpdates: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Configure external API integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">MLS API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input id="webhook-url" placeholder="https://api.example.com/webhook" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                    <Input id="rate-limit" type="number" placeholder="1000" />
                  </div>
                  <Button className="w-full">Save API Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure system and user notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send email alerts to users</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send SMS alerts to users</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Configure email service settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" type="number" placeholder="587" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input id="from-email" type="email" placeholder="noreply@example.com" />
                  </div>
                  <Button className="w-full">Save Email Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure platform security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input id="max-login-attempts" type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Textarea
                      id="password-policy"
                      placeholder="Minimum 8 characters, include uppercase, lowercase, number, and special character"
                      rows={3}
                    />
                  </div>
                  <Button className="w-full">Save Security Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                  <CardDescription>Recent security events and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "2 hours ago", event: "Failed login attempt from IP 192.168.1.100", level: "warning" },
                      { time: "4 hours ago", event: "User password changed successfully", level: "info" },
                      { time: "6 hours ago", event: "New admin user created", level: "info" },
                      { time: "8 hours ago", event: "Suspicious activity detected", level: "error" },
                      { time: "12 hours ago", event: "Security scan completed", level: "info" },
                    ].map((event, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            event.level === "error"
                              ? "bg-red-500"
                              : event.level === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">{event.event}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    ))}
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
