"use client"

import { useGetDashboardStats } from "@trainova/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { Users, CreditCard, DollarSign, Dumbbell, Utensils, Activity, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: number; type: string; description: string; clientName: string | null; createdAt: string;
};

type WeightPoint = {
  date: string; weightKg: number; clientName: string;
};

type TrendPoint = {
  month: string; count: number;
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/recent-activity").then(r => r.json()).then(setActivities).catch(() => {}),
      fetch("/api/dashboard/weight-progress").then(r => r.json()).then(setWeightData).catch(() => {}),
      fetch("/api/dashboard/checkin-trend").then(r => r.json()).then(setTrendData).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statsCards = [
    { label: "Total Clients", value: stats?.totalClients, icon: Users, color: "text-chart-3", href: "/app/clients" },
    { label: "Active Subs", value: stats?.activeSubscriptions, icon: CreditCard, color: "text-primary", href: "/app/subscriptions" },
    { label: "Revenue", value: stats?.monthlyRevenue != null ? `$${stats.monthlyRevenue.toFixed(0)}` : undefined, icon: DollarSign, color: "text-chart-1", href: "/app/subscriptions" },
    { label: "Workouts", value: stats?.workoutPlansCount, icon: Dumbbell, color: "text-chart-4", href: "/app/workout-plans" },
    { label: "Meals", value: stats?.mealPlansCount, icon: Utensils, color: "text-chart-2", href: "/app/nutrition" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Your coaching overview</p>
        </div>
        {user?.slug && (
          <Link
            href={`/coach/${user.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View My Site
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group">
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">{card.label}</p>
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.color} shrink-0`} />
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
                  ) : (
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{card.value ?? "—"}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Check-in Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {loading ? (
              <Skeleton className="h-40 sm:h-48 w-full" />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 sm:h-48 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">No check-in data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-0">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              Weight Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {loading ? (
              <Skeleton className="h-40 sm:h-48 w-full" />
            ) : weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weightData.slice(-20)}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weightKg" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 sm:h-48 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">No weight data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
          <Link href="/app/checkins" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    a.type === "checkin" ? "bg-chart-4/10 text-chart-4" :
                    a.type === "client" ? "bg-chart-3/10 text-chart-3" :
                    "bg-chart-2/10 text-chart-2"
                  }`}>
                    {a.type === "checkin" ? <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
                     a.type === "client" ? <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> :
                     <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{a.description}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString()}{a.clientName ? ` — ${a.clientName}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">No recent activity</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}