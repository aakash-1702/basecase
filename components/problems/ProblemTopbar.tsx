"use client";

import { memo } from "react";
import { Bookmark, BookmarkCheck, CheckCircle } from "lucide-react";
import { DifficultyBadge } from "@/components/shared";
import { cn } from "@/lib/utils";

interface ProblemTopbarProps {
  title: string;
  difficulty: string;
  tags: string[];
  bookmark: boolean;
  solved: boolean;
  disabled: boolean;
  onToggleBookmark: () => void;
}

const ProblemTopbar = memo(function ProblemTopbar({
  title,
  difficulty,
  tags,
  bookmark,
  solved,
  disabled,
  onToggleBookmark,
}: ProblemTopbarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-line px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <h1 className="truncate font-display text-base tracking-tight text-fg">
          {title}
        </h1>
        <DifficultyBadge difficulty={difficulty} className="shrink-0" />
        {tags.map((t) => (
          <span key={t} className="chip chip-accent shrink-0 font-mono">
            {t}
          </span>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={disabled}
          aria-pressed={bookmark}
          className={cn(
            "btn btn-sm font-mono text-[11px]",
            bookmark ? "btn-outline-accent" : "btn-secondary",
          )}
        >
          {bookmark ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          {bookmark ? "Saved" : "Bookmark"}
        </button>

        <span
          className={cn(
            "chip font-mono",
            solved
              ? "border-success/25 bg-success/10 text-success"
              : "chip-neutral",
          )}
        >
          {solved ? (
            <CheckCircle size={13} />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-fg-muted" />
          )}
          {solved ? "Solved" : "Not Solved"}
        </span>
      </div>
    </header>
  );
});

export default ProblemTopbar;
