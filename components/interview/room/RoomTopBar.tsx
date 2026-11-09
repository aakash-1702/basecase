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
    <div className="relative flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-6">
      {/* Left: empty spacer for layout balance */}
      <div />

      {/* Center: Interview config */}
      <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs font-medium tracking-wide text-fg-secondary">
        {config.company}
        <span className="mx-2 text-fg-dim">·</span>
        {config.mode}
        <span className="mx-2 text-fg-dim">·</span>
        {config.difficulty}
      </div>

      {/* Right: End Session button — solid destructive */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className="btn btn-sm border border-danger/40 bg-danger/80 font-mono tracking-wide text-white hover:bg-danger disabled:hover:bg-danger/80"
      >
        End Interview
      </button>
    </div>
  );
}
