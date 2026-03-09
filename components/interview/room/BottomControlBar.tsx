"use client";

import type { TurnState } from "@/types/interview-room";

interface BottomControlBarProps {
  turnState: TurnState;
  onStart: () => void;
  onStop: () => void;
  isComplete: boolean;
}

export function BottomControlBar({ turnState, onStart, onStop, isComplete }: BottomControlBarProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes recordRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
        }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-4px); }
        }
      `}} />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center"
        style={{
          height: "80px",
          background: "linear-gradient(to top, #0a0a0a 60%, transparent)",
          backdropFilter: "blur(8px)",
          paddingBottom: "8px",
        }}
      >
        {isComplete ? (
          <div
            className="text-sm"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            Session complete — your report is being prepared
          </div>
        ) : turnState === "idle" ? (
          <button
            onClick={onStart}
            className="flex items-center gap-3 transition-all duration-200 hover:brightness-110 active:scale-[0.97] shadow-lg hover:shadow-amber-500/20"
            style={{
              background: "var(--amber, #f59e0b)",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "12px",
              padding: "16px 48px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "18px" }}>🎙</span>
            Start Speaking
          </button>
        ) : turnState === "listening" ? (
          <button
            onClick={onStop}
            className="flex items-center gap-3 transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "rgba(239,68,68,0.15)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "12px",
              padding: "16px 48px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: "pointer",
              animation: "recordRing 2s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: "14px" }}>⏹</span>
            Stop Speaking
          </button>
        ) : (
          /* processing */
          <button
            disabled
            className="flex items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px 48px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "var(--text-muted)",
                    animation: `dotBounce 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
            AI is responding...
          </button>
        )}
      </div>
    </>
  );
}
