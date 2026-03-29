import type { Metadata } from "next";
import { DM_Serif_Display, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BaseCase - Structured DSA Learning & AI Interview Prep",
  description:
    "500+ curated DSA problems, SM-2 spaced repetition, AI voice mock interviews powered by Gemini. Stop grinding randomly.",
  openGraph: {
    title: "BaseCase",
    description: "Structured DSA learning that actually works.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(dmSerif.variable, dmMono.variable, "antialiased")}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
