import { memo } from "react";
import type { InterviewListItem } from "@/types/interview";
import { staggerDelay } from "./utils";

function ProcessingInterviewCardBase({
  interview,
  index,
}: {
  interview: InterviewListItem;
  index: number;
}) {
  return (
    <div
      className="card-base animate-fade-in border-accent/20 p-6"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fg">{interview.company}</p>
          <p className="font-mono text-[11px] text-fg-muted">{interview.mode}</p>
        </div>
        <span className="chip chip-accent uppercase tracking-wider">
          <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
          Processing
        </span>
      </div>
      <p className="font-mono text-xs text-fg-muted">Your feedback report is being generated…</p>
    </div>
  );
}

export const ProcessingInterviewCard = memo(ProcessingInterviewCardBase);
