import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MotionProvider from "@/components/motion/MotionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://basecase.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BaseCase — Master DSA Through Practice",
    template: "%s · BaseCase",
  },
  description:
    "Curated DSA sheets, 500+ handpicked problems, an in-browser editor on a self-hosted Judge0, SM-2 revision and a voice AI mock interviewer.",
  openGraph: {
    title: "BaseCase — Master DSA Through Practice",
    description:
      "Curated DSA sheets, handpicked problems, an in-browser editor and a voice AI mock interviewer.",
    url: SITE_URL,
    siteName: "BaseCase",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BaseCase" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseCase — Master DSA Through Practice",
    description:
      "Curated DSA sheets, handpicked problems, an in-browser editor and a voice AI mock interviewer.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          jetBrainsMono.variable,
          "min-h-screen bg-bg text-fg antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GoogleAnalytics />
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
