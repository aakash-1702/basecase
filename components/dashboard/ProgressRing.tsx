import { cn } from "@/lib/utils";

/**
 * Circular progress indicator. Pure SVG, no ids (safe to render many times),
 * animates only `stroke-dashoffset` when the value changes.
 */
export default function ProgressRing({
  value,
  size = 72,
  stroke = 5,
  color = "var(--accent)",
  label,
  className,
  valueClassName,
}: {
  /** 0-100 */
  value: number;
  size?: number;
  stroke?: number;
  /** any CSS colour */
  color?: string;
  /** optional caption under the percentage */
  label?: string;
  className?: string;
  valueClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--fg) 8%, transparent)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={cn(
            "font-display tabular-nums text-accent",
            valueClassName,
          )}
          style={{ fontSize: Math.max(10, Math.round(size * 0.2)) }}
        >
          {pct}%
        </span>
        {label && (
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-fg-muted">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
