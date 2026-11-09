import StatTile from "@/components/shared/StatTile";
import { difficultyColor, type Difficulty } from "@/lib/difficulty";

export interface SheetCounts {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

const ITEMS: { key: Difficulty | "all"; label: string; color: string }[] = [
  { key: "all", label: "All problems", color: "var(--accent)" },
  { key: "easy", label: "Easy", color: difficultyColor.easy },
  { key: "medium", label: "Medium", color: difficultyColor.medium },
  { key: "hard", label: "Hard", color: difficultyColor.hard },
];

/** Clickable stat tiles – each one opens the matching sections and scrolls to them. */
export default function SheetStats({
  counts,
  onSelect,
}: {
  counts: SheetCounts;
  onSelect: (difficulty: Difficulty | "all") => void;
}) {
  return (
    <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className="card-base card-hover card-glow-top flex cursor-pointer flex-col items-center px-4 py-5"
        >
          <StatTile
            className="items-center"
            label={item.label}
            value={
              <span style={{ color: item.color }}>
                {item.key === "all" ? counts.total : counts[item.key]}
              </span>
            }
          />
        </button>
      ))}
    </div>
  );
}
