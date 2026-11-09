"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const { errors } = form.formState;

  async function onSubmit(values: FormValues) {
    const toastId = toast.loading("Signing in...");
    try {
      const { error } = await authClient.signIn.email({
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
    } catch {
      toast.error("Something went wrong", { id: toastId });
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Continue where you left off. Your progress is waiting."
      footer={{
        text: "Don't have an account?",
        linkLabel: "Sign up",
        href: "/auth/sign-up",
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <AuthField
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
          error={errors.email?.message}
          {...form.register("email")}
        />

        <AuthField
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          error={errors.password?.message}
          {...form.register("password")}
        />

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-fg-muted transition-colors hover:text-accent"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary h-12 w-full"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
