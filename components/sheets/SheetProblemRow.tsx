"use client";

import { memo } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import { cn } from "@/lib/utils";
import ConfidenceBadge from "./ConfidenceBadge";
import type { ConfidenceV2, SectionProblem } from "./types";

interface Props {
  item: SectionProblem;
  isSolved: boolean;
  confidence: ConfidenceV2;
  onShowTooltip: (id: string, el: HTMLElement) => void;
  onHideTooltip: () => void;
}

/** One problem row. Memoised: only re-renders when its own solved/confidence
 *  state changes, not when a sibling's tooltip opens. */
function SheetProblemRow({
  item,
  isSolved,
  confidence,
  onShowTooltip,
  onHideTooltip,
}: Props) {
  const p = item.problem;

  return (
    <tr
      className={cn(
        "group border-b border-line transition-colors last:border-b-0",
        isSolved
          ? "bg-success/[0.04] hover:bg-success/[0.07]"
          : "hover:bg-fg/[0.025]",
      )}
    >
      {/* Solved status (read-only; tooltip on unsolved) */}
      <td className="px-3 py-3.5 text-center">
        <div className="flex items-center justify-center">
          {isSolved ? (
            <CheckCircle2 className="h-5 w-5 text-success" aria-label="Solved" />
          ) : (
            <button
              type="button"
              aria-label="Not solved yet"
              className="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              onClick={(e) => onShowTooltip(p.id, e.currentTarget)}
              onMouseEnter={(e) => onShowTooltip(p.id, e.currentTarget)}
              onMouseLeave={onHideTooltip}
            >
              <Circle className="h-5 w-5 text-fg-dim transition-colors group-hover:text-accent/70" />
            </button>
          )}
        </div>
      </td>

      {/* Title → internal problem page */}
      <td className="px-3 py-3.5">
        <Link
          href={`/problems/${p.slug}`}
          className={cn(
            "inline-flex items-center gap-2 font-medium transition-colors",
            isSolved
              ? "text-fg-muted hover:text-fg-secondary"
              : "text-fg group-hover:text-accent-hover",
          )}
        >
          <span className={isSolved ? "line-through decoration-fg-dim" : undefined}>
            {p.title}
          </span>
          <ChevronRight className="h-4 w-4 -translate-x-1 text-accent opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </Link>
      </td>

      <td className="px-3 py-3.5 text-center">
        <DifficultyBadge difficulty={p.difficulty} />
      </td>

      <td className="px-3 py-3.5 text-center">
        <ConfidenceBadge confidence={confidence} />
      </td>
    </tr>
  );
}

export default memo(SheetProblemRow);
