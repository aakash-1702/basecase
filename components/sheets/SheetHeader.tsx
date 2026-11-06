import PageHero from "@/components/shared/PageHero";
import type { Difficulty } from "@/lib/difficulty";
import SheetProgress from "./SheetProgress";
import SheetStats, { type SheetCounts } from "./SheetStats";

/** Hero for a single sheet: title, description, category tiles and progress. */
export default function SheetHeader({
  title,
  description,
  counts,
  totalSolved,
  pct,
  onSelectDifficulty,
  onJump,
}: {
  title: string;
  description?: string | null;
  counts: SheetCounts;
  totalSolved: number;
  pct: number;
  onSelectDifficulty: (difficulty: Difficulty | "all") => void;
  onJump: () => void;
}) {
  return (
    <PageHero
      eyebrow="Curated problem sheet"
      title={title}
      description={description || "Master every pattern, ace every interview."}
    >
      <p className="mt-9 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
        Select a category to jump
      </p>
      <SheetStats counts={counts} onSelect={onSelectDifficulty} />
      <SheetProgress
        solved={totalSolved}
        total={counts.total}
        pct={pct}
        onJump={onJump}
      />
    </PageHero>
  );
}
