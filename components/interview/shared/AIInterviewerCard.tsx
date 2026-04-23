"use client";

import type { InterviewState } from "./types";

interface AIInterviewerCardProps {
  interviewState: InterviewState;
}

const STATE_CONFIG = {
  "ai-speaking": {
    label: "Speaking...",
    dotColor: "#f97316",
    labelColor: "#f97316",
    orbGradient:
      "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0.1) 70%, transparent 100%)",
    orbAnimation: "ghOrbBreathe 1.5s ease-in-out infinite",
    ringBorder: "rgba(249,115,22,0.3)",
    ringAnimation: "ghSpeakingRing 1.5s ease-in-out infinite",
  },
  processing: {
    label: "Thinking...",
    dotColor: "#a78bfa",
    labelColor: "#a78bfa",
    orbGradient:
      "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(167,139,250,0.08) 70%, transparent 100%)",
    orbAnimation: "ghv2AmbientOrb 2.5s ease-in-out infinite",
    ringBorder: "rgba(167,139,250,0.15)",
    ringAnimation: "none",
  },
  idle: {
    label: "Listening",
    dotColor: "#3a3a3a",
    labelColor: "#525252",
    orbGradient:
      "radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 70%, transparent 100%)",
    orbAnimation: "ghv2Breathing 3s ease-in-out infinite",
    ringBorder: "rgba(255,255,255,0.04)",
    ringAnimation: "none",
  },
  "user-speaking": {
    label: "Listening",
    dotColor: "#3a3a3a",
    labelColor: "#525252",
    orbGradient:
      "radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 70%, transparent 100%)",
    orbAnimation: "ghv2Breathing 3s ease-in-out infinite",
    ringBorder: "rgba(255,255,255,0.04)",
    ringAnimation: "none",
  },
  ended: {
    label: "Session ended",
    dotColor: "#525252",
    labelColor: "#3a3a3a",
    orbGradient:
      "radial-gradient(circle, rgba(82,82,82,0.15) 0%, rgba(82,82,82,0.04) 70%, transparent 100%)",
    orbAnimation: "none",
    ringBorder: "rgba(255,255,255,0.03)",
    ringAnimation: "none",
  },
} as const;

export function AIInterviewerCard({
  interviewState,
}: AIInterviewerCardProps) {
  const config = STATE_CONFIG[interviewState];
  const isSpeaking = interviewState === "ai-speaking";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        gap: 4,
      }}
    >
      {/* ── Label ── */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "#3a3a3a",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        AI Interviewer
      </div>

      {/* ── Animated Orb ── */}
      <div
        style={{
          position: "relative",
          width: 88,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1.5px solid ${config.ringBorder}`,
            animation: isSpeaking ? config.ringAnimation : "none",
            transition: "border-color 300ms ease",
          }}
        />
        {/* Middle ring */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: `1px solid ${isSpeaking ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.03)"}`,
            animation: isSpeaking
              ? "ghSpeakingRing 1.5s ease-in-out 0.3s infinite"
              : "none",
            transition: "border-color 300ms ease",
          }}
        />
        {/* Core orb */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: config.orbGradient,
            animation: config.orbAnimation,
            transition: "background 300ms ease",
          }}
        />
      </div>

      {/* ── State Indicator ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: config.dotColor,
            animation:
              interviewState === "processing"
                ? "ghOrbBreathe 2s ease-in-out infinite"
                : "none",
            transition: "background 200ms ease",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: config.labelColor,
            letterSpacing: "0.06em",
            transition: "color 200ms ease",
          }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
