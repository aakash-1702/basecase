"use client";

import { memo } from "react";
import { Lightbulb } from "lucide-react";

export const EditorialContent = memo(function EditorialContent({
  insight,
  points,
}: {
  insight: string | null;
  points: string[];
}) {
  if (!insight && points.length === 0) {
    return (
      <p className="font-mono text-[11px] italic text-fg-muted">
        No editorial yet.
      </p>
    );
  }
  return (
    <div>
      {insight && (
        <div className="mb-6 rounded-r-xl border-l-[3px] border-accent/40 bg-linear-to-r from-accent/[0.04] to-transparent px-5 py-4">
          <p className="eyebrow mb-2.5 text-[10px] font-semibold">Key Insight</p>
          <p className="text-sm font-medium leading-[1.75] text-fg">{insight}</p>
        </div>
      )}
      {points.length > 0 && (
        <ol>
          {points.map((pt, i) => (
            <li
              key={i}
              className="flex items-start gap-3.5 border-b border-line py-3 last:border-b-0"
            >
              <span className="min-w-[22px] pt-0.5 font-mono text-xs font-bold text-accent">
                {i + 1}.
              </span>
              <p className="text-sm leading-[1.75] text-fg-secondary">{pt}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
});

export const HintsList = memo(function HintsList({ hints }: { hints: string[] }) {
  if (!hints.length) {
    return (
      <p className="font-mono text-[11px] italic text-fg-muted">No hints yet.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {hints.map((hint, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-xl border border-warning/10 bg-warning/[0.03] px-4 py-3.5 transition-colors hover:border-warning/20"
        >
          <Lightbulb size={13} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-sm leading-[1.7] text-fg-secondary">{hint}</p>
        </li>
      ))}
    </ul>
  );
});
