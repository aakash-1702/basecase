"use client";

import { memo } from "react";
import Link from "next/link";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import GlowCard from "@/components/shared/GlowCard";
import CardHeader, { CardHeaderLink } from "./CardHeader";

export interface SubmissionRowData {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  /** pre-computed on the server, e.g. "3h ago" */
  timeLabel: string;
}

const SubmissionRow = memo(function SubmissionRow({
  title,
  slug,
  difficulty,
  timeLabel,
}: SubmissionRowData) {
  return (
    <Link
      href={`/problems/${slug}`}
      className="group flex items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-b-0 hover:bg-fg/[0.025]"
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-success ring-2 ring-success/25"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg transition-colors group-hover:text-accent-hover">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] text-fg-muted">Solved</span>
      </span>
      <DifficultyBadge difficulty={difficulty} />
      <span className="w-16 shrink-0 text-right font-mono text-[11px] text-fg-dim">
        {timeLabel}
      </span>
    </Link>
  );
});

export default function RecentSubmissions({
  items,
  className,
}: {
  items: SubmissionRowData[];
  className?: string;
}) {
  return (
    <GlowCard hover={false} padding="none" className={`overflow-hidden ${className ?? ""}`}>
      <CardHeader
        title="Recent submissions"
        action={<CardHeaderLink href="/problems">Solve more →</CardHeaderLink>}
      />
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          No submissions yet — solve your first problem!
        </p>
      ) : (
        <div>
          {items.map((item) => (
            <SubmissionRow key={item.id} {...item} />
          ))}
        </div>
      )}
    </GlowCard>
  );
}
