"use client";

import { Mic, Square } from "lucide-react";
import type { TurnState } from "@/types/interview-room";

interface BottomControlBarProps {
  turnState: TurnState;
  onStart: () => void;
  onStop: () => void;
  isComplete: boolean;
}

const DOTS = [0, 1, 2];

export function BottomControlBar({ turnState, onStart, onStop, isComplete }: BottomControlBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex h-20 items-center justify-center pb-2"
      style={{ background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}
    >
      {isComplete ? (
        <p className="font-mono text-sm tracking-wide text-fg-muted">
          Session complete — your report is being prepared
        </p>
      ) : turnState === "idle" ? (
        <button
          type="button"
          onClick={onStart}
          className="btn btn-primary btn-lg px-12 font-mono tracking-wider"
        >
          <Mic className="h-4 w-4" />
          Start Speaking
        </button>
      ) : turnState === "listening" ? (
        <button
          type="button"
          onClick={onStop}
          className="btn btn-outline-accent btn-lg px-12 font-mono tracking-wider"
          style={{ animation: "recordPulse 2s ease-in-out infinite" }}
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          Stop Speaking
        </button>
      ) : (
        /* processing */
        <button
          type="button"
          disabled
          className="btn btn-secondary btn-lg px-12 font-mono tracking-wider"
        >
          <span className="flex gap-1" aria-hidden>
            {DOTS.map((i) => (
              <span
                key={i}
                className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
          AI is responding...
        </button>
      )}
    </div>
  );
}
