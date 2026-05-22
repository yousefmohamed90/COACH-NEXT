"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetWorkoutPlan, useListExercises, useCreateExercise, useDeleteExercise,
  getGetWorkoutPlanQueryKey, getListExercisesQueryKey
} from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sets: z.coerce.number().optional().nullable(),
  reps: z.coerce.number().optional().nullable(),
  restSeconds: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

export default function WorkoutPlanDetail() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id ? parseInt(params.id as string, 10) : 0;
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plan, isLoading: planLoading } = useGetWorkoutPlan(planId, {
    query: { enabled: !!planId, queryKey: getGetWorkoutPlanQueryKey(planId) },
  });
  const { data: exercises, isLoading: exLoading } = useListExercises(planId, {
    query: { enabled: !!planId, queryKey: getListExercisesQueryKey(planId) },
  });

  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();

  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: "", notes: "" },
  });

  function onSubmit(values: z.infer<typeof exerciseSchema>) {
    createExercise.mutate(
      { planId, data: { ...values, orderIndex: (exercises?.length ?? 0) + 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListExercisesQueryKey(planId) });
          setOpen(false);
          form.reset();
          toast({ title: "Exercise added" });
        },
      }
    );
  }

  if (planLoading) return (
    <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /></div>
  );
  if (!plan) return <div className="p-6 text-muted-foreground">Plan not found</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/app/workout-plans")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Exercise</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Exercise</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Exercise Name *</FormLabel>
                    <FormControl><Input data-testid="input-exercise-name" {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="sets" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Sets</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="reps" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Reps</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="restSeconds" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Rest (s)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Notes</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createExercise.isPending}>
                  {createExercise.isPending ? "Adding..." : "Add Exercise"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {plan.durationWeeks && (
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{plan.durationWeeks}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Weeks</p>
          </CardContent></Card>
        )}
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{exercises?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Exercises</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{plan.isTemplate ? "Yes" : "No"}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Template</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Exercises</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {exLoading ? (
            <div className="p-4 space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !exercises || exercises.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">No exercises yet. Add your first exercise.</div>
          ) : (
            <div className="divide-y divide-border">
              {[...exercises].sort((a, b) => a.orderIndex - b.orderIndex).map((ex, i) => (
                <div key={ex.id} data-testid={`row-exercise-${ex.id}`} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets && `${ex.sets} sets`}
                        {ex.reps && ` × ${ex.reps} reps`}
                        {ex.restSeconds && ` · ${ex.restSeconds}s rest`}
                        {ex.notes && ` · ${ex.notes}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteExercise.mutate({ id: ex.id }, {
                      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExercisesQueryKey(planId) })
                    })}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
