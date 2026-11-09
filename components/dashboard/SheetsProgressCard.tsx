"use client";

import { memo } from "react";
import Link from "next/link";
import GlowCard from "@/components/shared/GlowCard";
import ProgressBar from "@/components/shared/ProgressBar";
import type { SheetProgressItem } from "@/lib/dashboard";
import CardHeader, { CardHeaderLink } from "./CardHeader";

function tone(pct: number) {
  if (pct < 30) return { bar: "danger", text: "text-danger" } as const;
  if (pct < 70) return { bar: "accent", text: "text-accent" } as const;
  return { bar: "success", text: "text-success" } as const;
}

const SheetRow = memo(function SheetRow({
  slug,
  title,
  solved,
  total,
  progress,
}: SheetProgressItem) {
  const t = tone(progress);
  return (
    <Link
      href={`/sheets/${slug}`}
      className="group grid grid-cols-[1fr_4rem_3rem] items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-b-0 hover:bg-fg/[0.025] sm:grid-cols-[1fr_7rem_4.5rem_3rem] sm:gap-4"
    >
      <span className="truncate text-sm font-medium text-fg transition-colors group-hover:text-accent-hover">
        {title}
      </span>
      <ProgressBar value={progress} color={t.bar} height={3} />
      <span className="hidden text-center font-mono text-[11px] tabular-nums text-fg-muted sm:block">
        {solved}/{total}
      </span>
      <span
        className={`text-right font-mono text-xs font-semibold tabular-nums ${t.text}`}
      >
        {progress}%
      </span>
    </Link>
  );
});

export default function SheetsProgressCard({
  sheets,
}: {
  sheets: SheetProgressItem[];
}) {
  return (
    <GlowCard hover={false} padding="none" className="overflow-hidden">
      <CardHeader
        title="Sheet progress"
        action={<CardHeaderLink href="/sheets">View all →</CardHeaderLink>}
      />
      {sheets.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-fg-muted">
          No sheets available yet.
        </p>
      ) : (
        <div>
          {sheets.map((sheet) => (
            <SheetRow key={sheet.id} {...sheet} />
          ))}
        </div>
      )}
    </GlowCard>
  );
}
