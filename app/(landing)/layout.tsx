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
  title: "Basecase — Master DSA Through Code",
  description:
    "500+ handpicked DSA problems, curated sheets, streaks and leaderboards. Stop reading tutorials. Start solving.",
  openGraph: {
    title: "Basecase — Master DSA Through Code",
    description:
      "500+ handpicked DSA problems, curated sheets, streaks and leaderboards. Stop reading tutorials. Start solving.",
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
    title: "Basecase — Master DSA Through Code",
    description:
      "500+ handpicked DSA problems, curated sheets, streaks and leaderboards. Stop reading tutorials. Start solving.",
    images: ["/og-image.png"],
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
