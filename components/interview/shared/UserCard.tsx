"use client";

import type { InterviewState } from "./types";

interface UserCardProps {
  interviewState: InterviewState;
}

export function UserCard({ interviewState }: UserCardProps) {
  const isRecording = interviewState === "user-speaking";
  const isEnded = interviewState === "ended";

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
        You
      </div>

      {/* ── Avatar ── */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isRecording ? "rgba(34,211,238,0.08)" : "#141414",
          border: isRecording
            ? "1.5px solid rgba(34,211,238,0.4)"
            : "1.5px solid rgba(255,255,255,0.08)",
          animation: isRecording
            ? "ghv2RecordPulse 2s ease-in-out infinite"
            : "none",
          transition: "all 300ms ease",
        }}
      >
        {/* Mic icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isRecording ? "#22d3ee" : "#525252"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke 300ms ease" }}
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
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
            background: isRecording
              ? "#22d3ee"
              : isEnded
                ? "#525252"
                : "#3a3a3a",
            transition: "background 200ms ease",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: isRecording
              ? "#22d3ee"
              : isEnded
                ? "#3a3a3a"
                : "#3a3a3a",
            letterSpacing: "0.06em",
            transition: "color 200ms ease",
          }}
        >
          {isRecording ? "Listening..." : isEnded ? "Session ended" : "Ready"}
        </span>
      </div>

      {/* ── Waveform (recording only) ── */}
      {isRecording && (
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: 3,
            height: 20,
            marginTop: 12,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: "100%",
                background: "rgba(34,211,238,0.4)",
                animation: "ghWavePulse 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.07}s`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
