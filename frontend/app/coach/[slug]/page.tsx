"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Dumbbell, Calendar, Info, ArrowDown, Send, Instagram, Twitter, Youtube, MessageCircle, Facebook, Link2 } from "lucide-react";

type CoachPlan = {
  id: number;
  name: string;
  description?: string | null;
  durationMonths: number;
  price: number;
  currency: string;
};

const contactSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  goals: z.string().min(10, "Please describe your goals briefly"),
});

export default function CoachPublicPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = (params?.slug as string) || "";

  const [coach, setCoach] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(true);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("No coach slug provided.");
      setCoachLoading(false);
      setPlansLoading(false);
      return;
    }

    fetch(`/api/public/coach/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Coach not found");
        return r.json();
      })
      .then((data) => {
        setCoach(data);
        return fetch(`/api/public/plans?slug=${slug}`);
      })
      .then((r) => r.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        setCoachLoading(false);
        setPlansLoading(false);
      });
  }, [slug]);

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", whatsapp: "", goals: "" },
  });

  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscription-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.whatsapp,
          package: "Contact Request",
          paymentMethod: "custom",
          coachId: coach?.id ?? 1,
          slug: slug || undefined,
          notes: values.goals,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast({
        title: "Request Sent!",
        description: "Thank you! The coach will contact you shortly.",
      });
      contactForm.reset();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const customStyles = (coach?.brandColor
    ? {
        "--primary": coach.brandColor.includes(" ")
          ? `hsl(${coach.brandColor})`
          : coach.brandColor,
        "--ring": coach.brandColor.includes(" ")
          ? `hsl(${coach.brandColor})`
          : coach.brandColor,
      }
    : {}) as React.CSSProperties;

  if (coachLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex flex-col items-center justify-center p-6 space-y-4">
        <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
        <Skeleton className="h-8 w-48 bg-white/20" />
        <Skeleton className="h-4 w-96 bg-white/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-8">
          <Skeleton className="h-80 w-full bg-white/10" />
          <Skeleton className="h-80 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white/10 text-white flex items-center justify-center rounded-none mb-4">
          <Info className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Profile Not Found</h1>
        <p className="text-white/70 max-w-sm mb-6">
          {error || "The coach profile you are looking for does not exist or has been deactivated."}
        </p>
        <Button onClick={() => router.push("/")} className="bg-white text-[#6d28d9] hover:bg-cyan-300 hover:text-black">Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground" style={customStyles}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] text-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_white,_transparent_35%)]" />
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tighter uppercase">
            {coach.name}
          </h1>
          <p className="text-white/80 mt-4 max-w-2xl text-base sm:text-lg leading-relaxed">
            {coach.welcomeMessage || coach.bio || "Welcome to my customized online coaching platform. Select a plan below to start your transformation today."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
            <Button
              className="h-12 px-8 text-sm font-bold uppercase tracking-wider bg-white text-[#6d28d9] hover:bg-cyan-300 hover:text-black w-full sm:w-auto"
              onClick={() => {
                document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Plans
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 text-sm font-bold uppercase tracking-wider border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              onClick={() => {
                document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </Button>
          </div>
          {(() => {
            let links: Record<string, string> = {};
            try { links = typeof coach.socialLinks === "string" ? JSON.parse(coach.socialLinks) : coach.socialLinks || {}; } catch {}
            const entries = Object.entries(links).filter(([, v]) => v);
            if (entries.length === 0) return null;
            return (
              <div className="flex items-center justify-center gap-3 mt-6">
                {entries.map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-cyan-300 transition-colors">
                    {key === "instagram" && <Instagram className="h-5 w-5" />}
                    {key === "twitter" && <Twitter className="h-5 w-5" />}
                    {key === "youtube" && <Youtube className="h-5 w-5" />}
                    {key === "whatsapp" && <MessageCircle className="h-5 w-5" />}
                    {key === "facebook" && <Facebook className="h-5 w-5" />}
                    {!["instagram","twitter","youtube","whatsapp","facebook"].includes(key) && <Link2 className="h-5 w-5" />}
                  </a>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* About Section */}
      {coach.bio && (
        <div className="bg-gradient-to-b from-[#1a0a2e] to-[#162447] dark:from-[#0d0d1a] dark:to-[#111827] px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white">About</h2>
              <div className="w-10 h-0.5 bg-cyan-400 mx-auto mt-3" />
            </div>
            <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-lg">
              <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {coach.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Section */}
      <div id="plans-section" className="bg-gradient-to-b from-[#162447] to-[#1a0a2e] dark:from-[#111827] dark:to-[#0d0d1a] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white">Coaching Packages</h2>
            <p className="text-white/60 mt-1 text-sm">Choose the transformation plan that fits your goals</p>
          </div>

          {plans.length === 0 ? (
            <div className="border border-white/10 bg-white/5 p-10 text-center text-white/50 rounded-lg">
              No active coaching plans available right now. Please check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative flex flex-col border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg hover:border-cyan-400/50 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold tracking-tight uppercase text-white">{plan.name}</CardTitle>
                    <CardDescription className="line-clamp-3 mt-2 text-sm leading-relaxed text-white/60">
                      {plan.description || "Get customized guidance, check-ins, and direct access."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="my-5">
                      <span className="text-3xl font-extrabold tracking-tight text-white">
                        {plan.currency} {plan.price.toFixed(0)}
                      </span>
                      <span className="text-white/50 text-sm ml-2">
                        / {plan.durationMonths === 1 ? "month" : `${plan.durationMonths} mos`}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-6 text-sm flex-1">
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-white/70">Custom Workout & Nutrition Plans</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-white/70">Weekly Check-ins & Progress Analytics</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-white/70">{plan.durationMonths} Month Duration</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push(`/coach/${slug}/subscribe?planId=${plan.id}`)}
                      className="w-full h-11 text-sm font-bold uppercase tracking-wider rounded-lg bg-cyan-400 text-black hover:bg-cyan-300"
                    >
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact-section" className="bg-gradient-to-b from-[#1a0a2e] to-[#0f0518] dark:from-[#0d0d1a] dark:to-[#09090b] px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white">Get Started</h2>
            <p className="text-white/60 mt-1 text-sm">Send us your details and we&apos;ll get back to you</p>
            <div className="w-10 h-0.5 bg-cyan-400 mx-auto mt-3" />
          </div>

          <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg">
            <div className="h-1 bg-cyan-400 w-full rounded-t-lg" />
            <div className="p-6 sm:p-8">
              <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold mb-1.5 block text-white/80">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <Input
                    placeholder="Your full name"
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...contactForm.register("name")}
                  />
                  {contactForm.formState.errors.name && (
                    <p className="text-sm text-red-400 mt-1">{contactForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold mb-1.5 block text-white/80">
                    Email <span className="text-cyan-400">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...contactForm.register("email")}
                  />
                  {contactForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1">{contactForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold mb-1.5 block text-white/80">
                    WhatsApp <span className="text-cyan-400">*</span>
                  </label>
                  <Input
                    placeholder="+966 5xxxxxxxx"
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...contactForm.register("whatsapp")}
                  />
                  {contactForm.formState.errors.whatsapp && (
                    <p className="text-sm text-red-400 mt-1">{contactForm.formState.errors.whatsapp.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold mb-1.5 block text-white/80">
                    Goals <span className="text-cyan-400">*</span>
                  </label>
                  <Textarea
                    placeholder="Tell us about your fitness goals, experience level, and what you're looking for..."
                    className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    {...contactForm.register("goals")}
                  />
                  {contactForm.formState.errors.goals && (
                    <p className="text-sm text-red-400 mt-1">{contactForm.formState.errors.goals.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-bold uppercase tracking-wider bg-cyan-400 text-black hover:bg-cyan-300 rounded-lg"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0f0518] dark:bg-[#09090b] border-t border-white/10 py-6 text-center text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} {coach.name}. Powered by TRAINOVA</p>
      </div>
    </div>
  );
}
