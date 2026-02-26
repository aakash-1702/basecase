import { Zap, FileSearch, MessageSquare } from "lucide-react";
import type { AIFeatureId, ConfidenceLevel } from "./types";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// STATIC MAPS — never re-created during renders
// ═══════════════════════════════════════════════════════════

export const DIFFICULTY_MAP = {
  Easy: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
  },
  Medium: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
  },
  Hard: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.2)",
  },
} as const;

export const CONFIDENCE_MAP: Record<
  ConfidenceLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.4)",
  },
  medium: {
    label: "Medium",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.4)",
  },
  high: {
    label: "High",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.4)",
  },
};

export interface AIFeatureConfig {
  id: AIFeatureId;
  icon: LucideIcon;
  label: string;
  desc: string;
}

export const AI_FEATURES: AIFeatureConfig[] = [
  {
    id: "hint",
    icon: Zap,
    label: "Request Strategy Hint",
    desc: "Unlock logic without seeing code",
  },
  {
    id: "review",
    icon: FileSearch,
    label: "Critique My Solution",
    desc: "Analyze complexity and edge cases",
  },
  {
    id: "chat",
    icon: MessageSquare,
    label: "Consult AI Architect",
    desc: "Ask anything about this pattern",
  },
];
