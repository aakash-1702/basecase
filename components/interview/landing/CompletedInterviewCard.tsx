"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewListItem } from "@/types/interview";
import { ScoreRing } from "./ScoreRing";
import { formatTimeAgo, metricTone, staggerDelay } from "./utils";

interface CompletedInterviewCardProps {
  interview: InterviewListItem;
  index: number;
  onDelete: (id: string) => void;
}

function CompletedInterviewCardBase({ interview, index, onDelete }: CompletedInterviewCardProps) {
  const feedback = interview.feedback;
  const score = feedback?.overallScore ?? 0;
  const confidence = feedback?.confidence?.score ?? 0;
  const depth = feedback?.depthReview?.score ?? 0;
  const english = feedback?.englishQuality?.score ?? 0;

  const metrics = [
    { label: "Efficiency", val: Math.round((confidence + depth) / 2) * 10, primary: true },
    { label: "Confidence", val: confidence * 10, primary: false },
    { label: "Depth", val: depth * 10, primary: false },
    { label: "Clarity", val: english * 10, primary: false },
  ];

  const timeAgo = formatTimeAgo(interview.completedAt || interview.startedAt);
  const isProcessing = interview.status === "processing";

  return (
    <Link
      href={`/interview/${interview.id}/report`}
      className="group card-base card-hover card-glow-top relative block animate-fade-in p-6"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <button
        type="button"
        aria-label="Delete interview"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(interview.id);
        }}
        className="absolute right-3 top-3 z-10 rounded-md p-2 text-fg-muted opacity-0 transition-[opacity,color,background-color] hover:bg-danger/15 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="mb-4 pr-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-fg">{interview.company}</span>
          <span className="chip chip-accent uppercase tracking-wider">{interview.mode}</span>
        </div>
        <p className="flex items-center gap-2 font-mono text-[11px] text-fg-muted">
          <span>{timeAgo}</span>
          <span>·</span>
          <span>{interview.questionLimit ?? "—"} questions</span>
        </p>
      </div>

      {feedback ? (
        <div className="mb-4 flex items-center gap-4 border-b border-line pb-4">
          <div className="shrink-0 rounded-xl border border-line bg-surface-2 p-2">
            <ScoreRing score={score} size={48} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
              Overall score
            </p>
            <p className="font-display text-xl text-fg">
              {score.toFixed(1)} <span className="text-xs font-normal text-fg-muted">/ 10</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <span
            className={cn(
              "chip uppercase tracking-wider",
              isProcessing ? "chip-accent" : "border-success/30 bg-success/10 text-success",
            )}
          >
            {isProcessing ? "Processing…" : "Completed"}
          </span>
        </div>
      )}

      {feedback && (
        <div className="mb-4 space-y-1.5">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span
                className={cn(
                  "w-[58px] shrink-0 font-mono text-[10px]",
                  m.primary ? "text-fg" : "text-fg-muted",
                )}
              >
                {m.label}
              </span>
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-fg/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.val}%`, background: metricTone(m.val) }}
                />
              </div>
              <span
                className={cn(
                  "w-5 text-right font-mono text-[10px] tabular-nums",
                  m.primary ? "text-fg" : "text-fg-muted",
                )}
              >
                {Math.round(m.val / 10)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="chip chip-neutral capitalize">{interview.difficulty || "—"}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:underline">
          Report
          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
    </Link>
  );
}

export const CompletedInterviewCard = memo(CompletedInterviewCardBase);
