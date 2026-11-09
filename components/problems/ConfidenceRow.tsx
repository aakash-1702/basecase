"use client";

import { memo } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConfidenceV2 } from "./types";

const LEVELS: ReadonlyArray<{
  value: ConfidenceV2;
  label: string;
  activeClass: string;
}> = [
  {
    value: "LOW",
    label: "Low",
    activeClass: "border-danger/25 bg-danger/10 text-danger",
  },
  {
    value: "MEDIUM",
    label: "Med",
    activeClass: "border-warning/25 bg-warning/10 text-warning",
  },
  {
    value: "HIGH",
    label: "High",
    activeClass: "border-success/25 bg-success/10 text-success",
  },
];

interface ConfidenceRowProps {
  value: ConfidenceV2 | null;
  solved: boolean;
  disabled: boolean;
  onChange: (level: ConfidenceV2) => void;
}

const ConfidenceRow = memo(function ConfidenceRow({
  value,
  solved,
  disabled,
  onChange,
}: ConfidenceRowProps) {
  return (
    <div className="card-base animate-fade-in flex items-center gap-3.5 px-5 py-3.5">
      <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-fg-muted">
        Confidence
      </span>
      {LEVELS.map((level) => {
        const active = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(level.value)}
            className={cn(
              "rounded-lg border px-4 py-1.5 font-mono text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? level.activeClass
                : "border-line text-fg-muted hover:border-line-strong hover:text-fg-secondary",
            )}
          >
            {level.label}
          </button>
        );
      })}
      {solved && (
        <div className="ml-auto flex items-center gap-1.5 font-mono text-[11px] font-semibold text-success animate-in fade-in zoom-in-75 duration-300">
          <CheckCircle size={14} />
          <span>Solved</span>
        </div>
      )}
    </div>
  );
});

export default ConfidenceRow;
