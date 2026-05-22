"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

type CoachPlan = {
  id: number; name: string; description?: string | null;
  durationMonths: number; price: number; currency: string;
};

const COUNTRY_CODES = [
  { label: "Saudi Arabia (+966)", value: "+966" },
  { label: "UAE (+971)", value: "+971" },
  { label: "Kuwait (+965)", value: "+965" },
  { label: "Bahrain (+973)", value: "+973" },
  { label: "Qatar (+974)", value: "+974" },
  { label: "Oman (+968)", value: "+968" },
  { label: "Egypt (+20)", value: "+20" },
  { label: "Jordan (+962)", value: "+962" },
  { label: "UK (+44)", value: "+44" },
  { label: "USA (+1)", value: "+1" },
];

const PAYMENT_METHODS = [
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Credit / Debit Card", value: "card" },
  { label: "Cash", value: "cash" },
  { label: "PayPal", value: "paypal" },
  { label: "Crypto", value: "crypto" },
];

function durationLabel(months: number) {
  if (months === 1) return "1 Month";
  if (months === 3) return "3 Months";
  if (months === 12) return "1 Year";
  return `${months} Months`;
}

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  countryCode: z.string().min(1),
  phone: z.string().min(5, "Enter phone number"),
  planId: z.string().min(1, "Select a plan"),
  paymentMethod: z.string().min(1, "Select payment method"),
});

export default function Subscribe() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";

  const [coach, setCoach] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(true);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      fetch(`/api/public/plans?coachId=1`)
        .then(r => r.json())
        .then(data => setPlans(Array.isArray(data) ? data : []))
        .catch(() => setPlans([]))
        .finally(() => setPlansLoading(false));
      setCoachLoading(false);
      return;
    }

    fetch(`/api/public/coach/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error("Coach not found");
        return r.json();
      })
      .then(data => {
        setCoach(data);
        return fetch(`/api/public/plans?slug=${slug}`);
      })
      .then(r => r.json())
      .then(data => setPlans(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err.message || "Failed to load coach profile");
        setPlans([]);
      })
      .finally(() => {
        setCoachLoading(false);
        setPlansLoading(false);
      });
  }, [slug]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", countryCode: "+966", phone: "", planId: searchParams.get("planId") || "", paymentMethod: "" },
  });

  const selectedPlan = plans.find(p => String(p.id) === form.watch("planId"));

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    setError(null);

    const plan = plans.find(p => String(p.id) === values.planId);
    const planLabel = plan
      ? `${plan.name} — ${plan.currency} ${plan.price} / ${durationLabel(plan.durationMonths)}`
      : values.planId;

    try {
      const res = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: `${values.countryCode}${values.phone}`,
          countryCode: values.countryCode,
          package: planLabel,
          paymentMethod: values.paymentMethod,
          coachId: coach?.id ?? 1,
          slug: slug || undefined,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const customStyles = coach?.brandColor ? {
    "--primary": coach.brandColor.includes(" ") ? `hsl(${coach.brandColor})` : coach.brandColor,
    "--ring": coach.brandColor.includes(" ") ? `hsl(${coach.brandColor})` : coach.brandColor,
  } as React.CSSProperties : {};

  if (coachLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" style={customStyles}>
        <div className="w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your subscription request has been received. The coach will review your details and contact you shortly to confirm everything.
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{coach?.name || "TRAINOVA"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={customStyles}>
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          {coach?.logoUrl ? (
            <img src={coach.logoUrl} alt={coach.name} className="h-16 mx-auto mb-2 object-contain" />
          ) : (
            <h1 className="text-3xl font-bold tracking-tighter text-primary">
              {coach?.name ? coach.name.toUpperCase() : "TRAINOVA"}
            </h1>
          )}
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest">
            {coach?.welcomeMessage || "Start Your Transformation"}
          </p>
        </div>

        <div className="border border-border bg-card">
          <div className="h-1 bg-primary w-full" />
          <div className="p-8">
            <h2 className="text-xl font-bold mb-1 tracking-tight">Subscribe to Coaching</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Fill out the form and the coach will contact you to confirm your plan and get started.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold">
                      Full Name <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" className="h-11 bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold">
                      Email <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" className="h-11 bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold mb-2">
                    WhatsApp Number <span className="text-primary">*</span>
                  </p>
                  <div className="flex gap-2">
                    <FormField control={form.control} name="countryCode" render={({ field }) => (
                      <FormItem className="w-52 shrink-0">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-background"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRY_CODES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="5xxxxxxxx" className="h-11 bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <FormField control={form.control} name="planId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold">
                      Choose Plan <span className="text-primary">*</span>
                    </FormLabel>
                    {plansLoading ? (
                      <Skeleton className="h-11 w-full" />
                    ) : plans.length === 0 ? (
                      <div className="h-11 border border-border flex items-center px-3 text-sm text-muted-foreground">
                        No plans available yet
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Select a coaching plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — {p.currency} {p.price.toFixed(0)} / {durationLabel(p.durationMonths)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                    {selectedPlan?.description && (
                      <p className="text-xs text-muted-foreground mt-1">{selectedPlan.description}</p>
                    )}
                  </FormItem>
                )} />

                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold">
                      Payment Method <span className="text-primary">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-background">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3 py-1">
                  * After receiving your request, the coach will get in touch to confirm all the details about your current condition and goals.
                </p>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">{error}</p>
                )}

                <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide" disabled={loading}>
                  {loading ? "Submitting..." : "Send Request"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already a member?{" "}
          <a href="/login" className="text-primary hover:underline">Sign in to your account</a>
        </p>
      </div>
    </div>
  );
}
