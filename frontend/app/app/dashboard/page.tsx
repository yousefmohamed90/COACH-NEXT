"use client"

import { useGetDashboardStats } from "@trainova/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, DollarSign, Dumbbell, Utensils } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  const statsCards = [
    { label: "Total Clients", value: stats?.totalClients, icon: Users, color: "text-chart-3" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions, icon: CreditCard, color: "text-primary" },
    { label: "Monthly Revenue", value: stats?.monthlyRevenue != null ? `$${stats.monthlyRevenue.toFixed(0)}` : undefined, icon: DollarSign, color: "text-chart-1" },
    { label: "Workout Plans", value: stats?.workoutPlansCount, icon: Dumbbell, color: "text-chart-4" },
    { label: "Meal Plans", value: stats?.mealPlansCount, icon: Utensils, color: "text-chart-2" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your coaching overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight">{card.value ?? "—"}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
