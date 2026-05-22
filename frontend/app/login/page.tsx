"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, getGetMeQueryKey } from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useLogin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    login.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetMeQueryKey(), data.user);
          router.push("/app/dashboard");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-white">TRAINOVA</h1>
          <p className="text-cyan-300 mt-1 text-sm uppercase tracking-widest">Coach Sign In</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-sm text-white/70 mb-6">Access your coaching dashboard</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider text-cyan-300">Email</FormLabel>
                    <FormControl>
                      <Input data-testid="input-email" placeholder="coach@trainova.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
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
                      <Input data-testid="input-password" type="password" placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button data-testid="button-login" type="submit" className="w-full bg-white text-primary hover:bg-cyan-300 hover:text-black font-bold" disabled={login.isPending}>
                {login.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <Link href="/register" className="text-sm text-cyan-300 hover:text-white transition-colors font-medium">
              Buy Your Coach Site — $200
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
