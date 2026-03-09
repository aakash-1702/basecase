"use client";

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

export function UserPanel(props: UserPanelProps) {
  const { userName = "User" } = props;

  // Detect if using legacy mode
  const isLegacyMode = "turnState" in props && props.turnState !== undefined;

  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";

  // ==================== LEGACY MODE ====================
  if (isLegacyMode) {
    const { liveTranscript = "", turnState = "idle" } = props;
    const isListening = turnState === "listening";

    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes micPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(1.3); }
          }
        `,
          }}
        />

        <div
          className="flex flex-col items-center justify-center w-full h-full"
          style={{ gap: "20px", padding: "24px" }}
        >
          {/* Label + Mic indicator */}
          <div className="flex items-center gap-2">
            {isListening && (
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: "#ef4444",
                  animation: "micPulse 1.2s ease-in-out infinite",
                }}
              />
            )}
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                letterSpacing: "0.2em",
                color: isListening ? "#ef4444" : "#737373",
                fontWeight: 500,
              }}
            >
              {isListening ? "RECORDING" : "YOU"}
            </div>
          </div>

          {/* User Avatar */}
          <div
            className="flex items-center justify-center transition-all duration-300 relative"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              border: isListening
                ? "1px solid rgba(239,68,68,0.6)"
                : "1px solid rgba(255,255,255,0.12)",
              boxShadow: isListening
                ? "0 0 0 4px rgba(239,68,68,0.15)"
                : "0 4px 12px rgba(0,0,0,0.5)",
              animation: isListening
                ? "recordPulse 2s ease-in-out infinite"
                : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontSize: "24px",
                color: "#d4d4d4",
              }}
            >
              {initials}
            </span>
          </div>

          {/* Live transcript preview */}
          {liveTranscript && (
            <div
              className="w-full overflow-y-auto interview-scrollbar text-center"
              style={{
                maxHeight: "80px",
                padding: "0 12px",
              }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "rgba(255,255,255,0.4)",
                  fontStyle: "italic",
                }}
              >
                {liveTranscript}
              </p>
            </div>
          )}

          {/* Waveform while listening */}
          {isListening && (
            <div
              className="flex items-end"
              style={{ gap: "3px", height: "20px" }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "2px",
                    height: "100%",
                    background: "rgba(239,68,68,0.5)",
                    animation: "wavePulse 0.7s ease-in-out infinite",
                    animationDelay: `${i * 0.07}s`,
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // ==================== NEW MODE ====================
  const {
    phase = "answering",
    isSTTSupported = true,
    onStartRecording = () => {},
    onStopRecording = () => {},
  } = props as NewUserPanelProps;

  const isRecording = phase === "recording";
  const isMicVisible =
    phase === "answering" || phase === "recording" || phase === "error";
  const isDimmed =
    phase === "speaking" || phase === "submitting" || phase === "loading";

  // Avatar border styles based on phase
  const getAvatarBorder = () => {
    if (isRecording) {
      return "1px solid rgba(245,158,11,0.5)";
    }
    if (phase === "answering") {
      return "1px solid rgba(255,255,255,0.06)";
    }
    return "1px solid rgba(255,255,255,0.04)";
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{
        padding: "24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        opacity: isDimmed ? 0.5 : 1,
        transition: "opacity 300ms",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "9px",
          letterSpacing: "0.25em",
          color: "#2a2a2a",
          marginBottom: "20px",
        }}
      >
        YOU
      </div>

      {/* User Avatar */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "#141414",
          border: getAvatarBorder(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: isRecording
            ? "recordPulse 2s ease-in-out infinite"
            : "none",
          transition: "border 300ms, box-shadow 300ms",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "22px",
            color: "#525252",
          }}
        >
          {initials}
        </span>
      </div>

      {/* Mic Button */}
      {isMicVisible && (
        <div style={{ marginTop: "20px" }}>
          {!isSTTSupported ? (
            // STT not supported state
            <div className="flex flex-col items-center">
              <button
                disabled
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "12px",
                  color: "#f87171",
                  background: "transparent",
                  border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              >
                ⚠ Not Supported
              </button>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  color: "#3a3a3a",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                Use Chrome or Edge for voice input
              </p>
            </div>
          ) : phase === "answering" ? (
            // Ready to speak
            <button
              onClick={onStartRecording}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#0a0a0a",
                background: "#f59e0b",
                border: "none",
                borderRadius: "6px",
                padding: "10px 24px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              🎙 Speak
            </button>
          ) : phase === "recording" ? (
            // Recording
            <button
              onClick={onStopRecording}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#f59e0b",
                background: "transparent",
                border: "1px solid rgba(245,158,11,0.5)",
                borderRadius: "6px",
                padding: "10px 24px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              ■ Done
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
