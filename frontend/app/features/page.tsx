"use client";

import { Button } from "@/components/ui/button";
import { Dumbbell, Users, BarChart3, Zap, ShoppingCart, ArrowRight, ClipboardList, Utensils, CreditCard, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Features() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="border-b border-border py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            Everything You Need to <span className="text-primary">Coach Online</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            A complete platform built for fitness professionals. No monthly fees, no limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-base font-bold uppercase tracking-wider"
              onClick={() => router.push("/register")}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy Your Coach Site — $200
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Workout Builder */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <Dumbbell className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Workout Builder</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Design custom workout plans tailored to each client's goals. Drag-and-drop exercise selection, 
              set rep ranges, rest times, and progression schemes. Save templates for quick reuse.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Custom exercise library with video demonstrations</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Set, rep, and rest period tracking</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Templates for rapid plan creation</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Progressive overload tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Client Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-12 sm:mb-24">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Client Management</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Manage all your clients from a single dashboard. Assign workout and meal plans, 
              track check-ins, monitor adherence, and communicate effectively.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Client profiles with progress photos and notes</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Check-in system with weight, body fat, and measurements</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Plan assignment and scheduling</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Unlimited client capacity</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Analytics & Reporting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-12 sm:mb-24">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Analytics & Reporting</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Visual dashboards that track client progress over time. Weight trends, check-in compliance, 
              mood tracking, and body measurements — all in one place.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Weight and measurement trend charts</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Check-in compliance rates</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Mood and energy tracking</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Exportable progress reports</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Branded Coach Site */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-12 sm:mb-24">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <Globe className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Branded Coach Site</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Get your own public-facing coach website with custom branding. Clients can view your 
              services, pricing tiers, and sign up for coaching directly.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Custom URL (your-brand.trainova.com)</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Bio, welcome message, and coach profile</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Subscription tier display and signup</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Client login portal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-12 sm:mb-24">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <CreditCard className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Subscription Management</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Create and manage subscription tiers for your coaching services. Set pricing, 
              manage active subscribers, and track recurring revenue.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Multiple subscription tier options</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Active subscriber management</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Revenue tracking</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Client subscription status overview</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Meal Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          <div>
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6">
              <Utensils className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Meal Planning</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Build detailed nutrition plans with meal timings, macronutrient targets, and portion guides. 
              Assign plans to clients and track their adherence.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Custom meal plans with macro tracking</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Meal timing and portion guidance</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Recipe and food database</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span>Client adherence tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-card/25 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join coaches who are already using TRAINOVA to grow their online coaching business.
          </p>
          <Button 
            size="lg" 
            className="h-14 px-8 text-base font-bold uppercase tracking-wider"
            onClick={() => router.push("/register")}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy Your Coach Site — $200
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
