"use client";

import { useRouter } from "next/navigation";

const features = [
  { icon: "👥", title: "Clients", desc: "Manage all your clients in one place." },
  { icon: "🏋️", title: "Workouts", desc: "Create and assign custom workout plans." },
  { icon: "🥗", title: "Nutrition", desc: "Build and deliver personalized meal plans." },
  { icon: "💳", title: "Subscriptions", desc: "Sell programs and manage payments." },
  { icon: "🧑‍🏫", title: "Coach Profile", desc: "Build your professional profile and site." },
];

export default function CoachingPlatformDesign() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a12] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-card grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section */}
        <div className="bg-gradient-to-br from-[#6d28d9] via-[#1e3a8a] to-[#0f766e] dark:from-[#4a1d96] dark:via-[#1e2a5e] dark:to-[#0a4d44] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_white,_transparent_35%)]" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/30 bg-black/20 backdrop-blur-md text-cyan-300 text-[11px] sm:text-xs font-semibold tracking-wide w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              15-DAY FREE TRIAL
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                Your all-in-one <br />
                <span className="text-cyan-300">coaching platform</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                Manage clients, build programs, deliver nutrition plans
                and grow your coaching business.
              </p>
            </div>

            <button
              onClick={() => router.push("/register")}
              className="w-full max-w-xs bg-cyan-400 text-black hover:bg-cyan-300 transition-all duration-300 font-bold text-sm py-3 rounded-lg sm:rounded-xl shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              START FREE TRIAL →
            </button>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight">$200</span>
                <p className="text-cyan-300 text-[11px] sm:text-xs font-medium">One-time payment</p>
              </div>
              <button
                onClick={() => router.push("/register")}
                className="border border-white/30 text-white hover:bg-white/10 transition-all duration-300 font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-lg cursor-pointer"
              >
                Buy Full Access
              </button>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-white/70">
              <span>✓ Free for 15 days</span>
              <span>•</span>
              <span>Then $200 lifetime</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white dark:bg-card p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-foreground">Everything Included</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3 mb-6 sm:mb-8" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-border p-3 sm:p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xl sm:text-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-foreground">{feature.title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}