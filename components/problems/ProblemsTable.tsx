// components/problems/ProblemsTable.tsx
"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { DifficultyBadge, EmptyState } from "@/components/shared";
import { cn } from "@/lib/utils";

export type ConfidenceLevel =
  | "not_attempted"
  | "confident"
  | "needs_revision"
  | "failed"
  | "skipped";

export type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH" | null;

export interface ProblemRowData {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  userProgress?: {
    solved: boolean;
    confidenceV2: ConfidenceV2;
  } | null;
}

const CONFIDENCE: Record<
  NonNullable<ConfidenceV2> | "not_attempted",
  { label: string; className: string }
> = {
  not_attempted: { label: "Not attempted", className: "text-fg-muted" },
  LOW: { label: "Low confidence", className: "text-danger" },
  MEDIUM: { label: "Med confidence", className: "text-warning" },
  HIGH: { label: "High confidence", className: "text-success" },
};

interface TooltipState {
  id: string;
  x: number;
  y: number;
  h: number;
}

interface ProblemRowProps {
  problem: ProblemRowData;
  onShowTooltip: (id: string, el: HTMLElement) => void;
  onHideTooltip: () => void;
}

const ProblemRow = memo(function ProblemRow({
  problem,
  onShowTooltip,
  onHideTooltip,
}: ProblemRowProps) {
  const solved = problem.userProgress?.solved ?? false;
  const conf = CONFIDENCE[problem.userProgress?.confidenceV2 ?? "not_attempted"];
  const show = (e: React.MouseEvent<HTMLButtonElement>) =>
    onShowTooltip(problem.id, e.currentTarget);

  return (
    <tr className="group border-b border-line transition-colors hover:bg-surface-2">
      <td className="p-4">
        <div className="flex items-center justify-center">
          {solved ? (
            <CheckCircle2 className="h-6 w-6 text-success" aria-label="Solved" />
          ) : (
            <button
              type="button"
              aria-label="Not solved yet"
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              onClick={show}
              onMouseEnter={show}
              onMouseLeave={onHideTooltip}
            >
              <Circle className="h-6 w-6 text-fg-dim transition-colors hover:text-danger" />
            </button>
          )}
        </div>
      </td>

      <td className="px-3 py-4">
        <Link
          href={`/problems/${problem.slug}`}
          className="font-medium text-fg transition-colors group-hover:text-accent"
        >
          {problem.title}
        </Link>
      </td>

      <td className="px-3 py-4 text-center">
        <DifficultyBadge difficulty={problem.difficulty} />
      </td>

      <td className="px-3 py-4">
        <span className={cn("text-sm font-medium", conf.className)}>
          {conf.label}
        </span>
      </td>
    </tr>
  );
});

interface ProblemsTableProps {
  problems: ProblemRowData[];
}

export default function ProblemsTable({ problems }: ProblemsTableProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const showTooltip = useCallback(
    (id: string, el: HTMLElement) => {
      clearTimer();
      const rect = el.getBoundingClientRect();
      setTooltip({ id, x: rect.right, y: rect.top, h: rect.height });
      timer.current = window.setTimeout(() => setTooltip(null), 3000);
    },
    [clearTimer],
  );

  const hideTooltip = useCallback(() => {
    clearTimer();
    setTooltip(null);
  }, [clearTimer]);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">
            <th className="w-12 p-4 text-center font-medium">Solved</th>
            <th className="px-3 py-4 font-medium">Problem</th>
            <th className="w-28 px-3 py-4 text-center font-medium">Difficulty</th>
            <th className="px-3 py-4 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              onShowTooltip={showTooltip}
              onHideTooltip={hideTooltip}
            />
          ))}
        </tbody>
      </table>

      {problems.length === 0 && (
        <EmptyState
          className="mt-6"
          title="No problems found"
          description="Keep pushing – your next win is waiting!"
        />
      )}

      {/* Portal tooltip — rendered at document.body so it's never clipped */}
      {tooltip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] -translate-y-1/2 animate-in fade-in slide-in-from-bottom-1 duration-150"
            style={{ left: tooltip.x + 20, top: tooltip.y + tooltip.h / 2 }}
          >
            <div className="relative whitespace-nowrap rounded-lg border border-danger/40 bg-surface-2 px-3 py-2 text-xs font-semibold text-danger shadow-xl">
              Open the problem &amp; solve it — progress syncs automatically!
              <span
                aria-hidden
                className="absolute right-full top-1/2 -translate-y-1/2 border-y-[6px] border-r-[6px] border-y-transparent border-r-danger/40"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
