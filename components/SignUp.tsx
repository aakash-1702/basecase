"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client"; // ✅
import { signUp } from "@/lib/auth-client"; // ✅


export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      const result = await signUp(form.name.trim(), form.email, form.password);
      if (!result?.success) {
        toast.error(result?.error || "Sign up failed", { id: toastId });
        return;
      }
      toast.success("Welcome to Basecase!", { id: toastId });
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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
            Start your journey.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Create an account to track your progress, build consistency, and
            master problem-solving.
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  className={`h-12 bg-black/50 border-zinc-800 rounded-xl text-sm transition-all duration-300 ${
                    focused === "name"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className={`h-12 bg-black/50 border-zinc-800 rounded-xl text-sm transition-all duration-300 ${
                    focused === "email"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={`h-12 bg-black/50 border-zinc-800 rounded-xl text-sm transition-all duration-300 ${
                    focused === "password"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : ""
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
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

            {/* Sign in link */}
            <div className="mt-6 text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <a
                href="/auth/sign-in"
                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Sign In
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
