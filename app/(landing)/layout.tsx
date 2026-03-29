import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Syne, JetBrains_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BaseCase - Structured DSA Learning & AI Interview Prep",
  description:
    "500+ curated DSA problems, SM-2 spaced repetition, AI voice mock interviews powered by Gemini. Stop grinding randomly.",
  openGraph: {
    title: "BaseCase",
    description: "Structured DSA learning that actually works.",
    url: "https://basecase.example.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Basecase Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
      <body
        className={cn(syne.variable, jetBrainsMono.variable, "antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
