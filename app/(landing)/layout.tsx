import "./globals.css";
import { cn } from "@/lib/utils";
import { Syne, JetBrains_Mono } from "next/font/google";

const syne = Syne({ variable: "--font-syne", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

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
