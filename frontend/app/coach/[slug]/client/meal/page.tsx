"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, ArrowLeft, Info, Sun, Moon, Coffee } from "lucide-react";

interface Meal {
  id: number;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealPlan {
  id: number;
  name: string;
  description?: string;
  meals: Meal[];
}

export default function ClientMealPlan() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/meal-plan")
      .then(r => {
        if (!r.ok) throw new Error("No meal plan assigned");
        return r.json();
      })
      .then(data => setPlan(data))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, []);

  const mealIcons = [Coffee, Sun, Moon, Utensils];

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
              <CardTitle>No Meal Plan</CardTitle>
              <CardDescription>Your coach hasn't assigned a meal plan yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Utensils className="h-7 w-7" />
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
                  Meals ({plan.meals?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.meals && plan.meals.length > 0 ? (
                  plan.meals.map((meal, i) => {
                    const MealIcon = mealIcons[i % mealIcons.length];
                    return (
                      <div key={meal.id || i} className="border border-border bg-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                              <MealIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{meal.name}</h3>
                              {meal.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{meal.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                          <div className="flex gap-4 mt-3 text-sm text-muted-foreground border-t border-border pt-3">
                            {meal.calories && <span>{meal.calories} cal</span>}
                            {meal.protein && <span>P: {meal.protein}g</span>}
                            {meal.carbs && <span>C: {meal.carbs}g</span>}
                            {meal.fat && <span>F: {meal.fat}g</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No meals in this plan</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
