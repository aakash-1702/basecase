"use client";

import React, { useState } from "react";
import { signUp } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // assuming you have clsx/tailwind-merge

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
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Optional subtle background linear / spotlight – remove if too much */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-linear-to-br from-indigo-950/10 via-purple-950/5 to-neutral-950",
          "opacity-60 blur-3xl"
        )}
      />

      <div
        className={cn(
          "relative w-full max-w-md",
          "bg-neutral-900/70 backdrop-blur-xl backdrop-saturate-125",
          "border border-neutral-800/60 rounded-2xl shadow-2xl shadow-black/40",
          "p-8 sm:p-10",
          // Fade-in + slight lift animation on mount
          "animate-in fade-in duration-700 slide-in-from-bottom-8"
        )}
      >
        <h2
          className={cn(
            "text-2xl sm:text-3xl font-bold text-center",
            "bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent",
            "mb-8"
          )}
        >
          Join BaseCase
        </h2>

        {error && (
          <div
            className={cn(
              "mb-6 p-4 bg-red-950/40 border border-red-800/60",
              "text-red-300 rounded-xl text-sm text-center",
              "animate-in fade-in duration-500 slide-in-from-top-4"
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
                "bg-neutral-800/60 border border-neutral-700",
                "text-neutral-100 placeholder-neutral-500",
                "focus:bg-neutral-800 focus:border-indigo-500/70",
                "focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed"
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
                "bg-neutral-800/60 border border-neutral-700",
                "text-neutral-100 placeholder-neutral-500",
                "focus:bg-neutral-800 focus:border-indigo-500/70",
                "focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed"
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
                "bg-neutral-800/60 border border-neutral-700",
                "text-neutral-100 placeholder-neutral-500",
                "focus:bg-neutral-800 focus:border-indigo-500/70",
                "focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900",
                "outline-none transition-all duration-300",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-semibold text-white",
              "bg-linear-to-r from-indigo-600 to-purple-600",
              "hover:from-indigo-500 hover:to-purple-500",
              "shadow-lg shadow-indigo-950/40",
              "transition-all duration-300",
              "hover:shadow-xl hover:shadow-indigo-900/50",
              "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
              "disabled:opacity-60 disabled:hover:opacity-60",
              "disabled:cursor-not-allowed disabled:shadow-none",
              "disabled:hover:shadow-none disabled:hover:translate-y-0"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
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
              "text-indigo-400 hover:text-indigo-300 font-medium",
              "transition-colors duration-200 hover:underline"
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