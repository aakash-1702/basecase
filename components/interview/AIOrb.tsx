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
};

export function AIOrb({
  size = "medium",
  state = "idle",
  className,
}: AIOrbProps) {
  const cfg = sizeConfig[size];

  const speeds = {
    idle: { ring1: "14s", ring2: "20s", breathe: "4s" },
    asking: { ring1: "5s", ring2: "7s", breathe: "2s" },
    processing: { ring1: "3s", ring2: "4s", breathe: "1.5s" },
    evaluating: { ring1: "10s", ring2: "14s", breathe: "3s" },
  };

  const s = speeds[state];

  return (
    <div className={cn("relative flex items-center justify-center", cfg.container, className)}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)`,
          animation: `orb-core-breathe ${s.breathe} ease-in-out infinite`,
        }}
      />

      {/* Ring 2 — outer */}
      <div
        className="absolute rounded-full"
        style={{
          width: cfg.ring2,
          height: cfg.ring2,
          border: "1px solid rgba(245, 158, 11, 0.12)",
          animation: `orb-spin ${s.ring2} linear infinite`,
        }}
      >
        <div
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: "rgba(245, 158, 11, 0.4)",
            top: -1,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Ring 1 — inner */}
      <div
        className="absolute rounded-full"
        style={{
          width: cfg.ring1,
          height: cfg.ring1,
          border: "1px solid rgba(245, 158, 11, 0.2)",
          animation: `orb-spin-reverse ${s.ring1} linear infinite`,
        }}
      >
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: "rgba(245, 158, 11, 0.5)",
            top: -2,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Core */}
      <div
        className="relative rounded-full"
        style={{
          width: cfg.core,
          height: cfg.core,
          background: `radial-gradient(circle at 40% 35%,
            rgba(245,158,11,0.7),
            rgba(234,88,12,0.3) 60%,
            rgba(245,158,11,0.08) 100%)`,
          boxShadow: `
            0 0 20px rgba(245,158,11,0.2),
            0 0 40px rgba(245,158,11,0.06),
            inset 0 0 12px rgba(255,255,255,0.06)
          `,
          animation: `orb-core-breathe ${s.breathe} ease-in-out infinite`,
        }}
      />

      {/* Processing shimmer ring */}
      {state === "processing" && (
        <div
          className="absolute rounded-full"
          style={{
            width: cfg.ring2 + 14,
            height: cfg.ring2 + 14,
            border: "1px solid rgba(245,158,11,0.15)",
            animation: "breathe 1.5s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}
