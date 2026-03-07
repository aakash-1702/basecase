"use client";

import { AIOrb } from "../AIOrb";

type AIState = "asking" | "waiting" | "processing";

interface AIPanelProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  state: AIState;
}

export function AIPanel({ question, questionNumber, totalQuestions, state }: AIPanelProps) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-8 lg:p-12"
      style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border-subtle)" }}
    >
      {/* Label */}
      <div className="text-[10px] tracking-[0.2em] uppercase mb-10" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
        Interviewer
      </div>

      {/* AI Orb */}
      <div className="mb-10">
        <AIOrb size="large" state={state === "asking" ? "asking" : state === "processing" ? "processing" : "idle"} />
      </div>

      <div className="h-px w-24 mb-8" style={{ background: "var(--border-subtle)" }} />

      {/* Question Card */}
      <div
        className="max-w-lg p-6 border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", borderLeft: "3px solid var(--amber)", borderRadius: "6px" }}
      >
        <div className="text-xs mb-4" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
          Q / {questionNumber.toString().padStart(2, "0")}
        </div>
        <div className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)", lineHeight: 1.65 }}>
          {question}
        </div>
      </div>

      {/* State Indicator */}
      <div className="mt-8 flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: state === "asking" ? "var(--amber)" : "var(--text-dim)",
            animation: state === "asking" ? "breathe 2s ease-in-out infinite" : "none",
          }}
        />
        <span className="text-xs uppercase tracking-wide" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
          {state === "asking" ? "ASKING" : state === "waiting" ? "LISTENING" : "PROCESSING"}
        </span>
      </div>
    </div>
  );
}
