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
        height: "44px",
        background: "#0a0a0a",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Left: BaseCase branding */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          color: "#2a2a2a",
        }}
      >
        BaseCase
      </div>

      {/* Center: Interview config */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          color: "#3a3a3a",
        }}
      >
        {config.company}
        <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
        {config.mode}
        <span style={{ margin: "0 8px", opacity: 0.5 }}>·</span>
        {config.difficulty}
      </div>

      {/* Right: End Session button */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="transition-colors duration-200"
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "12px",
          color: isDisabled ? "#2a2a2a" : "#3f3f3f",
          background: "transparent",
          border: `1px solid ${isDisabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: "4px",
          padding: "6px 12px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.color = "#3f3f3f";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }
        }}
      >
        End Session
      </button>
    </div>
  );
}
