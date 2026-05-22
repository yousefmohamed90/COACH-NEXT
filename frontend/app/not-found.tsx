"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44]">
      <div className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-center">
        <AlertCircle className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">404 Page Not Found</h1>
        <p className="text-white/70 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/")} className="bg-white text-primary hover:bg-cyan-300 hover:text-black">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
