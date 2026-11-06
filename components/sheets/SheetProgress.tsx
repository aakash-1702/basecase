import { ChevronRight, Trophy } from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";

export default function SheetProgress({
  solved,
  total,
  pct,
  onJump,
}: {
  solved: number;
  total: number;
  /** 0-100 */
  pct: number;
  onJump: () => void;
}) {
  return (
    <div className="card-base mx-auto mt-8 max-w-xl p-5 text-left">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
          <Trophy className="h-4 w-4 text-accent" />
          Your progress
        </span>
        <span className="font-display text-xl tabular-nums text-accent">
          {pct}%
        </span>
      </div>

      <ProgressBar value={pct} height={8} className="mt-3" />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-fg-secondary">
          <span className="font-semibold text-accent">{solved}</span> of {total}{" "}
          problems solved
          {solved === 0 && (
            <span className="ml-2 text-fg-muted">— let&apos;s get started!</span>
          )}
        </span>
        <button
          type="button"
          onClick={onJump}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          Jump to problems
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
