"use client";

import { useRef, useState } from "react";
import { Loader2, Mic, Send, Square } from "lucide-react";
import type { InterviewState } from "./types";

interface SpeakButtonProps {
  interviewState: InterviewState;
  speechSupported: boolean;
  liveTranscript?: string;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  onSendText: (text: string) => void;
}

export function SpeakButton({
  interviewState,
  speechSupported,
  liveTranscript,
  onStartSpeaking,
  onStopSpeaking,
  onSendText,
}: SpeakButtonProps) {
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isIdle = interviewState === "idle";
  const isRecording = interviewState === "user-speaking";
  const isLocked =
    interviewState === "processing" || interviewState === "ai-speaking";
  const isEnded = interviewState === "ended";

  const handleSend = () => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setTextValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Fallback: No Speech API (show textarea) ── */
  if (!speechSupported) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: "#f59e0b",
            background: "rgba(245,158,11,0.08)",
            borderRadius: 8,
            padding: "8px 12px",
            lineHeight: 1.5,
          }}
        >
          Speech recognition is not supported in this browser. Type your response.
        </div>
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Type your response... (Enter to send)"
          disabled={isLocked || isEnded}
          style={{
            width: "100%",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: 12,
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            color: "#d4d4d4",
            resize: "none",
            outline: "none",
            opacity: isLocked || isEnded ? 0.4 : 1,
            cursor: isLocked || isEnded ? "not-allowed" : "text",
            transition: "border-color 150ms ease",
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLocked || isEnded || !textValue.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 20,
            border: "none",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#fff",
            background:
              isLocked || isEnded || !textValue.trim()
                ? "#3f3f46"
                : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            cursor:
              isLocked || isEnded || !textValue.trim()
                ? "not-allowed"
                : "pointer",
            opacity: isLocked || isEnded || !textValue.trim() ? 0.4 : 1,
            transition: "all 150ms ease",
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
          Send
        </button>
      </div>
    );
  }

  /* ── Ended ── */
  if (isEnded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <button
          type="button"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 24px",
            borderRadius: 20,
            background: "#27272a",
            color: "#71717a",
            border: "none",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            cursor: "not-allowed",
          }}
        >
          <Square style={{ width: 14, height: 14 }} />
          Interview Complete
        </button>
      </div>
    );
  }

  /* ── Locked (AI Speaking / Processing) ── */
  if (isLocked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <button
          type="button"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 24px",
            borderRadius: 20,
            background: "rgba(39,39,42,0.9)",
            border: "1px solid rgba(63,63,70,0.6)",
            color: "#71717a",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            cursor: "not-allowed",
            pointerEvents: "none",
          }}
        >
          <Loader2
            style={{
              width: 14,
              height: 14,
              animation: "spin 1s linear infinite",
            }}
          />
          {interviewState === "ai-speaking" ? "AI Speaking..." : "Processing..."}
        </button>
      </div>
    );
  }

  /* ── Recording: Stop Speaking ── */
  if (isRecording) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
        {/* Interim transcript floating chip */}
        {liveTranscript && (
          <div
            style={{
              width: "100%",
              maxHeight: 60,
              overflow: "hidden",
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(34,211,238,0.06)",
              border: "1px solid rgba(34,211,238,0.15)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "rgba(34,211,238,0.8)",
              lineHeight: 1.5,
              animation: "ghv2FadeIn 200ms ease-out both",
            }}
          >
            {liveTranscript}
          </div>
        )}

        <button
          type="button"
          onClick={onStopSpeaking}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "14px 24px",
            borderRadius: 20,
            border: "none",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
            cursor: "pointer",
            animation: "ghRecordPulse 1.5s ease-in-out infinite",
            transition: "all 200ms ease",
          }}
        >
          <Square style={{ width: 14, height: 14, fill: "currentColor" }} />
          Stop Speaking
        </button>
      </div>
    );
  }

  /* ── Idle: Start Speaking ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <button
        type="button"
        onClick={onStartSpeaking}
        disabled={!isIdle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "14px 24px",
          borderRadius: 20,
          border: "none",
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          fontWeight: 600,
          color: "#fff",
          background:
            "linear-gradient(135deg, #fb923c 0%, #f97316 45%, #ea580c 100%)",
          boxShadow:
            "0 10px 26px rgba(251,146,60,0.35), 0 0 0 1px rgba(251,146,60,0.18)",
          cursor: isIdle ? "pointer" : "not-allowed",
          opacity: isIdle ? 1 : 0.4,
          transition: "all 200ms ease",
        }}
      >
        <Mic style={{ width: 16, height: 16 }} />
        Start Speaking
      </button>
    </div>
  );
}
