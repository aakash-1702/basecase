"use client";

import type { InterviewConfig, Phase } from "@/types/interview-room";

// New interface for InterviewRoom
interface NewRoomTopBarProps {
  config: InterviewConfig;
  phase: Phase;
  onEndSessionClick: () => void;
}

// Legacy interface for ActiveRoom
interface LegacyRoomTopBarProps {
  config: InterviewConfig;
  onExitClick?: () => void;
  phase?: never;
  onEndSessionClick?: never;
}

type RoomTopBarProps = NewRoomTopBarProps | LegacyRoomTopBarProps;

export function RoomTopBar(props: RoomTopBarProps) {
  const { config } = props;

  // Detect mode and extract handler
  const isLegacyMode = !("phase" in props && props.phase !== undefined);
  const handleClick = isLegacyMode
    ? ((props as LegacyRoomTopBarProps).onExitClick ?? (() => {}))
    : (props as NewRoomTopBarProps).onEndSessionClick;
  const phase = isLegacyMode ? undefined : (props as NewRoomTopBarProps).phase;
  const isDisabled = phase === "submitting";

  return (
    <div
      className="shrink-0 flex items-center justify-between px-6 relative"
      style={{
        height: "48px",
        background: "#111111",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Left: empty spacer for layout balance */}
      <div />

      {/* Center: Interview config */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "12px",
          fontWeight: 500,
          color: "#a0a0a0",
          letterSpacing: "0.02em",
        }}
      >
        {config.company}
        <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
        {config.mode}
        <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
        {config.difficulty}
      </div>

      {/* Right: End Session button — solid destructive */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="transition-all duration-200"
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "12px",
          fontWeight: 500,
          color: isDisabled ? "#555" : "#fff",
          background: isDisabled
            ? "rgba(239,68,68,0.1)"
            : "rgba(239,68,68,0.8)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: "6px",
          padding: "7px 18px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = "rgba(239,68,68,1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.background = "rgba(239,68,68,0.8)";
          }
        }}
      >
        End Interview
      </button>
    </div>
  );
}
