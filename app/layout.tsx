import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserNavbar from "@/components/UserNavbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cn } from "@/lib/utils"; // ← assuming you have this (clsx + tw-merge)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BaseCase – Problems, Sheets & Contests",
  description:
    "Level up your coding skills with curated problems, study sheets, and live contests.",
  // Feel free to add open graph, twitter cards, etc. later
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "min-h-screen bg-neutral-950 text-neutral-100",
          // Optional: very subtle noise/grain texture background (popular in 2025 dark themes)
          // "bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-[length:24px_24px]"
        )}
      >
        {/* Fixed/sticky navbar */}
        <UserNavbar session={session} />

        {/* Main content wrapper – gives breathing room + max-width centering */}
        <main
          className={cn(
            "relative mx-auto min-h-[calc(100vh-3.5rem)]", // 3.5rem = h-14 navbar
            "w-full max-w-7xl px-5 sm:px-6 lg:px-8",
            "pt-8 pb-16 md:pt-12", // extra top padding after navbar
          )}
        >
          {/* Optional subtle gradient overlay / spotlight effect at top (very trendy) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 -z-10 h-96",
              "bg-linear-to-b from-indigo-950/20 via-transparent to-transparent",
              "opacity-60 blur-3xl",
            )}
          />

          {children}
        </main>

        {/* Optional footer – minimal for now */}
        <footer className="border-t border-neutral-800/60 bg-neutral-950/80 py-6 text-center text-sm text-neutral-500">
          <div className="mx-auto max-w-7xl px-6">
            © {new Date().getFullYear()} BaseCase. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
