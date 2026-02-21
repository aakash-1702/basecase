// components/auth/SignInForm.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { signIn } from "@/lib/auth-actions";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // You will handle actual submission / auth yourself

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);

      const result = await signIn(values.email, values.password);

      if (!result.success) {
        // 👇 This is where wrong email/password lands
        alert(result.error || "Invalid email or password");
        return;
      }

      // success case
      router.push("/dashboard");
    } catch (error) {
      console.error("SignIn error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card
      className={cn(
        "border border-neutral-800/60",
        "bg-neutral-950/80 backdrop-blur-xl backdrop-saturate-150",
        "shadow-2xl shadow-indigo-950/40",
        "rounded-xl overflow-hidden",
        "transition-all duration-300",

        // ─── Add these to control width ───
        "w-full max-w-md", // ← most common & recommended for login forms
        "mx-auto", // centers it horizontally
      )}
    >
      <CardHeader className="space-y-1.5 pb-6 pt-8 text-center">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base text-neutral-400">
          Enter your credentials to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-200 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      className={cn(
                        "h-11 bg-neutral-900/70 border-neutral-700/80 text-white",
                        "placeholder:text-neutral-500",
                        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60",
                        "focus-visible:ring-offset-0",
                        "transition-all duration-200 shadow-sm",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400/90 text-xs mt-1.5" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-200 font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      className={cn(
                        "h-11 bg-neutral-900/70 border-neutral-700/80 text-white",
                        "placeholder:text-neutral-500",
                        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60",
                        "focus-visible:ring-offset-0",
                        "transition-all duration-200 shadow-sm",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400/90 text-xs mt-1.5" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 mt-2",
                "bg-linear-to-r from-indigo-600 via-indigo-600 to-purple-600",
                "hover:from-indigo-500 hover:via-indigo-500 hover:to-purple-500",
                "text-white font-medium shadow-md shadow-indigo-950/50",
                "transition-all duration-300",
                "hover:shadow-lg hover:shadow-indigo-900/60",
                "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                // ──── Disabled / loading styles ────
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100",
                isLoading && "opacity-70 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-3 border-t border-neutral-800/60 bg-neutral-950/40 py-6 text-sm text-neutral-400">
        <p>
          Don't have an account?{" "}
          <a
            href="/auth/sign-up"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create one
          </a>
        </p>

        <a
          href="/auth/forgot-password"
          className="text-indigo-400/80 hover:text-indigo-300 text-xs transition-colors"
        >
          Forgot your password?
        </a>
      </CardFooter>
    </Card>
  );
}
