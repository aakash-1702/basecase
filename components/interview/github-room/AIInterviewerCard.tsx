"use client";

import type { InterviewState } from "./types";
import { Loader2 } from "lucide-react";

interface AIInterviewerCardProps {
  interviewState: InterviewState;
}

const STATUS: Record<InterviewState, { text: string; color: string; dot?: string }> = {
  "ai-speaking": {
    text: "Asking question...",
    color: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  idle: {
    text: "Waiting for your response",
    color: "text-zinc-500",
  },
  "user-speaking": {
    text: "Listening...",
    color: "text-emerald-400",
  },
  processing: {
    text: "Processing your response...",
    color: "text-amber-400",
  },
  ended: {
    text: "Interview complete",
    color: "text-zinc-500",
  },
};

export function AIInterviewerCard({ interviewState }: AIInterviewerCardProps) {
  const status = STATUS[interviewState];
  const isSpeaking = interviewState === "ai-speaking";
  const isProcessing = interviewState === "processing";

  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
      {/* Avatar */}
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {isSpeaking ? (
            <>
              {/* Pulsing concentric rings when speaking */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx="40"
                  cy="40"
                  r={28 + i * 6}
                  stroke="#6366f1"
                  strokeWidth="1"
                  fill="none"
                  style={{
                    animation: `ghv2AiPulse 2s ease-out ${i * 0.5}s infinite`,
                    transformOrigin: "40px 40px",
                  }}
                />
              ))}
              <circle cx="40" cy="40" r="22" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="14" fill="rgba(99,102,241,0.25)" />
            </>
          ) : (
            <>
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="rgba(99,102,241,0.08)"
                stroke="#6366f1"
                strokeWidth="1"
                style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.4))" }}
              />
              <circle cx="40" cy="40" r="16" fill="rgba(99,102,241,0.15)" />
            </>
          )}
        </svg>
      </div>

      {/* Label */}
      <p className="text-zinc-400 text-xs font-medium tracking-wider uppercase mt-1">
        AI Interviewer
      </p>

      {/* Status */}
      <div className={`flex items-center gap-1.5 ${status.color}`}>
        {status.dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
            style={{ animation: "ghv2Breathing 1.5s ease-in-out infinite" }}
          />
        )}
        {isProcessing && (
          <Loader2 className="w-3 h-3 animate-spin" />
        )}
        <span className="text-xs">{status.text}</span>
      </div>
    </div>
  );
}
