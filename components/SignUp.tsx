"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      const { error } = await authClient.signUp.email({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
      });

      if (error) {
        toast.error(error.message || "Sign up failed", { id: toastId });
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

  return (
    <AuthShell
      title="Start your journey."
      subtitle="Create an account to track your progress, build consistency, and master problem-solving."
      footer={{
        text: "Already have an account?",
        linkLabel: "Sign in",
        href: "/auth/sign-in",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Full name"
          name="name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          onChange={handleChange}
        />

        <AuthField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          onChange={handleChange}
        />

        <AuthField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary h-12 w-full"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
