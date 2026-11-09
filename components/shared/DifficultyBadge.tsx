import { cn } from "@/lib/utils";
import {
  difficultyChipClass,
  difficultyLabel,
  normalizeDifficulty,
} from "@/lib/difficulty";

export default function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty?: string | null;
  className?: string;
}) {
  const d = normalizeDifficulty(difficulty);
  return (
    <span className={cn(difficultyChipClass[d], className)}>
      {difficultyLabel[d]}
    </span>
  );
}
