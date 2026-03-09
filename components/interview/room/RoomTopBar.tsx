"use client";

import { useState, useEffect } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import type { InterviewConfig } from "@/types/interview-room";

interface RoomTopBarProps {
  config: InterviewConfig;
  onExitClick?: () => void;
}

export function RoomTopBar({ config, onExitClick }: RoomTopBarProps) {
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);

  useEffect(() => {
    // Show warning if not Chrome or Edge (detect via native SpeechRecognition absence)
    // Chrome/Edge have webkitSpeechRecognition, Safari also has it but less reliable
    // We'll show warning if it's not a Chromium-based browser with good STT support
    const isChromiumBased =
      typeof window !== "undefined" &&
      "chrome" in window &&
      "webkitSpeechRecognition" in window;

    setShowBrowserWarning(!isChromiumBased);
  }, []);

  return (
    <div className="shrink-0">
      {/* Browser Warning Banner */}
      {showBrowserWarning && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-1.5"
          style={{
            background: "rgba(244, 63, 94, 0.1)",
            borderBottom: "1px solid rgba(244, 63, 94, 0.2)",
          }}
        >
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              color: "#f87171",
              letterSpacing: "0.02em",
            }}
          >
            Switch to Chrome or Edge for better experience
          </span>
        </div>
      )}

      {/* Main Top Bar */}
      <div
        className="flex items-center justify-between px-6 relative"
        style={{
          height: "48px",
          background: "#080808",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* LEFT: Interview Details */}
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "12px",
              color: "#525252",
              fontWeight: 500,
            }}
          >
            {config.company}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#3a3a3a",
              letterSpacing: "0.1em",
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "#3a3a3a",
              letterSpacing: "0.05em",
            }}
          >
            {config.mode}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#3a3a3a",
              letterSpacing: "0.1em",
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "#3a3a3a",
              letterSpacing: "0.05em",
            }}
          >
            {config.difficulty}
          </span>
        </div>

        {/* RIGHT: Exit Button */}
        {onExitClick && (
          <button
            onClick={onExitClick}
            className="flex items-center gap-2 transition-all duration-200"
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "#525252",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "6px 14px",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.3)";
              e.currentTarget.style.background = "rgba(244,63,94,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#525252";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Interview
          </button>
        )}
      </div>
    </div>
  );
}
