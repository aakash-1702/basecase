"use client";

import { cn } from "@/lib/utils";

type OrbState = "idle" | "asking" | "processing" | "evaluating";

interface AIOrbProps {
  size?: "small" | "medium" | "large";
  state?: OrbState;
  className?: string;
}

const sizeConfig = {
  small: { container: "w-[80px] h-[80px]", core: 28, ring1: 38, ring2: 50 },
  medium: { container: "w-[120px] h-[120px]", core: 40, ring1: 56, ring2: 72 },
  large: { container: "w-[160px] h-[160px]", core: 52, ring1: 72, ring2: 92 },
} as const;

const speeds: Record<OrbState, { ring1: string; ring2: string; breathe: string }> = {
  idle: { ring1: "14s", ring2: "20s", breathe: "4s" },
  asking: { ring1: "5s", ring2: "7s", breathe: "2s" },
  processing: { ring1: "3s", ring2: "4s", breathe: "1.5s" },
  evaluating: { ring1: "10s", ring2: "14s", breathe: "3s" },
};

/**
 * Decorative interviewer orb. Only transform/opacity are animated
 * (`breathe` from globals.css + Tailwind's `animate-spin` with a custom duration).
 */
export function AIOrb({ size = "medium", state = "idle", className }: AIOrbProps) {
  const cfg = sizeConfig[size];
  const s = speeds[state];

  return (
    <div
      className={cn("relative flex items-center justify-center", cfg.container, className)}
      aria-hidden
    >
      {/* Soft halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)",
          animation: `breathe ${s.breathe} ease-in-out infinite`,
        }}
      />

      {/* Ring 2 — outer */}
      <div
        className="absolute animate-spin rounded-full border border-accent/15"
        style={{ width: cfg.ring2, height: cfg.ring2, animationDuration: s.ring2 }}
      >
        <span className="absolute -top-px left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent/50" />
      </div>

      {/* Ring 1 — inner, counter-rotating */}
      <div
        className="absolute animate-spin rounded-full border border-accent/25"
        style={{
          width: cfg.ring1,
          height: cfg.ring1,
          animationDuration: s.ring1,
          animationDirection: "reverse",
        }}
      >
        <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent/60" />
      </div>

      {/* Core */}
      <div
        className="relative rounded-full"
        style={{
          width: cfg.core,
          height: cfg.core,
          background:
            "radial-gradient(circle at 40% 35%, var(--accent), color-mix(in srgb, var(--accent-deep) 45%, transparent) 60%, color-mix(in srgb, var(--accent) 8%, transparent) 100%)",
          boxShadow:
            "0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent), 0 10px 30px -12px color-mix(in srgb, var(--accent) 60%, transparent)",
          animation: `breathe ${s.breathe} ease-in-out infinite`,
        }}
      />

      {/* Processing ring */}
      {state === "processing" && (
        <div
          className="absolute rounded-full border border-accent/20"
          style={{
            width: cfg.ring2 + 14,
            height: cfg.ring2 + 14,
            animation: "breathe 1.5s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}
