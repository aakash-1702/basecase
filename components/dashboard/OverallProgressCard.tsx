import GlowCard from "@/components/shared/GlowCard";
import ProgressBar from "@/components/shared/ProgressBar";
import StatTile from "@/components/shared/StatTile";
import { difficultyColor, difficultyLabel, type Difficulty } from "@/lib/difficulty";
import ProgressRing from "./ProgressRing";

export interface DifficultyRow {
  difficulty: Difficulty;
  solved: number;
  total: number;
}

export default function OverallProgressCard({
  totalSolved,
  totalProblems,
  completion,
  rows,
  className,
}: {
  totalSolved: number;
  totalProblems: number;
  /** 0-100 */
  completion: number;
  rows: DifficultyRow[];
  className?: string;
}) {
  return (
    <GlowCard hover={false} className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
            Overall progress
          </span>
          <StatTile
            className="mt-3"
            value={
              <>
                {totalSolved}{" "}
                <span className="text-base font-normal text-fg-muted">
                  / {totalProblems}
                </span>
              </>
            }
            label="problems solved"
          />
        </div>
        <ProgressRing value={completion} label="done" />
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {rows.map(({ difficulty, solved, total }) => {
          const color = difficultyColor[difficulty];
          return (
            <li key={difficulty} className="flex items-center gap-3">
              <span
                className="w-14 font-mono text-[11px] uppercase tracking-[0.12em]"
                style={{ color }}
              >
                {difficultyLabel[difficulty]}
              </span>
              <ProgressBar
                value={total > 0 ? (solved / total) * 100 : 0}
                color={color}
                height={3}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-[11px] tabular-nums text-fg-muted">
                {solved}/{total}
              </span>
            </li>
          );
        })}
      </ul>
    </GlowCard>
  );
}
