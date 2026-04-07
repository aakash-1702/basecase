import { cn } from "@/lib/utils";
import { Nunito, Fira_Code } from "next/font/google";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(nunito.variable, firaCode.variable, "antialiased")}
      style={{ fontFamily: "var(--font-nunito), sans-serif" }}
    >
      {children}
    </div>
  );
}
