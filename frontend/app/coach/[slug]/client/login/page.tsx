"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ClientLogin() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await res.json();
      
      if (data.user.role !== "client") {
        throw new Error("This login is for clients only");
      }

      router.push(`/coach/${slug}/client/dashboard`);
    } catch (err) {
      toast({ 
        title: "Login failed", 
        description: err instanceof Error ? err.message : "Something went wrong", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-primary">TRAINOVA</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest">Client Portal</p>
        </div>

        <div className="border border-border bg-card p-8">
          <h2 className="text-xl font-bold mb-1">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">Access your coaching dashboard</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="client@email.com" {...field} />
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
                    <FormLabel className="text-xs uppercase tracking-wider">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <Link href={`/coach/${slug}`} className="text-primary hover:underline font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
