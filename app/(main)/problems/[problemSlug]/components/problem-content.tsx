"use client";

import React from "react";
import { Info } from "lucide-react";
import type { Problem } from "../types";

interface ProblemContentProps {
  problem: Problem;
}

export const ProblemContent = React.memo(function ProblemContent({
  problem,
}: ProblemContentProps) {
  return (
    <div className="lg:col-span-7 space-y-10">
      {/* Context banner */}
      <div
        className="flex items-start gap-4 px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(96,165,250,0.05)",
          border: "1px solid rgba(96,165,250,0.15)",
        }}
      >
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="sans text-sm text-blue-200/60 leading-relaxed">
          This is a{" "}
          <strong className="text-blue-300/80">progress tracking</strong> page.
          We don&apos;t host a code editor — solve on LeetCode, then come back
          here to log your result and use AI Mentor.
        </p>
      </div>

      {/* Description */}
      <section>
        <SectionHeader label="Problem" />
        <p className="sans text-[16px] leading-[1.9] text-zinc-300 whitespace-pre-line">
          {problem.description}
        </p>
      </section>

      {/* Examples */}
      <section>
        <SectionHeader label="Examples" />
        <div className="space-y-4">
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden og-hover"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="px-5 py-2.5 mono text-[9px] uppercase font-black text-zinc-600 tracking-widest"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                Case {i + 1}
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="mono text-[9px] font-black uppercase tracking-widest text-emerald-500">
                    Input
                  </span>
                  <div
                    className="p-3.5 rounded-xl bg-black/60 mono text-[13px] text-zinc-200"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {ex.input}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="mono text-[9px] font-black uppercase tracking-widest text-orange-500">
                    Output
                  </span>
                  <div
                    className="p-3.5 rounded-xl bg-black/60 mono text-[13px] text-zinc-200"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {ex.output}
                  </div>
                </div>
              </div>
              {ex.explanation && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="sans text-[13px] text-zinc-500 leading-relaxed">
                    <span className="text-zinc-600 font-semibold">Why: </span>
                    {ex.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Constraints */}
      <section>
        <SectionHeader label="Constraints" />
        <div
          className="rounded-2xl px-5 py-4 og-hover space-y-2.5"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {problem.constraints.split("\n").map((line, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: "#f97316" }}
              />
              <code className="mono text-[13px] text-zinc-300">{line}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

// ── Small helper, only used in this file ──
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: "#f97316" }}
      />
      <span className="mono text-[11px] font-black uppercase tracking-[0.3em] text-white">
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
    </div>
  );
}
