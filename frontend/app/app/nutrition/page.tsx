"use client";
import { useState } from "react";
import { useListMealPlans, useCreateMealPlan, useDeleteMealPlan, getListMealPlansQueryKey, useListClients } from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Utensils, Trash2, ChevronRight } from "lucide-react";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  clientId: z.coerce.number().optional().nullable(),
  targetCalories: z.coerce.number().optional().nullable(),
  targetProteinG: z.coerce.number().optional().nullable(),
  targetCarbsG: z.coerce.number().optional().nullable(),
  targetFatG: z.coerce.number().optional().nullable(),
  targetWaterMl: z.coerce.number().optional().nullable(),
  isTemplate: z.boolean().default(false),
});

export default function Nutrition() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: plans, isLoading } = useListMealPlans();
  const { data: clients } = useListClients();
  const createPlan = useCreateMealPlan();
  const deletePlan = useDeleteMealPlan();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", description: "", isTemplate: false },
  });

  function onSubmit(values: z.infer<typeof createSchema>) {
    createPlan.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMealPlansQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Meal plan created" });
      },
    });
  }

  function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deletePlan.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMealPlansQueryKey() });
        toast({ title: "Plan deleted" });
      },
    });
  }

  const clientName = (id: number | null | undefined) =>
    clients?.find(c => c.id === id)?.name ?? "Unassigned";

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nutrition Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">{plans?.length ?? 0} total plans</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-meal-plan" size="sm">
              <Plus className="h-4 w-4 mr-2" />New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Meal Plan</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Title *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Assign to Client</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === "none" ? null : parseInt(v))} value={field.value ? String(field.value) : "none"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No client</SelectItem>
                        {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="targetCalories" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Calories (kcal)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetProteinG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Protein (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetCarbsG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Carbs (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetFatG" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Fat (g)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="isTemplate" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-sm cursor-pointer">Save as template</FormLabel>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createPlan.isPending}>
                  {createPlan.isPending ? "Creating..." : "Create Plan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : plans?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Utensils className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No meal plans yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y divide-border border border-border">
          {plans?.map(plan => (
            <Link key={plan.id} href={`/app/nutrition/${plan.id}`}>
              <div data-testid={`row-meal-plan-${plan.id}`} className="flex items-center justify-between p-4 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.clientId ? clientName(plan.clientId) : "Template"}
                      {plan.targetCalories && ` · ${plan.targetCalories} kcal`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {plan.targetProteinG && <span className="text-xs text-muted-foreground hidden sm:block">P: {plan.targetProteinG}g</span>}
                  {plan.targetCarbsG && <span className="text-xs text-muted-foreground hidden sm:block">C: {plan.targetCarbsG}g</span>}
                  {plan.targetFatG && <span className="text-xs text-muted-foreground hidden sm:block">F: {plan.targetFatG}g</span>}
                  {plan.isTemplate && <Badge variant="outline" className="text-xs">Template</Badge>}
                  <button onClick={(e) => handleDelete(plan.id, e)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
