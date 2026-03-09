"use client";

import type { Phase } from "@/types/interview-room";

type AIState = "asking" | "waiting" | "processing";

interface AIPanelProps {
  phase?: Phase;
  state?: AIState; // Legacy prop for backward compatibility
}

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

  // Orb animation and styling based on phase
  const getOrbStyles = () => {
    switch (effectivePhase) {
      case "speaking":
        return {
          background:
            "radial-gradient(circle, rgba(245,158,11,0.6) 0%, rgba(245,158,11,0.1) 60%, transparent 80%)",
          animation: "orbBreath 1.5s ease-in-out infinite",
        };
      case "submitting":
        return {
          background:
            "radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(245,158,11,0.08) 60%, transparent 80%)",
          animation: "orbBreath 2.5s ease-in-out infinite",
        };
      case "recording":
        return {
          background:
            "radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.03) 60%, transparent 80%)",
          animation: "orbBreath 5s ease-in-out infinite",
          opacity: 0.4,
        };
      default: // loading, answering, error, complete
        return {
          background:
            "radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.05) 60%, transparent 80%)",
          animation: "orbBreath 4s ease-in-out infinite",
        };
    }
  };

  // State label and color based on phase
  const getStateLabel = () => {
    switch (effectivePhase) {
      case "loading":
        return { text: "CONNECTING", color: "#2a2a2a" };
      case "speaking":
        return { text: "SPEAKING", color: "rgba(245,158,11,0.6)" };
      case "answering":
        return { text: "LISTENING", color: "#3a3a3a" };
      case "recording":
        return { text: "LISTENING", color: "rgba(245,158,11,0.5)" };
      case "submitting":
        return { text: "THINKING", color: "#3a3a3a" };
      case "error":
        return { text: "ERROR", color: "rgba(244,63,94,0.5)" };
      case "complete":
        return { text: "DONE", color: "#3a3a3a" };
      default:
        return { text: "LISTENING", color: "#3a3a3a" };
    }
  };

  const orbStyles = getOrbStyles();
  const stateLabel = getStateLabel();

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{
        padding: "24px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "#2a2a2a",
          marginBottom: "24px",
        }}
      >
        INTERVIEWER
      </div>

      {/* AI Orb */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          ...orbStyles,
        }}
      />

      {/* State Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: stateLabel.color,
          marginTop: "20px",
        }}
      >
        {stateLabel.text}
      </div>
    </div>
  );
}
