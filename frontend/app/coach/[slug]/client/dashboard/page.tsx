"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, Utensils, Calendar, TrendingUp, LogOut } from "lucide-react";

export default function ClientDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/me")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then(data => setClient(data))
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/coach/${slug}/client/login`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/coach/${slug}/client/login`)} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-primary">Welcome, {client.name}</h1>
            <p className="text-muted-foreground mt-1">Your coaching dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => router.push(`/coach/${slug}/client/workout`)}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2">
                <Dumbbell className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg uppercase">Workout Plan</CardTitle>
              <CardDescription>View your assigned workout routine</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-border bg-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => router.push(`/coach/${slug}/client/meal`)}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2">
                <Utensils className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg uppercase">Meal Plan</CardTitle>
              <CardDescription>View your nutrition plan</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-border bg-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => router.push(`/coach/${slug}/client/checkins`)}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg uppercase">Check-ins</CardTitle>
              <CardDescription>Submit daily progress updates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg uppercase flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your weight, mood, and energy levels over time. Submit daily check-ins to see your progress trends.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg uppercase">Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {client.goals || "No specific goals set yet. Work with your coach to define your fitness objectives."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
