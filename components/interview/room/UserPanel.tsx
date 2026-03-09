"use client";

import type { TurnState } from "@/types/interview-room";

interface UserPanelProps {
  userName: string;
  liveTranscript: string;
  turnState: TurnState;
}

export function UserPanel({ userName, liveTranscript, turnState }: UserPanelProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const isListening = turnState === "listening";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes micPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.3); }
        }
      `}} />

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
            animation: isListening ? "recordPulse 2s ease-in-out infinite" : "none",
          }}
        >
          <span style={{ fontFamily: "var(--font-dm-serif)", fontSize: "24px", color: "#d4d4d4" }}>
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
          <div className="flex items-end" style={{ gap: "3px", height: "20px" }}>
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
