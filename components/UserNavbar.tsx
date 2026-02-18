// components/UserNavbar.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Session } from "better-auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Problems", href: "/problems" },
  { label: "Sheet", href: "/sheet" },
  { label: "Contest", href: "/contest" },
];

interface UserNavbarProps {
  session: Session | null;
}

export default function UserNavbar({ session }: UserNavbarProps) {
  // Optional: add this temporarily to debug
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-neutral-800/50",
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
            "text-white transition-all duration-300",
            "hover:scale-105 hover:text-indigo-400/90 active:scale-100",
          )}
        >
          Base
          <span className="text-indigo-500/90 transition-colors group-hover:text-indigo-400">
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
                  "bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full",
                  "transition-all duration-400 ease-out group-hover:w-3/4 group-hover:opacity-100",
                  "opacity-70",
                )}
              />
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div className="flex items-center gap-3">
          {session ? (
            <Button
              variant="ghost"
              className={cn(
                "relative gap-2 px-4 text-neutral-200",
                "transition-all duration-300",
                "hover:bg-neutral-800/60 hover:text-white hover:shadow-sm",
                "hover:-translate-y-0.5 active:translate-y-0 active:scale-98",
              )}
              asChild
            >
              <Link href="/profile">
                <span className="hidden sm:inline">
                  Profile
                </span>
                {/* Replace with real avatar when available */}
                <div className="h-7 w-7 rounded-full bg-neutral-700" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className={cn(
                  "px-4 text-neutral-300",
                  "transition-all duration-300",
                  "hover:bg-neutral-800/50 hover:text-white hover:-translate-y-0.5",
                  "active:translate-y-0 active:scale-98",
                )}
                asChild
              >
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>

              <Button
                className={cn(
                  "bg-gradient-to-r from-indigo-600 to-purple-600",
                  "hover:from-indigo-500 hover:to-purple-500",
                  "px-5 shadow-sm shadow-indigo-950/40",
                  "transition-all duration-300",
                  "hover:shadow-md hover:shadow-indigo-900/50",
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
