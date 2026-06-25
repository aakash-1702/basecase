import type { Metadata } from "next";
import { DM_Serif_Display, DM_Mono, Fira_Code, Nunito } from "next/font/google";
import  "./globals.css";
import { cn } from "@/lib/utils";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE_ALT,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

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

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BaseCase - Master DSA and System Design",
    template: "%s | BaseCase",
  },
  description:
    "Structured DSA learning and interview prep with curated sheets, SM-2 spaced repetition, AI mock interviews, and progress analytics.",
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "BaseCase - Master DSA and System Design",
    description:
      "Practice smarter with curated sheets, confidence-based revision, and AI interview simulations.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseCase - Master DSA and System Design",
    description:
      "Structured DSA learning and interview prep with AI-powered practice.",
    images: ["/opengraph-image"],
    creator: "@basecase",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(dmSerif.variable, dmMono.variable, nunito.variable, firaCode.variable, "antialiased")}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
