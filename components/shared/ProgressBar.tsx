import { cn } from "@/lib/utils";

export default function ProgressBar({
  value,
  className,
  color = "accent",
  height = 4,
}: {
  value: number;
  className?: string;
  color?: "accent" | "success" | "danger" | "info" | string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const bg =
    color === "accent"
      ? "var(--accent)"
      : color === "success"
        ? "var(--success)"
        : color === "danger"
          ? "var(--danger)"
          : color === "info"
            ? "var(--info)"
            : color;
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-fg/[0.06]", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: bg }}
      />
    </div>
  );
}
