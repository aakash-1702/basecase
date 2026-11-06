"use client";

import { memo } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import GlowCard from "@/components/shared/GlowCard";
import type { SheetListItem } from "./types";

function SheetCard({ sheet }: { sheet: SheetListItem }) {
  return (
    <GlowCard href={`/sheets/${sheet.slug}`} className="group flex h-full flex-col">
      <h3 className="line-clamp-2 font-display text-lg tracking-tight text-fg transition-colors group-hover:text-accent-hover">
        {sheet.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">
        {sheet.description ||
          "A curated set of problems to sharpen your pattern recognition."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {sheet.difficulty ? (
          <DifficultyBadge difficulty={sheet.difficulty} />
        ) : (
          <span className="chip chip-neutral">Mixed</span>
        )}
        {typeof sheet.problemCount === "number" && (
          <span className="chip chip-neutral">
            <BookOpen className="h-3 w-3" />
            {sheet.problemCount} problems
          </span>
        )}
      </div>

      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent transition-colors group-hover:text-accent-hover">
        View sheet
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </GlowCard>
  );
}

export default memo(SheetCard);

export function SheetCardSkeleton() {
  return (
    <div className="card-base card-hover card-glow-top flex flex-col p-6" aria-hidden>
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton mt-3 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-5/6" />
      <div className="skeleton mt-5 h-5 w-16 rounded-full" />
      <div className="skeleton mt-6 h-4 w-24" />
    </div>
  );
}
