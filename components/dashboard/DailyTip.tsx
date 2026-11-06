import { Sparkles } from "lucide-react";
import GlowCard from "@/components/shared/GlowCard";

export interface Tip {
  topic: string;
  text: React.ReactNode;
}

const Strong = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-medium text-fg">{children}</strong>
);

export const DAILY_TIPS: Tip[] = [
  {
    topic: "Heap",
    text: (
      <>
        When solving heap problems, always ask:{" "}
        <Strong>do I need the min or max k elements?</Strong> This determines
        which heap type to use.
      </>
    ),
  },
  {
    topic: "Array",
    text: (
      <>
        For array problems, consider the <Strong>two-pointer technique</Strong>{" "}
        — it often reduces O(n²) solutions to O(n).
      </>
    ),
  },
  {
    topic: "Graph",
    text: (
      <>
        If a graph problem asks for the <Strong>shortest path in an unweighted
        graph</Strong>, BFS is almost always the answer — reach for Dijkstra
        only when edges carry weights.
      </>
    ),
  },
  {
    topic: "Dynamic programming",
    text: (
      <>
        Before writing a DP, write the <Strong>recurrence in plain words</Strong>
        . If you can&apos;t state what the state represents, the table will not
        save you.
      </>
    ),
  },
];

/** Deterministic pick per calendar day so the tip is stable across renders. */
export function getDailyTip(date = new Date()): Tip {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

export default function DailyTip({ tip }: { tip: Tip }) {
  return (
    <GlowCard hover={false} padding="sm" className="border-l-2 border-l-accent/60">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          <Sparkles className="h-3 w-3" />
          Daily tip
        </span>
        <span className="chip chip-neutral">{tip.topic}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{tip.text}</p>
    </GlowCard>
  );
}
