import Link from "next/link";
import { cn } from "@/lib/utils";

/** Mono eyebrow header row used at the top of dashboard cards. */
export default function CardHeader({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line px-5 py-3.5",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
        {title}
      </span>
      {action}
    </div>
  );
}

/** Small "View all →" style link for card headers. */
export function CardHeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-xs font-medium text-fg-muted transition-colors hover:text-accent"
    >
      {children}
    </Link>
  );
}
