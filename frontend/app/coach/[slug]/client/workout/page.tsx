"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Clock, Target, List, Info } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  notes?: string;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description?: string;
  exercises: Exercise[];
}

export default function ClientWorkoutPlan() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/workout-plan")
      .then(r => {
        if (!r.ok) throw new Error("No workout plan assigned");
        return r.json();
      })
      .then(data => setPlan(data))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/coach/${slug}/client/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        {!plan ? (
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-muted flex items-center justify-center mb-2">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No Workout Plan</CardTitle>
              <CardDescription>Your coach hasn't assigned a workout plan yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Dumbbell className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
                {plan.description && (
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                  Exercises ({plan.exercises?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.exercises && plan.exercises.length > 0 ? (
                  plan.exercises.map((ex, i) => (
                    <div key={ex.id || i} className="border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{ex.name}</h3>
                          {ex.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{ex.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <List className="h-3.5 w-3.5" /> {ex.sets} sets
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" /> {ex.reps} reps
                        </span>
                        {ex.weight && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {ex.weight}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No exercises in this plan</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
