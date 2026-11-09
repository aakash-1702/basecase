import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  size = "md",
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string | null;
}) {
  const mark =
    size === "lg" ? "h-9 w-9 text-sm" : size === "sm" ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]";
  const text =
    size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-md bg-accent font-mono font-bold text-accent-ink",
          mark,
        )}
      >
        BC
      </span>
      <span className={cn("font-display tracking-tight text-fg", text)}>
        Base<span className="text-accent">Case</span>
      </span>
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="BaseCase home" className="shrink-0">
      {inner}
    </Link>
  );
}
