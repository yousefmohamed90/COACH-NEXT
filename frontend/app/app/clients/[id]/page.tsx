"use client"

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetClient, useUpdateClient, useListCheckins, useListSubscriptions, useListWorkoutPlans, useListMealPlans,
  getGetClientQueryKey, getListClientsQueryKey
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { format } from "date-fns";

const editSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  weightKg: z.coerce.number().optional().nullable(),
  heightCm: z.coerce.number().optional().nullable(),
  goals: z.string().optional(),
  notes: z.string().optional(),
  status: z.string(),
});

export default function ClientDetail() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id ? parseInt(params.id as string, 10) : 0;
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: client, isLoading } = useGetClient(clientId, {
    query: { enabled: !!clientId, queryKey: getGetClientQueryKey(clientId) },
  });
  const { data: checkins } = useListCheckins({ clientId }, {
    query: { enabled: !!clientId, queryKey: ["checkins", { clientId }] },
  });
  const { data: subscriptions } = useListSubscriptions();
  const { data: workoutPlans } = useListWorkoutPlans();
  const { data: mealPlans } = useListMealPlans();

  const clientSubs = subscriptions?.filter(s => s.clientId === clientId) ?? [];
  const clientWorkouts = workoutPlans?.filter(w => w.clientId === clientId) ?? [];
  const clientMeals = mealPlans?.filter(m => m.clientId === clientId) ?? [];
  const clientCheckins = checkins ?? [];

  const updateClient = useUpdateClient();

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      weightKg: client?.weightKg ?? null,
      heightCm: client?.heightCm ?? null,
      goals: client?.goals ?? "",
      notes: client?.notes ?? "",
      status: client?.status ?? "active",
    },
    values: client ? {
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      weightKg: client.weightKg ?? null,
      heightCm: client.heightCm ?? null,
      goals: client.goals ?? "",
      notes: client.notes ?? "",
      status: client.status,
    } : undefined,
  });

  function onSubmit(values: z.infer<typeof editSchema>) {
    updateClient.mutate(
      { id: clientId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(clientId) });
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          setEditing(false);
          toast({ title: "Client updated" });
        },
        onError: () => toast({ title: "Error", description: "Failed to update client", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!client) return <div className="p-6 text-muted-foreground">Client not found</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/app/clients")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>
        <Badge variant={client.status === "active" ? "default" : "outline"}>{client.status}</Badge>
        {!editing ? (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={updateClient.isPending}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins ({clientCheckins.length})</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {editing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                  <CardContent className="p-6 grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Email</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weightKg" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="heightCm" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs uppercase tracking-wider">Height (cm)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="goals" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="text-xs uppercase tracking-wider">Goals</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel className="text-xs uppercase tracking-wider">Notes</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl></FormItem>
                    )} />
                  </CardContent>
                </Card>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Physical Stats</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Weight</span><span className="font-medium">{client.weightKg ? `${client.weightKg} kg` : "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Height</span><span className="font-medium">{client.heightCm ? `${client.heightCm} cm` : "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Phone</span><span className="font-medium">{client.phone ?? "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Client since</span><span className="font-medium">{format(new Date(client.createdAt), "MMM d, yyyy")}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Goals & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goals</p><p className="text-sm">{client.goals ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Coach Notes</p><p className="text-sm">{client.notes ?? "—"}</p></div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checkins">
          <Card>
            <CardContent className="p-0">
              {clientCheckins.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No check-ins recorded</div>
              ) : (
                <div className="divide-y divide-border">
                  {clientCheckins.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20).map(c => (
                    <div key={c.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{format(new Date(c.date), "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.weightKg && `${c.weightKg} kg`}
                          {c.moodScore && ` · Mood ${c.moodScore}/10`}
                          {c.energyLevel && ` · Energy ${c.energyLevel}/10`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {c.workoutCompleted && <Badge variant="default" className="text-xs">Workout</Badge>}
                        {c.mealsFollowed && <Badge variant="outline" className="text-xs">Meals</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Workout Plans</CardTitle></CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? <p className="text-sm text-muted-foreground">No workout plans assigned</p> : (
                  <div className="space-y-2">
                    {clientWorkouts.map(w => (
                      <div key={w.id} className="flex justify-between text-sm py-1">
                        <span>{w.title}</span>
                        {w.durationWeeks && <span className="text-muted-foreground">{w.durationWeeks}w</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Meal Plans</CardTitle></CardHeader>
              <CardContent>
                {clientMeals.length === 0 ? <p className="text-sm text-muted-foreground">No meal plans assigned</p> : (
                  <div className="space-y-2">
                    {clientMeals.map(m => (
                      <div key={m.id} className="flex justify-between text-sm py-1">
                        <span>{m.title}</span>
                        {m.targetCalories && <span className="text-muted-foreground">{m.targetCalories} kcal</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardContent className="p-0">
              {clientSubs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No subscriptions</div>
              ) : (
                <div className="divide-y divide-border">
                  {clientSubs.map(s => (
                    <div key={s.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{s.plan}</p>
                        <p className="text-xs text-muted-foreground">Since {format(new Date(s.startDate), "MMM d, yyyy")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${s.priceMonthly}/mo</span>
                        <Badge variant={s.status === "active" ? "default" : "outline"}>{s.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
