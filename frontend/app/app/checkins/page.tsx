"use client";
import { useState } from "react";
import { useListCheckins, useCreateCheckin, useDeleteCheckin, getListCheckinsQueryKey, useListClients } from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, ClipboardCheck, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const createSchema = z.object({
  clientId: z.coerce.number().min(1, "Client is required"),
  date: z.string().min(1, "Date is required"),
  weightKg: z.coerce.number().optional().nullable(),
  energyLevel: z.coerce.number().min(1).max(10).optional().nullable(),
  moodScore: z.coerce.number().min(1).max(10).optional().nullable(),
  sleepHours: z.coerce.number().optional().nullable(),
  workoutCompleted: z.boolean().default(false),
  mealsFollowed: z.boolean().default(false),
  waterMl: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

export default function Checkins() {
  const [open, setOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();
  const { data: clients } = useListClients();
  const { data: checkins, isLoading } = useListCheckins(clientFilter ? { clientId: clientFilter } : {});
  const createCheckin = useCreateCheckin();
  const deleteCheckin = useDeleteCheckin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      workoutCompleted: false,
      mealsFollowed: false,
    },
  });

  function onSubmit(values: z.infer<typeof createSchema>) {
    createCheckin.mutate(
      { data: { ...values, date: new Date(values.date).toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCheckinsQueryKey() });
          setOpen(false);
          form.reset({ date: new Date().toISOString().split("T")[0], workoutCompleted: false, mealsFollowed: false });
          toast({ title: "Check-in recorded" });
        },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      }
    );
  }

  const clientMap = Object.fromEntries((clients ?? []).map(c => [c.id, c.name]));
  const sorted = [...(checkins ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Check-ins</h1>
          <p className="text-sm text-muted-foreground mt-1">{checkins?.length ?? 0} records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-checkin" size="sm">
              <Plus className="h-4 w-4 mr-2" />New Check-in
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Check-in</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Client *</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value ? String(field.value) : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="weightKg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Weight (kg)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sleepHours" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Sleep (hrs)</FormLabel>
                      <FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="energyLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Energy (1-10)</FormLabel>
                      <FormControl><Input type="number" min="1" max="10" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="moodScore" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider">Mood (1-10)</FormLabel>
                      <FormControl><Input type="number" min="1" max="10" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-6">
                  <FormField control={form.control} name="workoutCompleted" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-sm cursor-pointer">Workout done</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="mealsFollowed" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="text-sm cursor-pointer">Meals followed</FormLabel>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Notes</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createCheckin.isPending}>
                  {createCheckin.isPending ? "Recording..." : "Record Check-in"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select onValueChange={(v) => setClientFilter(v === "all" ? undefined : parseInt(v))} defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No check-ins recorded</p>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y divide-border border border-border">
          {sorted.map(c => (
            <div key={c.id} data-testid={`row-checkin-${c.id}`} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-sm">{clientMap[c.clientId] ?? `Client ${c.clientId}`}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(c.date), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.weightKg && <span className="text-xs text-muted-foreground">{c.weightKg} kg</span>}
                {c.moodScore && (
                  <span className="text-xs text-muted-foreground">Mood {c.moodScore}/10</span>
                )}
                {c.energyLevel && (
                  <span className="text-xs text-muted-foreground hidden sm:block">Energy {c.energyLevel}/10</span>
                )}
                <div className="flex gap-1">
                  {c.workoutCompleted
                    ? <CheckCircle className="h-4 w-4 text-primary" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  {c.mealsFollowed
                    ? <CheckCircle className="h-4 w-4 text-chart-3" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <button
                  onClick={() => deleteCheckin.mutate({ id: c.id }, {
                    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCheckinsQueryKey() })
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
    </div>
  );
}
