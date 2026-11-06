export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export function normalizeDifficulty(value?: string | null): Difficulty {
  const v = (value ?? "").toLowerCase();
  return v === "easy" || v === "hard" ? v : "medium";
}

/** Tailwind chip class per difficulty (defined in globals.css). */
export const difficultyChipClass: Record<Difficulty, string> = {
  easy: "chip chip-easy",
  medium: "chip chip-medium",
  hard: "chip chip-hard",
};

/** Raw colours for inline styles / SVG. */
export const difficultyColor: Record<Difficulty, string> = {
  easy: "#4ade80",
  medium: "#fbbf24",
  hard: "#f87171",
};

export const difficultyLabel: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
