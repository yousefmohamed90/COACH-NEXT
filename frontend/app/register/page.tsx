"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
});

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      const res = await fetch("/api/platform/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          successUrl: `${window.location.origin}/onboarding`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create checkout");
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      toast({ 
        title: "Checkout failed", 
        description: err instanceof Error ? err.message : "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white">TRAINOVA</h1>
          <p className="text-cyan-300 mt-1 text-sm uppercase tracking-widest">Get Your Coach Site</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          <div className="mb-6 p-4 bg-white/10 border border-cyan-300/30 rounded-xl">
            <p className="text-sm font-semibold text-cyan-300 mb-1">$200 One-Time Payment</p>
            <p className="text-xs text-white/60">Lifetime access • No monthly fees</p>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Start Your Setup</h2>
          <p className="text-sm text-white/70 mb-6">Enter your details to begin the checkout process</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Carter" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="coach@trainova.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-white text-primary hover:bg-cyan-300 hover:text-black font-bold" disabled={loading}>
                {loading ? "Processing..." : (
                  <>
                    Continue to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:text-white transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
