import type { InterviewListItem } from "@/types/interview";

/** "Just now" / "5m ago" / "2d ago" / "7 Mar". */
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatRenewalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** CSS colour for a 0–10 score. */
export function scoreTone(score: number): string {
  if (score >= 8) return "var(--success)";
  if (score >= 6) return "var(--warning)";
  if (score >= 4) return "var(--accent)";
  return "var(--danger)";
}

/** CSS colour for a 0–100 metric. */
export function metricTone(pct: number): string {
  if (pct >= 85) return "var(--success)";
  if (pct >= 70) return "var(--warning)";
  if (pct >= 55) return "var(--accent)";
  return "var(--danger)";
}

/** Lobby URL for a pending interview (mirrors app/(main)/interview/[id]/page.tsx). */
export function joinRoomHref(interview: InterviewListItem): string {
  const params = new URLSearchParams({
    interviewId: interview.id,
    mode: interview.mode,
    company: interview.company,
    difficulty: interview.difficulty || "senior",
    questions: String(interview.questionLimit || 8),
  });
  return `/interview/new-session?${params.toString()}`;
}

/** Entrance stagger for card grids; capped so long lists don't wait. */
export function staggerDelay(index: number): string {
  return `${Math.min(index, 8) * 60}ms`;
}
