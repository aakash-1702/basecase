"use client";

import type { StepState } from "./types";
import {
  GitBranch,
  FileCode,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";

const STEP_CONFIG = [
  { icon: GitBranch, label: "Fetching project file tree from GitHub" },
  { icon: FileCode,  label: "Reading and filtering relevant source files" },
  { icon: Layers,    label: "Chunking and embedding your codebase" },
  { icon: Search,    label: "Running semantic search across your project" },
  { icon: Sparkles,  label: "Generating your personalised interview questions" },
] as const;

interface StaircaseStepProps {
  index: number;
  state: StepState;
}

export function StaircaseStep({ index, state }: StaircaseStepProps) {
  const { icon: Icon, label } = STEP_CONFIG[index];

  const isPending   = state === "pending";
  const isActive    = state === "active";
  const isCompleted = state === "completed";

  return (
    <div
      style={{ marginLeft: index * 32 }}
      className={[
        "relative overflow-hidden min-w-[320px] rounded-xl px-5 py-4 flex items-center gap-4 transition-all duration-300",
        isPending   ? "bg-zinc-900 border border-zinc-800" : "",
        isActive    ? "bg-zinc-900 border-l-2 border-indigo-500 border-t border-r border-b border-zinc-800/60" : "",
        isCompleted ? "bg-zinc-900 border-l-2 border-emerald-600 border-t border-r border-b border-zinc-800/60" : "",
        isActive    ? "[animation:ghv2SpringIn_350ms_cubic-bezier(0.34,1.56,0.64,1)_both]" : "",
      ].join(" ")}
    >
      {/* Shimmer sweep — active only */}
      {isActive && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{ animation: "ghv2ShimmerSweep 1.8s linear infinite" }}
        />
      )}

      {/* Completed emerald tint */}
      {isCompleted && (
        <div className="pointer-events-none absolute inset-0 bg-emerald-500/5 rounded-xl" />
      )}

      {/* Icon area */}
      <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
        {isPending && (
          <span className="text-zinc-600 text-lg leading-none select-none">○</span>
        )}

        {isActive && (
          <>
            {/* Ping ring */}
            <span
              className="absolute inset-0 rounded-full bg-indigo-400/30"
              style={{ animation: "ghv2PingRing 1s ease-out infinite" }}
            />
            {/* Core dot */}
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </>
        )}

        {isCompleted && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10 L8 14 L16 6"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              strokeDashoffset="24"
              style={{ animation: "ghv2CheckDraw 300ms ease forwards" }}
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <span
        className={[
          "text-sm font-medium leading-snug relative z-10 transition-colors duration-300",
          isPending   ? "text-zinc-600" : "",
          isActive    ? "text-white" : "",
          isCompleted ? "text-zinc-300" : "",
        ].join(" ")}
      >
        <span className="text-xs uppercase tracking-widest mr-2 opacity-50">
          {String(index + 1).padStart(2, "0")}
        </span>
        {label}
      </span>
    </div>
  );
}
