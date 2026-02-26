"use client";

import React from "react";
import {
  Bookmark,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Cloud,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_MAP } from "../constants";
import type { Problem, UserProgress } from "../types";

interface ProblemHeaderProps {
  problem: Problem;
  draft: UserProgress;
  saving: boolean;
  isDirty: boolean;
  localXP: number;
  isPremium: boolean;
  onSave: () => void;
  onToggleBookmark: () => void;
}

export const ProblemHeader = React.memo(function ProblemHeader({
  problem,
  draft,
  saving,
  isDirty,
  localXP,
  isPremium,
  onSave,
  onToggleBookmark,
}: ProblemHeaderProps) {
  const diff = DIFFICULTY_MAP[problem.difficulty];

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(6,6,8,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Sub-nav: sheet breadcrumb + prev/next */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-9 items-center justify-between">
            <button className="mono flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-700 hover:text-amber-400 transition-colors">
              <ArrowLeft className="h-3 w-3" />
              {problem.sheetName ?? "Sheet"}
            </button>
            <div className="flex items-center gap-5">
              {problem.prevSlug && (
                <button className="mono flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-amber-400 transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Prev
                </button>
              )}
              {problem.nextSlug && (
                <button className="mono flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-amber-400 transition-colors">
                  Next <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main title bar */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Left: title + tags */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="sans text-xl font-black uppercase tracking-tight text-white truncate">
              {problem.title}
            </h1>
            <span
              className="mono shrink-0 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg"
              style={{
                color: diff.color,
                background: diff.bg,
                border: `1px solid ${diff.border}`,
              }}
            >
              {problem.difficulty}
            </span>
            <div className="hidden md:flex gap-1.5">
              {problem.tags.map((t) => (
                <span
                  key={t}
                  className="mono text-[8px] font-bold uppercase tracking-widest text-zinc-600 px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* XP chip */}
            <div
              className="mono flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest"
              style={{
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.18)",
                color: "#f97316",
              }}
            >
              <Trophy className="h-3 w-3" />
              {localXP.toLocaleString()} XP
            </div>

            {/* Plus badge */}
            {isPremium && (
              <div
                className="mono hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.28)",
                  color: "#fbbf24",
                }}
              >
                <Sparkles className="h-2.5 w-2.5" /> Plus
              </div>
            )}

            {/* Save button — only when dirty */}
            {isDirty && (
              <button
                onClick={onSave}
                disabled={saving}
                className="btn-orange mono flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] uppercase tracking-[0.2em]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Cloud className="h-3 w-3" />
                    Save
                  </>
                )}
              </button>
            )}

            {/* Bookmark */}
            <button
              onClick={onToggleBookmark}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl mono text-[9px] font-black uppercase tracking-widest transition-all duration-200"
              style={{
                background: draft.bookmarked
                  ? "rgba(251,191,36,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${draft.bookmarked ? "rgba(251,191,36,0.45)" : "rgba(255,255,255,0.1)"}`,
                color: draft.bookmarked ? "#fbbf24" : "#71717a",
                boxShadow: draft.bookmarked
                  ? "0 0 16px rgba(251,191,36,0.12)"
                  : "none",
              }}
            >
              <Bookmark
                className={cn(
                  "h-3.5 w-3.5",
                  draft.bookmarked && "fill-current",
                )}
              />
              <span>{draft.bookmarked ? "Bookmarked" : "Bookmark"}</span>
            </button>

            {/* LeetCode — primary CTA */}
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lc flex items-center gap-2 h-9 px-4 rounded-xl mono text-[10px] font-black uppercase tracking-widest"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              LeetCode ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
});
