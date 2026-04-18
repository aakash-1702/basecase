"use client";

import type { InterviewState } from "./types";
import { User } from "lucide-react";

interface UserCardProps {
  interviewState: InterviewState;
}

const WAVE_DELAYS = [0, 0.15, 0.3, 0.45, 0.6];

export function UserCard({ interviewState }: UserCardProps) {
  const isSpeaking = interviewState === "user-speaking";
  const isIdle = interviewState === "idle";

  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600"
        style={{
          animation: isIdle ? "ghv2Breathing 3.5s ease-in-out infinite" : undefined,
        }}
      >
        <User className="w-7 h-7 text-zinc-400" />
      </div>

      {/* Label */}
      <p className="text-zinc-400 text-xs font-medium tracking-wider uppercase">
        You
      </p>

      {/* Sound wave when speaking */}
      {isSpeaking && (
        <div className="flex items-end gap-0.5" style={{ height: 28 }}>
          {WAVE_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-emerald-400"
              style={{
                height: 28,
                transformOrigin: "bottom",
                animation: `ghv2WaveBar 0.9s ease-in-out ${delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status dot */}
      {!isSpeaking && (
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
      )}
    </div>
  );
}
