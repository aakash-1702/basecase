import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The default card surface: solid background, hairline border, glowing top
 * edge + lift on hover. Renders a Link when `href` is provided.
 */
export default function GlowCard({
  children,
  className,
  href,
  hover = true,
  padding = "md",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const pad =
    padding === "none" ? "" : padding === "sm" ? "p-4" : padding === "lg" ? "p-7" : "p-6";
  const classes = cn(
    "card-base block",
    hover && "card-hover card-glow-top",
    pad,
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
