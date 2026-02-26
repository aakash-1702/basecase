// ═══════════════════════════════════════════════════════════
// TYPES — exact API response shape
// ═══════════════════════════════════════════════════════════

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  leetcodeUrl: string;
  description: string;
  examples: Example[];
  constraints: string;
  patterns: string[];
  prevSlug?: string;
  nextSlug?: string;
  sheetName?: string;
  acceptanceRate?: number;
  frequency?: number;
  xpReward: number;
}

export interface UserProgress {
  solved: boolean;
  solvedAt?: string;
  bookmarked: boolean;
  confidence: "low" | "medium" | "high" | null;
  notes: string;
}

export interface UserAccount {
  xp: number;
  plan: "free" | "plus";
  aiCreditsRemaining: number | null;
  aiCreditsTotal: number | null;
}

export type AIFeatureId = "hint" | "review" | "chat";

export type ConfidenceLevel = "low" | "medium" | "high";
