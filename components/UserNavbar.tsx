// components/UserNavbar.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Problems", href: "/problems" },
  { label: "Sheets", href: "/sheets" },
  { label: "Interview", href: "/interview" },
];

export default function UserNavbar({ session }: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-amber-900/30",
        "bg-neutral-950/75 backdrop-blur-xl backdrop-saturate-125",
        "transition-all duration-300",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "group flex items-center gap-1.5 text-xl font-bold tracking-tight",
            "text-white transition-all duration-300 ease-out",
            "hover:scale-105 hover:text-amber-400/90 active:scale-100",
          )}
        >
          Base
          <span className="text-amber-500/90 transition-colors duration-300 ease-out group-hover:text-amber-400">
            Case
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative px-1 py-1.5 text-sm font-medium text-neutral-300",
                "transition-all duration-300 ease-out",
                "hover:text-white hover:-translate-y-0.5",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2",
                  "bg-linear-to-r from-amber-500 to-orange-600 rounded-full",
                  "transition-all duration-400 ease-out group-hover:w-3/4 group-hover:opacity-100",
                  "opacity-70",
                )}
              />
            </Link>
          ))}
        </div>

        {/* Auth / User section */}
        <div className="flex items-center gap-3 pr-2 sm:pr-4 lg:pr-6">
          {session?.user ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={cn(
                "gap-2 px-5 sm:px-6 py-2 text-sm font-medium text-neutral-300",
                "transition-all duration-300 ease-out",
                "hover:bg-rose-950/30 hover:text-rose-300 hover:border-rose-800/40 hover:shadow-sm",
                "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                "border border-transparent",
                "min-w-25",
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "px-5 text-neutral-300 text-sm font-medium",
                  "transition-all duration-300 ease-out",
                  "hover:bg-amber-950/30 hover:text-amber-200 hover:-translate-y-0.5",
                  "active:translate-y-0 active:scale-[0.98]",
                )}
                asChild
              >
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>

              <Button
                className={cn(
                  "bg-linear-to-r from-amber-600 to-orange-600",
                  "hover:from-amber-500 hover:to-orange-500",
                  "px-6 py-1.5 text-sm font-semibold shadow-sm shadow-amber-900/30",
                  "transition-all duration-300 ease-out",
                  "hover:shadow-md hover:shadow-amber-800/40",
                  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                )}
                asChild
              >
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
