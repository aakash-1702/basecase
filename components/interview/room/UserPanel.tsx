"use client";

import { Mic, Square } from "lucide-react";

interface UserPanelProps {
  userName: string;
  isRecording: boolean;
  transcript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function UserPanel({
  userName, isRecording, transcript,
  onStartRecording, onStopRecording,
}: UserPanelProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className="h-full flex flex-col p-8 lg:p-12" style={{ background: "var(--bg-base)" }}>
      {/* Label */}
      <div className="text-[10px] tracking-[0.2em] uppercase mb-6" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
        {isRecording ? "● Recording" : "You"}
      </div>

      {/* User Avatar */}
      <div className="flex justify-center mb-6">
        <div
          className="w-[100px] h-[100px] rounded-full flex items-center justify-center border transition-all"
          style={{
            background: "#111",
            borderColor: isRecording ? "var(--amber)" : "rgba(255,255,255,0.06)",
            boxShadow: isRecording ? "0 0 0 3px rgba(245,158,11,0.15)" : "none",
            animation: isRecording ? "recordPulse 2s ease-in-out infinite" : "none",
          }}
        >
          <span className="text-2xl" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--amber)" }}>
            {initials}
          </span>
        </div>
      </div>

      {/* ── Start Answering CTA — Prominent, centered ── */}
      <div className="flex justify-center mb-6">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            className="flex items-center gap-2.5 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            <Mic className="w-4 h-4" />
            Start Answering
          </button>
        ) : (
          <button
            onClick={onStopRecording}
            className="flex items-center gap-2.5 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "transparent",
              color: "var(--amber)",
              border: "1px solid var(--amber)",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            <Square className="w-3.5 h-3.5" />
            Done Answering
          </button>
        )}
      </div>

      <div className="h-px mb-6" style={{ background: "var(--border-subtle)" }} />

      {/* Transcript Area */}
      <div
        className="flex-1 p-5 border overflow-y-auto interview-scrollbar"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", borderRadius: "6px", minHeight: "160px" }}
      >
        {transcript ? (
          <div className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-mono)", color: "#e5e5e5" }}>
            {transcript}
          </div>
        ) : (
          <div className="text-sm italic" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-dim)" }}>
            {isRecording ? "Listening to your answer..." : "Your answer will appear here once you start speaking."}
          </div>
        )}

        {/* Waveform */}
        {isRecording && (
          <div className="flex items-center gap-1 mt-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full"
                style={{
                  height: "20px",
                  background: "var(--amber)",
                  animation: "wavePulse 1s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
