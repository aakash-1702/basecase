"use client";

import { memo } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import GlowCard from "@/components/shared/GlowCard";
import CardHeader from "./CardHeader";

export interface RevisionRowData {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  /** pre-computed on the server, e.g. "2 days overdue" */
  dueLabel: string;
}

const RevisionRow = memo(function RevisionRow({
  index,
  title,
  slug,
  difficulty,
  dueLabel,
}: RevisionRowData & { index: number }) {
  return (
    <Link
      href={`/problems/${slug}`}
      className="group flex items-center gap-3 border-b border-r border-line px-5 py-3 transition-colors hover:bg-fg/[0.025]"
    >
      <span className="w-5 shrink-0 font-mono text-[11px] text-fg-dim">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg transition-colors group-hover:text-accent-hover">
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] text-danger">{dueLabel}</span>
      </span>
      <DifficultyBadge difficulty={difficulty} />
    </Link>
  );
});

export default function RevisionBanner({
  items,
  totalDue,
}: {
  items: RevisionRowData[];
  totalDue: number;
}) {
  return (
    <GlowCard
      hover={false}
      padding="none"
      className="overflow-hidden"
    >
      <div id="revision" className="scroll-mt-20">
        <CardHeader
          title={
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-accent">Due for revision</span>
            </>
          }
          action={
            <span className="chip chip-neutral">
              <strong className="font-semibold text-accent">{totalDue}</strong>
              &nbsp;total due
            </span>
          }
        />

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="text-sm text-fg-muted">
              No problems due right now — you&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="-mb-px -mr-px grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {items.map((item, i) => (
              <RevisionRow key={item.id} index={i} {...item} />
            ))}
          </div>
        )}
      </div>
    </GlowCard>
  );
}
