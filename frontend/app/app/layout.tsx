"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { Menu, Timer, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  const trialDaysLeft = useMemo(() => {
    if (!user?.trialEndsAt) return null
    const end = new Date(user.trialEndsAt).getTime()
    const diff = end - now
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [user?.trialEndsAt, now])

  const showTrialBanner = user?.subscriptionStatus === "trialing" && trialDaysLeft !== null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:flex w-64 border-r border-border bg-sidebar p-4 flex-col gap-4">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="space-y-2 flex-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
          </div>
        </div>
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-5 gap-4 mt-6">
              {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] md:hidden">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-lg tracking-tight text-white">TRAINOVA</span>
          </div>
        </div>

        {/* Trial banner */}
        {showTrialBanner && (
          <div className={`px-4 py-2.5 flex items-center justify-between gap-3 text-sm ${
            trialDaysLeft! > 0
              ? "bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-700 dark:text-cyan-300"
              : "bg-destructive/10 border-b border-destructive/20 text-destructive"
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {trialDaysLeft! > 0 ? (
                <Timer className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">
                {trialDaysLeft! > 0
                  ? `Free trial: ${trialDaysLeft} day${trialDaysLeft! > 1 ? "s" : ""} remaining`
                  : "Your free trial has ended. Purchase full access to keep your site."}
              </span>
            </div>
            <Button
              size="sm"
              variant={trialDaysLeft! > 0 ? "outline" : "default"}
              className="shrink-0 text-xs h-8 px-3"
              onClick={() => router.push("/register")}
            >
              {trialDaysLeft! > 0 ? "Buy Now — $200" : "Purchase Access"}
            </Button>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
