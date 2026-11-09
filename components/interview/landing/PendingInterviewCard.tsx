"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Sparkles, Trash2 } from "lucide-react";
import type { InterviewListItem } from "@/types/interview";
import { formatTimeAgo, joinRoomHref, staggerDelay } from "./utils";

interface PendingInterviewCardProps {
  interview: InterviewListItem;
  index: number;
  onDelete: (id: string) => void;
}

function PendingInterviewCardBase({ interview, index, onDelete }: PendingInterviewCardProps) {
  return (
    <Link
      href={joinRoomHref(interview)}
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
        <p className="font-mono text-[11px] text-fg-muted">
          {interview.questionLimit || "—"} questions · {interview.difficulty || "—"}
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent-soft px-3 py-2.5 text-xs text-accent">
        <Sparkles className="h-3.5 w-3.5" />
        Ready to begin — join the room
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(interview.startedAt)}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-accent group-hover:underline">
          Join room
          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
    </Link>
  );
}

export const PendingInterviewCard = memo(PendingInterviewCardBase);
