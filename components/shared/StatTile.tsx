import { cn } from "@/lib/utils";

export default function StatTile({
  value,
  label,
  accent = false,
  className,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "font-display text-2xl tabular-nums tracking-tight sm:text-3xl",
          accent ? "text-accent" : "text-fg",
        )}
      >
        {value}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </span>
    </div>
  );
}
