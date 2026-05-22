"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, CheckCircle } from "lucide-react";

const schema = z.object({
  weightKg: z.string().optional(),
  moodScore: z.string().optional(),
  energyLevel: z.string().optional(),
  sleepHours: z.string().optional(),
  workoutCompleted: z.boolean().optional(),
  mealsFollowed: z.boolean().optional(),
  waterMl: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClientCheckins() {
  const router = useRouter();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { 
      weightKg: "", 
      moodScore: "", 
      energyLevel: "", 
      sleepHours: "", 
      workoutCompleted: false, 
      mealsFollowed: false, 
      waterMl: "", 
      notes: "" 
    },
  });

  useEffect(() => {
    fetch("/api/client/checkins")
      .then(r => r.json())
      .then(data => setCheckins(Array.isArray(data) ? data : []))
      .catch(() => setCheckins([]))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const res = await fetch("/api/client/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to submit check-in");

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        form.reset();
        // Reload checkins
        fetch("/api/client/checkins")
          .then(r => r.json())
          .then(data => setCheckins(Array.isArray(data) ? data : []));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/client/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-primary">Daily Check-in</h1>
            <p className="text-muted-foreground mt-1">Log your progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in Form */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg uppercase flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Check-in
              </CardTitle>
              <CardDescription>Submit your daily progress update</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-semibold">Check-in Submitted!</p>
                  <p className="text-sm text-muted-foreground">Your coach will review your progress.</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="weightKg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="75.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moodScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Mood (1-10)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" placeholder="7" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="energyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Energy Level (1-10)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" placeholder="8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sleepHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Sleep Hours</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" placeholder="7.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="waterMl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Water Intake (ml)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider">Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Any additional notes..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">Submit Check-in</Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Check-in History */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg uppercase">Recent History</CardTitle>
              <CardDescription>Your past check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : checkins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No check-ins yet</p>
              ) : (
                <div className="space-y-3">
                  {checkins.slice(0, 5).map((checkin) => (
                    <div key={checkin.id} className="border border-border p-3 text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{new Date(checkin.date).toLocaleDateString()}</span>
                        {checkin.weightKg && <span>{checkin.weightKg} kg</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {checkin.moodScore && <span>Mood: {checkin.moodScore}/10</span>}
                        {checkin.energyLevel && <span>Energy: {checkin.energyLevel}/10</span>}
                        {checkin.sleepHours && <span>Sleep: {checkin.sleepHours}h</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
