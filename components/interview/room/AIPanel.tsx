"use client";

import { cn } from "@/lib/utils";
import type { Phase } from "@/types/interview-room";

type AIState = "asking" | "waiting" | "processing";

interface AIPanelProps {
  phase?: Phase;
  state?: AIState; // Legacy prop for backward compatibility
}

const ORB_DEFAULT = {
  background:
    "radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.05) 60%, transparent 80%)",
  animation: "breathe 4s ease-in-out infinite",
};

/** Orb look per phase — only `breathe` (opacity/scale) is animated. */
const ORB_BY_PHASE: Partial<Record<Phase, React.CSSProperties>> = {
  speaking: {
    background:
      "radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.1) 60%, transparent 80%)",
    animation: "breathe 1.5s ease-in-out infinite",
  },
  submitting: {
    background:
      "radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0.08) 60%, transparent 80%)",
    animation: "breathe 2.5s ease-in-out infinite",
  },
  recording: {
    background:
      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.03) 60%, transparent 80%)",
    animation: "breathe 5s ease-in-out infinite",
    opacity: 0.4,
  },
};

const LABEL_BY_PHASE: Record<Phase, { text: string; className: string }> = {
  loading: { text: "CONNECTING", className: "text-fg-dim" },
  speaking: { text: "SPEAKING", className: "text-accent" },
  answering: { text: "LISTENING", className: "text-fg-muted" },
  recording: { text: "LISTENING", className: "text-accent/80" },
  submitting: { text: "THINKING", className: "text-fg-muted" },
  error: { text: "ERROR", className: "text-danger/70" },
  complete: { text: "DONE", className: "text-fg-muted" },
};

export function AIPanel({ phase, state }: AIPanelProps) {
  // Convert legacy state to phase if phase not provided
  const effectivePhase: Phase =
    phase ??
    (state === "asking"
      ? "answering"
      : state === "waiting"
        ? "recording"
        : state === "processing"
          ? "submitting"
          : "answering");

  const orbStyle = ORB_BY_PHASE[effectivePhase] ?? ORB_DEFAULT;
  const label = LABEL_BY_PHASE[effectivePhase];

  return (
    <div className="flex h-full flex-col items-center justify-center border-b border-line p-6">
      <span className="mb-6 font-mono text-[9px] tracking-[0.25em] text-fg-dim">INTERVIEWER</span>

      {/* AI Orb */}
      <div className="h-[72px] w-[72px] rounded-full" style={orbStyle} aria-hidden />

      {/* State Label */}
      <span className={cn("mt-5 font-mono text-[9px] tracking-[0.2em]", label.className)}>
        {label.text}
      </span>
    </div>
  );
}
