"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TranscriptEntry {
  question: string;
  answer: string;
  score: number;
}

interface TranscriptDrawerProps {
  entries: TranscriptEntry[];
}

export function TranscriptDrawer({ entries }: TranscriptDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreColor = (s: number) =>
    s >= 8 ? "var(--emerald)" : s >= 6 ? "var(--amber)" : "var(--rose)";

  return (
    <>
      {/* Handle Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full border-t transition-colors hover:bg-white/5"
        style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", padding: "12px 24px" }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
            Transcript · {entries.length} exchanges
          </div>
          <div style={{ color: "var(--text-muted)" }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="border-t interview-scrollbar"
          style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", maxHeight: "40vh", overflowY: "auto" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            {entries.map((entry, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-sm font-medium" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
                  Q{idx + 1} {entry.question}
                </div>
                <div className="text-sm italic pl-4" style={{ fontFamily: "var(--font-dm-mono)", color: "#888" }}>
                  ↳ &ldquo;{entry.answer.substring(0, 120)}...&rdquo;
                </div>
                <div className="flex items-center gap-3 pl-4">
                  <span className="text-xs" style={{ fontFamily: "var(--font-dm-mono)", color: scoreColor(entry.score) }}>
                    Score: {entry.score}/10
                  </span>
                  <div className="flex-1 h-1 bg-[var(--text-dim)] rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full rounded-full" style={{ width: `${entry.score * 10}%`, background: scoreColor(entry.score) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
