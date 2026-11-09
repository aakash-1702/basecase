"use client";

import { cn } from "@/lib/utils";
import type { Phase, TurnState } from "@/types/interview-room";

// New interface for InterviewRoom
interface NewUserPanelProps {
  userName: string;
  phase: Phase;
  isSTTSupported: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

// Legacy interface for ActiveRoom
interface LegacyUserPanelProps {
  userName: string;
  liveTranscript: string;
  turnState: TurnState;
}

type UserPanelProps = Partial<NewUserPanelProps> &
  Partial<LegacyUserPanelProps>;

const WAVE_BARS = Array.from({ length: 8 }, (_, i) => i);

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U"
  );
}

export function UserPanel(props: UserPanelProps) {
  const { userName = "User" } = props;

  // Detect if using legacy mode
  const isLegacyMode = props.turnState !== undefined;
  const initials = getInitials(userName);

  // ==================== LEGACY MODE ====================
  if (isLegacyMode) {
    const { liveTranscript = "", turnState = "idle" } = props;
    const isListening = turnState === "listening";

    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-6">
        {/* Label + Mic indicator */}
        <div className="flex items-center gap-2">
          {isListening && <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />}
          <span
            className={cn(
              "font-mono text-[11px] font-medium tracking-[0.2em]",
              isListening ? "text-accent" : "text-fg-muted",
            )}
          >
            {isListening ? "RECORDING" : "YOU"}
          </span>
        </div>

        {/* User Avatar */}
        <div
          className={cn(
            "relative flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-surface-2 transition-colors duration-300",
            isListening ? "border-accent/60" : "border-line-strong",
          )}
          style={isListening ? { animation: "recordPulse 2s ease-in-out infinite" } : undefined}
        >
          <span className="font-display text-2xl text-fg-secondary">{initials}</span>
        </div>

        {/* Live transcript preview */}
        {liveTranscript && (
          <div className="interview-scrollbar max-h-20 w-full overflow-y-auto px-3 text-center">
            <p className="text-xs italic leading-relaxed text-fg-muted">{liveTranscript}</p>
          </div>
        )}

        {/* Waveform while listening */}
        {isListening && (
          <div className="flex h-5 items-end gap-[3px]" aria-hidden>
            {WAVE_BARS.map((i) => (
              <span
                key={i}
                className="h-full w-0.5 origin-bottom bg-accent/60"
                style={{ animation: "wavePulse 0.7s ease-in-out infinite", animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==================== NEW MODE ====================
  const {
    phase = "answering",
    isSTTSupported = true,
    onStartRecording,
    onStopRecording,
  } = props;

  const isRecording = phase === "recording";
  const isMicVisible =
    phase === "answering" || phase === "recording" || phase === "error";
  const isDimmed =
    phase === "speaking" || phase === "submitting" || phase === "loading";

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center border-t border-line p-6 transition-opacity duration-300",
        isDimmed && "opacity-50",
      )}
    >
      {/* Label */}
      <span className="mb-5 font-mono text-[9px] tracking-[0.25em] text-fg-dim">YOU</span>

      {/* User Avatar */}
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border bg-surface-2 transition-colors duration-300",
          isRecording ? "border-accent/60" : phase === "answering" ? "border-line-strong" : "border-line",
        )}
        style={isRecording ? { animation: "recordPulse 2s ease-in-out infinite" } : undefined}
      >
        <span className="font-display text-[22px] text-fg-muted">{initials}</span>
      </div>

      {/* Mic Button */}
      {isMicVisible && (
        <div className="mt-5">
          {!isSTTSupported ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled
                className="btn btn-sm border border-danger/30 bg-transparent font-mono text-danger"
              >
                ⚠ Not Supported
              </button>
              <p className="mt-2 text-center font-mono text-[10px] text-fg-muted">
                Use Chrome or Edge for voice input
              </p>
            </div>
          ) : phase === "answering" ? (
            <button type="button" onClick={onStartRecording} className="btn btn-primary btn-sm font-mono">
              🎙 Speak
            </button>
          ) : phase === "recording" ? (
            <button type="button" onClick={onStopRecording} className="btn btn-outline-accent btn-sm font-mono">
              ■ Done
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
