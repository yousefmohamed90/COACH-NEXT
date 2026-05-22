"use client";

import { Button } from "@/components/ui/button";
import { Dumbbell, ShoppingCart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="border-b border-border py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            About <span className="text-primary">TRAINOVA</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Empowering fitness coaches with a complete digital platform to manage, train, and grow.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            TRAINOVA was built for coaches who want full control over their online coaching business without 
            paying recurring monthly fees. We believe that fitness professionals should own their platform, 
            their brand, and their client relationships.
          </p>
        </div>

        <div className="border border-border bg-card p-8 mb-8">
          <h3 className="font-bold text-lg uppercase mb-2">Why We Built TRAINOVA</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Most coaching platforms charge expensive monthly subscriptions that eat into your earnings. 
            We created TRAINOVA as a one-time purchase alternative that gives you lifetime access to 
            professional-grade coaching tools. No upsells, no hidden fees, no monthly bills.
          </p>
        </div>

        <div className="border border-border bg-card p-8">
          <h3 className="font-bold text-lg uppercase mb-2">For Coaches, By Coaches</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every feature in TRAINOVA is designed around the real workflow of a fitness coach. 
            From workout programming to client check-ins, from nutrition planning to analytics — 
            we've built the tools that coaches actually need and use daily.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-card/25 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight uppercase mb-4">Start Your Coaching Platform</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            One payment. Lifetime access. Your own branded coach site.
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
