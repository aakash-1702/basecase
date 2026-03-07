import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Display, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  title: "BaseCase – Problems, Sheets & Contests",
  description:
    "Level up your coding skills with curated problems, study sheets, and live contests.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          dmSerif.variable,
          dmMono.variable,
          "antialiased",
        )}
      >
        {children}
      </body>
    </html>
  );
}
