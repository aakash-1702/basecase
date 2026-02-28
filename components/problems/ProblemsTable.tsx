// components/problems/ProblemsTable.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ConfidenceLevel =
  | "not_attempted"
  | "confident"
  | "needs_revision"
  | "failed"
  | "skipped";

export type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH" | null;

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  userProgress?: {
    solved: boolean;
    confidenceV2: ConfidenceV2;
  } | null;
};

const difficultyColors = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const confidenceConfig: Record<
  NonNullable<ConfidenceV2> | "not_attempted",
  { label: string; color: string }
> = {
  not_attempted: { label: "Not attempted", color: "text-neutral-500" },
  LOW: { label: "Low confidence", color: "text-rose-400" },
  MEDIUM: { label: "Med confidence", color: "text-amber-400" },
  HIGH: { label: "High confidence", color: "text-emerald-400" },
};

interface ProblemsTableProps {
  problems: Problem[];
}

export default function ProblemsTable({ problems }: ProblemsTableProps) {
  const [localSolved, setLocalSolved] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      problems.forEach(
        (p) => (initial[p.id] = p.userProgress?.solved ?? false),
      );
      return initial;
    },
  );

  const [localConfidence, setLocalConfidence] = useState<
    Record<string, ConfidenceV2>
  >(() => {
    const initial: Record<string, ConfidenceV2> = {};
    problems.forEach((p) => {
      initial[p.id] = p.userProgress?.confidenceV2 ?? null;
    });
    return initial;
  });

  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    problems.forEach((p) => {
      initial[p.id] = "";
    });
    return initial;
  });

  useEffect(() => {
    setLocalSolved(() => {
      const next: Record<string, boolean> = {};
      problems.forEach((p) => (next[p.id] = p.userProgress?.solved ?? false));
      return next;
    });

    setLocalConfidence(() => {
      const next: Record<string, ConfidenceV2> = {};
      problems.forEach((p) => {
        next[p.id] = p.userProgress?.confidenceV2 ?? null;
      });
      return next;
    });

    setNotesMap((prev) => {
      const next: Record<string, string> = {};
      problems.forEach((p) => {
        next[p.id] = prev[p.id] ?? "";
      });
      return next;
    });
  }, [problems]);

  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    h: number;
  } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback((id: string, el: HTMLElement) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = el.getBoundingClientRect();
    setTooltipPos({ x: rect.right, y: rect.top, h: rect.height });
    setTooltipId(id);
    tooltipTimeout.current = setTimeout(() => setTooltipId(null), 3000);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltipId(null);
  }, []);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
            <th className="w-12 p-4 text-center">Solved</th>
            <th className="py-4 px-3 font-medium">Problem</th>
            <th className="w-28 py-4 px-3 font-medium text-center">
              Difficulty
            </th>
            <th className="py-4 px-3 font-medium">Confidence</th>
          </tr>
        </thead>

        <tbody>
          {problems.map((problem) => {
            const isSolved = localSolved[problem.id] ?? false;
            const confidenceV2 = localConfidence[problem.id] ?? null;
            const notes = notesMap[problem.id] ?? "";
            const confKey: NonNullable<ConfidenceV2> | "not_attempted" =
              confidenceV2 ?? "not_attempted";
            const confCfg = confidenceConfig[confKey];

            return (
              <tr
                key={problem.id}
                className={cn(
                  "group border-b border-neutral-800/60 transition-all duration-300 ease-out",
                  "hover:bg-neutral-900/70 hover:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.08)]",
                  "hover:-translate-y-px",
                )}
              >
                {/* Solved column */}
                <td className="p-4">
                  <div className="flex items-center justify-center">
                    {isSolved ? (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-pulse" />
                        <CheckCircle2 className="h-7 w-7 text-emerald-500 relative z-10" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="relative cursor-pointer focus:outline-none"
                        onClick={(e) =>
                          showTooltip(problem.id, e.currentTarget)
                        }
                        onMouseEnter={(e) =>
                          showTooltip(problem.id, e.currentTarget)
                        }
                        onMouseLeave={hideTooltip}
                      >
                        <Circle className="h-7 w-7 text-neutral-600 hover:text-rose-400 transition-colors" />
                      </button>
                    )}
                  </div>
                </td>

                {/* Problem title */}
                <td className="py-4 px-3 relative">
                  <Link
                    href={`/problems/${problem.slug}`}
                    className={cn(
                      "inline-block text-neutral-100 font-medium transition-all duration-300",
                      "group-hover:text-amber-400 group-hover:translate-x-0.5",
                      "group-hover:scale-[1.015] origin-left",
                    )}
                  >
                    {problem.title}
                  </Link>
                  <span
                    className={cn(
                      "absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full",
                      "bg-gradient-to-r from-amber-500/0 via-amber-500/70 to-amber-500/0",
                      "scale-x-0 origin-center transition-transform duration-300 ease-out",
                      "group-hover:scale-x-100",
                    )}
                  />
                </td>

                {/* Difficulty */}
                <td className="py-4 px-3 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
                      difficultyColors[problem.difficulty],
                      "group-hover:scale-105 group-hover:shadow-sm group-hover:shadow-amber-500/10",
                    )}
                  >
                    {problem.difficulty.charAt(0).toUpperCase() +
                      problem.difficulty.slice(1)}
                  </span>
                </td>

                {/* Confidence */}
                <td className="py-4 px-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className={cn("font-medium", confCfg.color)}>
                      {confCfg.label}
                    </span>

                    {notes && (
                      <span
                        title={notes}
                        className="flex items-center gap-1 text-xs text-neutral-400 italic truncate max-w-[220px]"
                      >
                        <Pencil className="h-3 w-3 text-amber-400/70 shrink-0" />
                        {notes}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {problems.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          No problems found. Keep pushing – your next win is waiting!
        </div>
      )}

      {/* Portal tooltip — renders at document.body so it's never clipped */}
      {tooltipId &&
        tooltipPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltipPos.x + 20,
              top: tooltipPos.y + tooltipPos.h / 2,
              transform: "translateY(-50%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <div
              className={cn(
                "whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold",
                "bg-rose-950 text-rose-300 border border-rose-500/40",
                "shadow-xl shadow-rose-900/30",
              )}
              style={{ animation: "tooltipFadeIn 0.15s ease-out" }}
            >
              Open the problem & solve it — progress syncs automatically!
              {/* Arrow pointing left toward the circle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 right-full"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderRight: "6px solid rgb(136 19 55 / 0.4)",
                }}
              />
            </div>
          </div>,
          document.body,
        )}

      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
