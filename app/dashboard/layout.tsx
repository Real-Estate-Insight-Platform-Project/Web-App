import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("user_role, full_name").eq("id", user.id).single()

  // If no profile exists, create one from user metadata
  if (!profile && user.user_metadata) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata.full_name || user.email?.split("@")[0],
      user_role: user.user_metadata.user_role || "buyer",
    })

    if (!insertError) {
      // Redirect to refresh the page with the new profile
      redirect("/dashboard")
    }
  }

  const userRole = profile?.user_role || user.user_metadata?.user_role || "buyer"
  const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={user.email}>
      {children}
    </DashboardLayout>
  )
}
