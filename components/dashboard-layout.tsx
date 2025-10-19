"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  BarChart3,
  Search,
  Heart,
  Calculator,
  Settings,
  LogOut,
  Menu,
  User,
  MessageSquare,
  Map,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "buyer" | "investor"
  userName?: string
  userEmail?: string
}

export function DashboardLayout({ children, userRole, userName, userEmail }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const buyerNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/search", icon: Search, label: "Property Search" },
    { href: "/dashboard/market-insights", icon: BarChart3, label: "Market Insights" },
    { href: "/dashboard/agent-finder", icon: Users, label: "Agent Finder" }, 
    { href: "/dashboard/risk-map", icon: Map, label: "Risk Map" },
    // { href: "/dashboard/calculator", icon: Calculator, label: "Mortgage Calculator" },
    { href: "/dashboard/chat-assistant", icon: MessageSquare, label: "AI Assistant" },
  ]

  const investorNavItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    // { href: "/dashboard/portfolio", icon: TrendingUp, label: "Portfolio" },
    { href: "/dashboard/search", icon: Search, label: "Property Search" },
    { href: "/dashboard/analysis", icon: Calculator, label: "Investment Analysis" },
    { href: "/dashboard/market-insights", icon: BarChart3, label: "Market Insights" },
    // { href: "/dashboard/agent-finder", icon: Users, label: "Agent Finder" }, 
    { href: "/dashboard/risk-map", icon: Map, label: "Risk Map" },
    { href: "/dashboard/chat-assistant", icon: MessageSquare, label: "AI Assistant" },
  ]

  const navItems = userRole === "buyer" ? buyerNavItems : investorNavItems

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-primary">RealEstate Insights</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={onNavigate}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="border-t px-4 py-4">
        <Link
          href="/dashboard/settings"
          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/dashboard/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          onClick={onNavigate}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <div className="flex items-center gap-2">
                <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                  <Home className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{userRole === "buyer" ? "Home Buyer" : "Investor"}</span>
                  <span className="text-lg font-semibold text-foreground">RealEstate Insights</span>
                </div>
              </div>
            </div>

            <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1 text-xs text-muted-foreground lg:flex">
                <span>{userName || "Welcome"}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.svg" alt={userName || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Saved Properties</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <SheetContent side="left" className="w-72 max-w-full p-0">
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Page Content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-1 flex-col rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
