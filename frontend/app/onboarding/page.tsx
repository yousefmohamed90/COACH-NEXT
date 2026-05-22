"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  const checkoutId = new URLSearchParams(window.location.search).get("checkout_id");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "pending" | "completed" | "error">("loading");
  const [coachId, setCoachId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", password: "", confirmPassword: "", bio: "", welcomeMessage: "" },
  });

  useEffect(() => {
    if (!checkoutId) {
      setStatus("error");
      setError("No checkout ID provided");
      return;
    }

    // Poll for onboarding status
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/platform/onboarding/status/${checkoutId}`);
        if (!res.ok) throw new Error("Failed to check status");
        const data = await res.json();
        
        if (data.status === "completed") {
          setStatus("completed");
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
  }, [checkoutId]);

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
            We're processing your payment. This usually takes a few seconds...
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
          <CheckCircle className="h-16 w-16 text-cyan-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Setup Complete!</h2>
          <p className="text-white/70">
            Your coach account is ready. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white">TRAINOVA</h1>
          <p className="text-cyan-300 mt-1 text-sm uppercase tracking-widest">Complete Your Setup</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Coach Account Setup</h2>
          <p className="text-white/70 mb-6">Choose your unique URL and set your password</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                      Your URL Slug <span className="text-cyan-300">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-white/60 text-sm bg-white/10 px-3 py-2 border border-r-0 border-white/20 rounded-l-lg">
                          trainova.com/coach/
                        </span>
                        <Input placeholder="john-smith" className="rounded-l-none h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-white/50 mt-1">
                      Only lowercase letters, numbers, and hyphens. This cannot be changed later.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                      Password <span className="text-cyan-300">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
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
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                      Confirm Password <span className="text-cyan-300">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
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
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                      Bio (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tell clients about yourself and your coaching philosophy..." 
                        className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        {...field} 
                      />
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
                    <FormLabel className="text-xs uppercase tracking-wider font-semibold text-cyan-300">
                      Welcome Message (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Start Your Transformation" 
                        className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-red-300 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" className="w-full h-12 text-base font-semibold tracking-wide bg-white text-primary hover:bg-cyan-300 hover:text-black">
                Complete Setup
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
