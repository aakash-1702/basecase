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
import { signIn } from "@/lib/auth-actions";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
        // You can replace alert with a toast or form error later
        alert(result.error || "Invalid email or password");
        return;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      console.error("SignIn error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle ambient glow — same as signup & sheets */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-neutral-950 to-neutral-950 opacity-70" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[500px] md:w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl animate-pulse-glow opacity-40" />
      </div>

      <Card
        className={cn(
          "relative border border-neutral-800/60",
          "bg-neutral-900/65 backdrop-blur-xl backdrop-saturate-125",
          "shadow-2xl shadow-black/50",
          "rounded-2xl overflow-hidden",
          "w-full max-w-md mx-auto",
          "transition-all duration-300",
        )}
      >
        <CardHeader className="space-y-1.5 pb-6 pt-8 text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Welcome back
            </span>
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
                          "h-11 bg-neutral-900/60 border-neutral-700 text-white",
                          "placeholder:text-neutral-500",
                          "focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950",
                          "outline-none transition-all duration-300 shadow-sm",
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
                          "h-11 bg-neutral-900/60 border-neutral-700 text-white",
                          "placeholder:text-neutral-500",
                          "focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950",
                          "outline-none transition-all duration-300 shadow-sm",
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
                  "w-full h-11 mt-3",
                  "bg-gradient-to-r from-amber-600 to-orange-600",
                  "hover:from-amber-500 hover:to-orange-500",
                  "text-white font-medium shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                  "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100",
                  isLoading && "opacity-70 cursor-not-allowed",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2.5">
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

        <CardFooter className="flex flex-col items-center gap-3 border-t border-neutral-800/60 bg-neutral-950/30 py-6 text-sm text-neutral-400">
          <p>
            Don't have an account?{" "}
            <a
              href="/auth/sign-up"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Create one
            </a>
          </p>

          <a
            href="/auth/forgot-password"
            className="text-amber-400/80 hover:text-amber-300 text-xs transition-colors"
          >
            Forgot your password?
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
