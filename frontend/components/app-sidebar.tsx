"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@trainova/api-client";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Utensils,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  UserCircle
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useGetMe } from "@trainova/api-client";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/workout-plans", label: "Workouts", icon: Dumbbell },
  { href: "/app/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/app/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/app/coach-profile", label: "Coach Profile", icon: UserCircle },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.push("/login");
      }
    });
  };

  return (
    <div className="w-64 border-r border-white/10 bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] text-sidebar-foreground h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">TRAINOVA</h1>
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-widest mt-1">
              Command Center
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground md:hidden transition-colors rounded-lg hover:bg-sidebar-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-sidebar-foreground/60 mb-4 px-2 uppercase tracking-wider">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-lg ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        {isAdmin && (
          <Link href="/app/admin">
            <div className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-lg ${
              pathname.startsWith("/app/admin") ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
            }`}>
              <Shield className="h-4 w-4" />
              Admin
            </div>
          </Link>
        )}
        <Link href="/app/settings">
          <div className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-lg ${
            pathname.startsWith("/app/settings") ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
          }`}>
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-red-500/20 hover:text-red-300 transition-colors text-left rounded-lg"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
