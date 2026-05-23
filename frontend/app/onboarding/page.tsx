"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().optional(),
  welcomeMessage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}

function OnboardingForm() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams?.get("checkout_id");
  const isTrial = searchParams?.get("trial") === "true";
  const trialCoachId = searchParams?.get("coachId");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "pending" | "ready" | "completed" | "error">("loading");
  const [coachId, setCoachId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", password: "", confirmPassword: "", bio: "", welcomeMessage: "" },
  });

  useEffect(() => {
    if (isTrial && trialCoachId) {
      setCoachId(parseInt(trialCoachId, 10));
      setStatus("ready");
      return;
    }

    if (!checkoutId) {
      setStatus("error");
      setError("No checkout ID provided");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/platform/onboarding/status/${checkoutId}`);
        if (!res.ok) throw new Error("Failed to check status");
        const data = await res.json();

        if (data.status === "completed") {
          setStatus("ready");
          setCoachId(data.coachId);
        } else {
          setStatus("pending");
        }
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to check status");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkoutId, isTrial, trialCoachId]);

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!coachId) return;

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId,
          slug: values.slug,
          password: values.password,
          bio: values.bio || null,
          welcomeMessage: values.welcomeMessage || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Onboarding failed");
      }

      setCompleted(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48 mx-auto bg-white/20" />
          <Skeleton className="h-96 w-full bg-white/20" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Setup Error</h2>
          <p className="text-white/70 mb-6">{error || "Something went wrong"}</p>
          <Button onClick={() => router.push("/")} className="w-full bg-white text-primary hover:bg-cyan-300 hover:text-black">Return to Home</Button>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-white/10 border border-cyan-300/30 text-cyan-300 flex items-center justify-center mx-auto mb-4 rounded-2xl">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Setting Up Your Account</h2>
          <p className="text-white/70 mb-6">
            We&apos;re processing your payment. This usually takes a few seconds...
          </p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-300" />
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-white/10 border border-green-400/30 text-green-400 flex items-center justify-center mx-auto mb-4 rounded-2xl">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">All Set!</h2>
          <p className="text-white/70">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white">TRAINOVA</h1>
          <p className="text-cyan-300 mt-1 text-sm uppercase tracking-widest">Set Up Your Coach Site</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          {isTrial && (
            <div className="mb-6 p-3 bg-cyan-400/10 border border-cyan-300/30 rounded-xl text-center">
              <p className="text-sm font-semibold text-cyan-300">15-Day Free Trial</p>
              <p className="text-xs text-white/60">Set up your site now, pay later</p>
            </div>
          )}

          <h2 className="text-xl font-bold text-white mb-1">Customize Your Site</h2>
          <p className="text-sm text-white/70 mb-6">Choose your subdomain and set a password</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Your Subdomain</FormLabel>
                    <FormControl>
                      <div className="flex items-center bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                        <Input
                          placeholder="yourname"
                          className="border-0 bg-transparent text-white placeholder:text-white/40 rounded-none"
                          {...field}
                        />
                        <span className="px-3 text-white/40 text-sm whitespace-nowrap">.trainova.com</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 6 characters" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Repeat your password" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Bio (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell potential clients about yourself..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Welcome Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Message to show on your coach profile page..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full bg-white text-primary hover:bg-cyan-300 hover:text-black font-bold">
                Complete Setup
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}