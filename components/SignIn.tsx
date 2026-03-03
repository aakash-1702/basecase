"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    const toastId = toast.loading("Signing in...");
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast.error(error.message || "Sign in failed", { id: toastId });
        return;
      }
      
      toast.success("Welcome back!", { id: toastId });
      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    // No toast, no try/catch needed — browser redirects immediately to Google
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 overflow-y-auto">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.08), transparent 60%)",
        }}
      />
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#f97316]">
              <span className="text-[9px] font-black text-black">BC</span>
            </div>
            <span className="text-[10px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
              Basecase
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-white">
            Welcome back.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Continue where you left off. Your progress is waiting.
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div
            className="absolute -inset-px rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(251,191,36,0.1), transparent 60%)",
            }}
          />
          <div className="relative bg-[#0c0c0f] border border-zinc-800/60 rounded-2xl p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email
                </label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  className={`h-12 bg-black/50 border-zinc-800 rounded-xl text-sm transition-all duration-300 ${
                    focused === "email"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : ""
                  }`}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-orange-400 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  {...form.register("password")}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  disabled={isLoading}
                  className={`h-12 bg-black/50 border-zinc-800 rounded-xl text-sm transition-all duration-300 ${
                    focused === "password"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : ""
                  }`}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-orange-400 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <a
                  href="/auth/forgot-password"
                  className="text-xs text-zinc-400 hover:text-orange-400 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-[#0c0c0f] text-zinc-600 uppercase tracking-widest">
                  or
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#4285F4"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* Sign up link */}
            <div className="mt-6 text-center text-sm text-zinc-400">
              Don't have an account?{" "}
              <a
                href="/auth/sign-up"
                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[11px] text-zinc-700">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
