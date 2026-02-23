"use client";

import React, { useState } from "react";
import { signUp } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SignupForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp(
        formData.name,
        formData.email,
        formData.password,
      );

      if (!result.success || !result.data?.user) {
        setError(result.error || "Unable to create account");
        return;
      }

      console.log("User created:", result.data.user);
      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle ambient glow matching sheets page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-neutral-950 to-neutral-950 opacity-70" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[500px] md:w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl animate-pulse-glow opacity-40" />
      </div>

      <div
        className={cn(
          "relative w-full max-w-md",
          "bg-neutral-900/65 backdrop-blur-xl border border-neutral-800/60 rounded-2xl",
          "shadow-2xl shadow-black/50",
          "p-8 sm:p-10",
          "animate-fade-in-up",
        )}
      >
        <h2
          className={cn(
            "text-2xl sm:text-3xl font-bold text-center mb-8",
            "bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent",
          )}
        >
          Join BaseCase
        </h2>

        {error && (
          <div
            className={cn(
              "mb-6 p-4 bg-red-950/30 border border-red-800/50 rounded-xl",
              "text-red-300 text-sm text-center",
              "animate-fade-in-up",
            )}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="Alex Coder"
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-neutral-900/60 border border-neutral-700 text-neutral-100",
                "placeholder:text-neutral-500",
                "focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="you@basecase.dev"
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-neutral-900/60 border border-neutral-700 text-neutral-100",
                "placeholder:text-neutral-500",
                "focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="••••••••"
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-neutral-900/60 border border-neutral-700 text-neutral-100",
                "placeholder:text-neutral-500",
                "focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-amber-600 to-orange-600",
              "hover:from-amber-500 hover:to-orange-500",
              "shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40",
              "transition-all duration-300",
              "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
              "disabled:opacity-60 disabled:hover:opacity-60",
              "disabled:cursor-not-allowed disabled:shadow-none",
              "disabled:hover:shadow-none disabled:hover:translate-y-0",
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Already have an account?{" "}
          <a
            href="/auth/sign-in"
            className={cn(
              "text-amber-400 hover:text-amber-300 font-medium",
              "transition-colors duration-200 hover:underline",
            )}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
