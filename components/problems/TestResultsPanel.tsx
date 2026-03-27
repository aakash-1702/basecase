"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import type { TestResult, ExecutionPhase } from "@/hooks/useCodeExecution";

interface TestResultsPanelProps {
  results: TestResult[];
  phase: ExecutionPhase;
  total: number;
  connectionError?: string | null;
}

export default function TestResultsPanel({
  results,
  phase,
  total,
  connectionError,
}: TestResultsPanelProps) {
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const passedCount = results.filter((r) => r?.passed).length;
  const isRunning = phase === "queued" || phase === "running";

  // Status bar text
  const getStatusText = () => {
    if (connectionError) return connectionError;
    if (phase === "idle") return "Run your code to see results";
    if (phase === "queued") return "Queued...";
    if (phase === "running") return "Running test cases...";
    if (phase === "done") {
      const allPassed = passedCount === total;
      return allPassed
        ? `All ${total} tests passed`
        : `${passedCount} / ${total} passed`;
    }
    return "";
  };

  const getStatusColor = () => {
    if (connectionError) return "text-red-400";
    if (phase === "done") {
      return passedCount === total ? "text-emerald-400" : "text-red-400";
    }
    return "text-gray-400";
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-black/20">
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {isRunning && <Loader2 size={12} className="animate-spin" />}
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            {getStatusText()}
          </span>
        </div>
        {phase === "done" && (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              passedCount === total
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {passedCount === total ? "Accepted" : "Wrong Answer"}
          </span>
        )}
      </div>

      {/* Test case list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {Array.from({ length: total || 0 }).map((_, index) => {
          const result = results[index];
          const isExpanded = expandedTests.has(index);
          const isWaiting = !result && phase !== "done";
          const isCurrentlyRunning =
            phase === "running" && !result && results.length === index;

          // Determine if this is a public test (has input/expected data)
          const isPublic = result
            ? result.input !== null || result.expected !== null
            : true;
          const canExpand = result && !result.passed && isPublic;

          return (
            <div
              key={index}
              className="rounded-md border border-white/5 bg-white/[0.02] overflow-hidden"
            >
              {/* Test row header */}
              <div
                className={`flex items-center gap-2 px-3 py-2 ${canExpand ? "cursor-pointer hover:bg-white/[0.03]" : ""}`}
                onClick={() => canExpand && toggleExpand(index)}
              >
                {/* Status indicator */}
                {isWaiting || isCurrentlyRunning ? (
                  isCurrentlyRunning ? (
                    <Loader2
                      size={12}
                      className="text-amber-400 animate-spin"
                    />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    </span>
                  )
                ) : result?.passed ? (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                )}

                {/* Test label */}
                <span
                  className={`text-[11px] ${
                    isWaiting
                      ? "text-gray-500"
                      : result?.passed
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {isPublic ? `Test ${index + 1}` : "Hidden test"}
                  <span className="text-gray-500 ml-2">
                    {isWaiting
                      ? isCurrentlyRunning
                        ? "running"
                        : "waiting"
                      : result?.status || ""}
                  </span>
                </span>

                {/* Expand icon for failed public tests */}
                {canExpand && (
                  <span className="ml-auto text-gray-500">
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </span>
                )}
              </div>

              {/* Expanded details for failed public tests */}
              {isExpanded && canExpand && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2 bg-black/20">
                  {result.input !== null && (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">
                        Input
                      </span>
                      <pre className="text-[11px] text-gray-300 bg-black/30 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap">
                        {result.input || "(empty)"}
                      </pre>
                    </div>
                  )}
                  {result.expected !== null && (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">
                        Expected Output
                      </span>
                      <pre className="text-[11px] text-emerald-400/80 bg-black/30 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap">
                        {result.expected || "(empty)"}
                      </pre>
                    </div>
                  )}
                  {result.got !== null && (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">
                        Your Output
                      </span>
                      <pre className="text-[11px] text-red-400/80 bg-black/30 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap">
                        {result.got || "(empty)"}
                      </pre>
                    </div>
                  )}
                  {result.error && (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-red-400 block mb-1">
                        Error
                      </span>
                      <pre className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap">
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden test hint */}
              {result && !result.passed && !isPublic && (
                <div className="px-3 pb-2 text-[10px] text-gray-500 italic">
                  A hidden test case is failing. Check edge cases.
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {phase === "idle" && total === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-[11px] italic py-8">
            Run your code to see output here
          </div>
        )}
      </div>
    </div>
  );
}
