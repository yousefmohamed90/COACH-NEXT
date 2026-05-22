"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetMealPlan, useListMeals, useCreateMeal, useDeleteMeal,
  getGetMealPlanQueryKey, getListMealsQueryKey
} from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const mealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mealType: z.string().min(1),
  calories: z.coerce.number().optional().nullable(),
  proteinG: z.coerce.number().optional().nullable(),
  carbsG: z.coerce.number().optional().nullable(),
  fatG: z.coerce.number().optional().nullable(),
  description: z.string().optional(),
});

export default function NutritionDetail() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id ? parseInt(params.id as string, 10) : 0;
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plan, isLoading: planLoading } = useGetMealPlan(planId, {
    query: { enabled: !!planId, queryKey: getGetMealPlanQueryKey(planId) },
  });
  const { data: meals, isLoading: mealsLoading } = useListMeals(planId, {
    query: { enabled: !!planId, queryKey: getListMealsQueryKey(planId) },
  });

  const createMeal = useCreateMeal();
  const deleteMeal = useDeleteMeal();

  const form = useForm<z.infer<typeof mealSchema>>({
    resolver: zodResolver(mealSchema),
    defaultValues: { name: "", mealType: "breakfast" },
  });

  function onSubmit(values: z.infer<typeof mealSchema>) {
    createMeal.mutate(
      { planId, data: { ...values, orderIndex: (meals?.length ?? 0) + 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMealsQueryKey(planId) });
          setOpen(false);
          form.reset({ mealType: "breakfast" });
          toast({ title: "Meal added" });
        },
      }
    );
  }

  if (planLoading) return (
    <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  );
  if (!plan) return <div className="p-6 text-muted-foreground">Plan not found</div>;

  const mealsByType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = meals?.filter(m => m.mealType === type) ?? [];
    return acc;
  }, {} as Record<string, typeof meals>);

  const totalCalories = meals?.reduce((sum, m) => sum + (m.calories ?? 0), 0) ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/app/nutrition")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Meal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Meal</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Meal Name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="mealType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {MEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="calories" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Calories</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="proteinG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Protein (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="carbsG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Carbs (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fatG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Fat (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Notes</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMeal.isPending}>
                  {createMeal.isPending ? "Adding..." : "Add Meal"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Macro targets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Target Calories", value: plan.targetCalories ? `${plan.targetCalories}` : "—", unit: "kcal" },
          { label: "Protein", value: plan.targetProteinG ? `${plan.targetProteinG}` : "—", unit: "g" },
          { label: "Carbs", value: plan.targetCarbsG ? `${plan.targetCarbsG}` : "—", unit: "g" },
          { label: "Fat", value: plan.targetFatG ? `${plan.targetFatG}` : "—", unit: "g" },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {mealsLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map(type => {
            const typeMeals = mealsByType[type] ?? [];
            return (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {typeMeals.reduce((s, m) => s + (m.calories ?? 0), 0)} kcal
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {typeMeals.length === 0 ? (
                    <div className="px-4 pb-4 text-xs text-muted-foreground">No meals added</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {typeMeals.map(meal => (
                        <div key={meal.id} data-testid={`row-meal-${meal.id}`} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{meal.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {meal.proteinG && `P ${meal.proteinG}g`}
                              {meal.carbsG && ` · C ${meal.carbsG}g`}
                              {meal.fatG && ` · F ${meal.fatG}g`}
                              {meal.description && ` · ${meal.description}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {meal.calories && <span className="text-sm font-medium">{meal.calories} kcal</span>}
                            <button
                              onClick={() => deleteMeal.mutate({ id: meal.id }, {
                                onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMealsQueryKey(planId) })
                              })}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
