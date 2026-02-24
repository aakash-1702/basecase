"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth-actions";

const formSchema = z.object({
  email: z.string().email("Invalid uplink address"),
  password: z.string().min(1, "Access key required"),
});

type FormValues = z.infer<typeof formSchema>;

const stages = [
  {
    rank: "DORMANT",
    badge: "00",
    msg: "System standby. Awaiting operator credentials.",
    color: "#71717a",
    glow: "rgba(82,82,91,0.12)",
    bar: "from-zinc-700 to-zinc-600",
    pct: 0,
  },
  {
    rank: "LOCATED",
    badge: "01",
    msg: "Uplink address confirmed. Key required.",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
    bar: "from-blue-600 to-blue-400",
    pct: 50,
  },
  {
    rank: "UNLOCKED",
    badge: "02",
    msg: "Credentials loaded. Ready to authenticate.",
    color: "#f97316",
    glow: "rgba(249,115,22,0.2)",
    bar: "from-orange-600 to-amber-400",
    pct: 100,
  },
];

export default function SignInForm() {
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const [watchEmail, setWatchEmail] = useState("");
  const [watchPassword, setWatchPassword] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  // Compute stage from field values
  useEffect(() => {
    let s = 0;
    if (watchEmail.includes("@") && watchEmail.length > 5) s = 1;
    if (s === 1 && watchPassword.length >= 1) s = 2;
    setStage(s);
  }, [watchEmail, watchPassword]);

  async function onSubmit(values: FormValues) {
    const toastId = toast.loading("Establishing secure link...");
    try {
      const result = await signIn(values.email, values.password);
      if (!result.success) {
        toast.error(result.error || "Authentication failed.", { id: toastId });
        return;
      }
      toast.success("Access granted. Welcome back, Operator.", { id: toastId });
      router.refresh();
      router.push("/dashboard");
    } catch {
      toast.error("Protocol error. Connection lost.", { id: toastId });
    }
  }

  const current = stages[stage];

  return (
    <div
      className="min-h-screen bg-[#06060a] text-white flex items-center justify-center p-4 overflow-y-auto"
      style={{ fontFamily: "'DM Mono', 'Fira Mono', monospace" }}
    >
      {/* Background Ambience */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${current.glow}, transparent 70%)`,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 py-10">
        {/* HERO HEADER */}
        <div className="mb-10 px-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-sm flex items-center justify-center bg-[#f97316]">
              <span className="text-[8px] font-black text-black">BC</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">
              Basecase Terminal
            </span>
          </div>

          <h1 className="text-[40px] font-black leading-[0.95] tracking-tighter mb-4">
            RE-SYNC.
            <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px #f97316" }}
            >
              RESUME ASCENT.
            </span>
          </h1>

          <p className="text-[12px] font-medium text-zinc-400 leading-relaxed max-w-[340px]">
            The system remembers you. Restore your
            <span className="text-white"> operator profile</span> and pick up
            where you left off.
          </p>
        </div>

        {/* PROGRESS HUD */}
        <div className="mb-6 px-1">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase mb-1">
                Auth Status
              </span>
              <span
                className="text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-500"
                style={{ color: current.color }}
              >
                {current.rank}{" "}
                <span className="opacity-40">[{current.badge}]</span>
              </span>
            </div>
            <span
              className="text-[14px] font-black tabular-nums transition-colors duration-500"
              style={{ color: current.color }}
            >
              {current.pct}%
            </span>
          </div>

          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${current.bar} transition-all duration-700 ease-out`}
              style={{ width: `${current.pct === 0 ? 2 : current.pct}%` }}
            />
          </div>
        </div>

        {/* CARD */}
        <div className="relative">
          <div
            className="absolute -inset-[1px] rounded-[24px] transition-all duration-700"
            style={{
              background: "linear-gradient(140deg, #f97316, #fbbf24, #ea580c)",
              opacity: stage === 2 ? 0.8 : 0.3,
            }}
          />

          <div className="relative bg-[#0b0b0f] rounded-[23px] overflow-hidden">
            <div className="p-8 md:p-10">
              {/* Terminal Status Message */}
              <div className="mb-8 flex items-start gap-2 h-8">
                <span className="text-[#f97316] font-bold text-[10px] mt-[1px]">
                  ▸
                </span>
                <span className="text-[11px] font-bold leading-tight tracking-wide transition-all duration-500 text-zinc-300">
                  {isLoading ? "Validating security keys..." : current.msg}
                </span>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Email Field */}
                <div className="relative">
                  <label
                    className="absolute left-4 -top-2 px-1 bg-[#0b0b0f] text-[8px] font-black tracking-[0.2em] transition-colors duration-300 z-10"
                    style={{
                      color: focused === "email" ? "#f97316" : "#3f3f46",
                    }}
                  >
                    MAIL_ID
                  </label>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="operator@basecase.os"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => {
                      form.register("email").onChange(e);
                      setWatchEmail(e.target.value);
                    }}
                    disabled={isLoading}
                    className="bg-white/[0.03] border-zinc-800 rounded-lg h-[52px] px-4 text-[13px] font-medium placeholder:text-zinc-800 focus-visible:ring-0 transition-all duration-300"
                    style={{
                      borderColor:
                        focused === "email"
                          ? "rgba(249,115,22,0.5)"
                          : "rgba(255,255,255,0.05)",
                    }}
                  />
                  {form.formState.errors.email && (
                    <p className="text-[9px] text-orange-500/80 mt-1 font-bold tracking-tight">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <label
                    className="absolute left-4 -top-2 px-1 bg-[#0b0b0f] text-[8px] font-black tracking-[0.2em] transition-colors duration-300 z-10"
                    style={{
                      color: focused === "password" ? "#f97316" : "#3f3f46",
                    }}
                  >
                    ACCESS_KEY
                  </label>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="••••••••"
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => {
                      form.register("password").onChange(e);
                      setWatchPassword(e.target.value);
                    }}
                    disabled={isLoading}
                    className="bg-white/[0.03] border-zinc-800 rounded-lg h-[52px] px-4 text-[13px] font-medium placeholder:text-zinc-800 focus-visible:ring-0 transition-all duration-300"
                    style={{
                      borderColor:
                        focused === "password"
                          ? "rgba(249,115,22,0.5)"
                          : "rgba(255,255,255,0.05)",
                    }}
                  />
                  {form.formState.errors.password && (
                    <p className="text-[9px] text-orange-500/80 mt-1 font-bold tracking-tight">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || stage < 2}
                  className="w-full h-[56px] rounded-lg text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-300 mt-2"
                  style={{
                    background: stage === 2 ? "#f97316" : "#18181b",
                    color: stage === 2 ? "#000" : "#3f3f46",
                    boxShadow:
                      stage === 2 ? "0 0 20px rgba(249,115,22,0.3)" : "none",
                  }}
                >
                  {isLoading
                    ? "AUTHORIZING..."
                    : stage < 2
                      ? `LOCKED: ${2 - stage} STEP${2 - stage !== 1 ? "S" : ""} LEFT`
                      : "INITIATE LOGIN →"}
                </button>
              </form>

              <div className="mt-8 text-center space-y-4">
                <a
                  href="/auth/forgot-password"
                  className="block text-[9px] font-bold tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors uppercase"
                >
                  Lost Key Recovery
                </a>
                <a
                  href="/auth/sign-up"
                  className="block text-[10px] font-bold tracking-widest text-zinc-500 hover:text-[#f97316] transition-colors uppercase"
                >
                  No Uplink?{" "}
                  <span className="text-zinc-300 underline underline-offset-4 decoration-zinc-800">
                    Request Access
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[8px] font-bold tracking-[0.6em] text-zinc-800 uppercase">
          Basecase OS v2.0 // Node_Active
        </p>
      </div>
    </div>
  );
}
