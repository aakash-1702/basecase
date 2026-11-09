"use client";

import { memo } from "react";
import { Code2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputFormatItem } from "./types";

const InputFormatStrip = memo(function InputFormatStrip({
  items,
}: {
  items: InputFormatItem[];
}) {
  if (!items.length) return null;
  return (
    <div className="card-base animate-fade-in px-[18px] py-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <Info size={14} className="text-fg-muted" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          Input format — read in this order
        </span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {items.map((item, i) => {
          const isArray = item.type.includes("[]");
          return (
            <li key={i} className="flex items-center gap-2">
              <span className="min-w-4 text-right font-mono text-[11px] text-fg-muted/60">
                {i + 1}
              </span>
              <span
                className={cn(
                  "min-w-14 rounded px-2 py-0.5 text-center font-mono text-[9px] font-semibold whitespace-nowrap",
                  isArray ? "bg-success/12 text-success" : "bg-info/12 text-info",
                )}
              >
                {item.type} {item.name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
});

interface ProblemDescriptionProps {
  description?: string | null;
  companies: string[];
  examples: string[];
  inputFormatItems: InputFormatItem[];
  inputFormat?: string;
}

/** Left pane of the workspace. Pure: only re-renders when the problem changes. */
const ProblemDescription = memo(function ProblemDescription({
  description,
  companies,
  examples,
  inputFormatItems,
  inputFormat,
}: ProblemDescriptionProps) {
  return (
    <div className="h-full min-h-0 overflow-y-auto border-r border-line p-7">
      {companies.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {companies.map((c) => (
            <span
              key={c}
              className="chip chip-neutral font-mono text-[9px] uppercase tracking-[0.04em]"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <p className="mb-8 whitespace-pre-line text-[14.5px] leading-[1.85] text-fg-secondary">
        {description}
      </p>

      {examples.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Code2 size={14} className="text-accent/80" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Examples
            </span>
          </div>
          {examples.map((ex, i) => (
            <div
              key={i}
              className="mb-3 rounded-xl border border-line bg-surface-2 px-[18px] py-4 transition-colors hover:border-accent/20"
            >
              <p className="mb-2.5 font-mono text-[9px] tracking-[0.08em] text-fg-muted">
                EXAMPLE {i + 1}
              </p>
              <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.7] text-fg-secondary">
                {ex}
              </pre>
            </div>
          ))}
        </div>
      )}

      {inputFormatItems.length > 0 && (
        <div className="mt-5">
          <InputFormatStrip items={inputFormatItems} />
        </div>
      )}

      {inputFormat && (
        <div className={inputFormatItems.length > 0 ? "mt-3" : "mt-5"}>
          <span className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
            Input Format
          </span>
          <div className="whitespace-pre-line rounded-md border border-line border-l-2 border-l-accent/30 bg-accent/[0.03] px-3.5 py-2.5 font-mono text-xs leading-[1.7] text-fg-secondary">
            {inputFormat}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProblemDescription;
