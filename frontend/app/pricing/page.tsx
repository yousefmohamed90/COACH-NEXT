"use client";

import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, ArrowRight, Dumbbell, Users, BarChart3, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="border-b border-border py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            Simple, <span className="text-primary">Transparent Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            One payment. Lifetime access. Everything you need to run your coaching business.
          </p>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border bg-card max-w-md mx-auto">
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold uppercase mb-2">Coach Seat</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold">$200</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Unlimited clients</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Workout & meal plan builders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Client check-ins & analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Branded public coach site</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Subscription tier management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>No monthly fees</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base font-bold uppercase tracking-wider"
                onClick={() => router.push("/register")}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Buy Your Coach Site — $200
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">One-time payment • No monthly fees • Full access • Your own branded site</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="border-t border-border bg-card/25 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every feature you need to coach professionally
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="border border-border bg-card p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg uppercase mb-2">Workout Builder</h3>
              <p className="text-sm text-muted-foreground">Create custom workout plans with exercises, sets, reps, and templates</p>
            </div>

            <div className="border border-border bg-card p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg uppercase mb-2">Client Management</h3>
              <p className="text-sm text-muted-foreground">Track clients, assign plans, and monitor progress all in one place</p>
            </div>

            <div className="border border-border bg-card p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg uppercase mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">Visual dashboards for weight trends, check-ins, mood, and compliance</p>
            </div>

            <div className="border border-border bg-card p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg uppercase mb-2">Branded Site</h3>
              <p className="text-sm text-muted-foreground">Your own public coach site with custom branding and subscription tiers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6 sm:py-8 text-center text-xs text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} TRAINOVA. All rights reserved.</p>
        <p>
          <button onClick={() => router.push("/login")} className="hover:text-primary transition-colors underline underline-offset-2">
            Coach Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
