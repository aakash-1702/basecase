"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunOutput, SubmitOutput } from "./types";

export const VerdictChip = memo(function VerdictChip({
  output,
  className,
}: {
  output: RunOutput;
  className?: string;
}) {
  const ok = output.outputType === "success";
  return (
    <span
      className={cn(
        "inline-block rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase",
        ok
          ? "border-success/25 bg-success/10 text-success"
          : "border-danger/25 bg-danger/10 text-danger",
        className,
      )}
    >
      {ok ? "Accepted" : output.errorType || "Error"}
    </span>
  );
});

function SubmitResults({ output }: { output: SubmitOutput }) {
  return (
    <div>
      {output.compileError && (
        <div className="mb-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2.5">
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-danger">
            {output.compileError}
          </pre>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2.5">
        <span
          className={cn(
            "font-mono text-[13px] font-bold",
            output.accepted ? "text-success" : "text-danger",
          )}
        >
          {output.accepted ? "Accepted" : "Wrong Answer"}
        </span>
        <span className="font-mono text-[10px] text-fg-muted">
          {output.passed} / {output.total} passed
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {output.results.map((r, i) => (
          <li key={i}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  r.passed ? "bg-success" : "bg-danger",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[10px]",
                  r.passed ? "text-success" : "text-danger",
                )}
              >
                {r.isPublic ? `Test ${i + 1}` : "Hidden test"} —{" "}
                {r.passed ? "Accepted" : r.isPublic ? r.status : "Failed"}
              </span>
            </div>
            {!r.passed && r.isPublic && (
              <div className="mt-1 pl-3.5 font-mono text-[10px]">
                <p className="my-0.5 text-fg-muted">
                  Input: {r.displayInput || r.input || "—"}
                </p>
                <p className="my-0.5 text-fg-muted">
                  Expected: {r.displayOutput || r.expected || "—"}
                </p>
                <p className="my-0.5 text-danger">Got: {r.got || "—"}</p>
              </div>
            )}
            {!r.passed && !r.isPublic && (
              <p className="mt-1 pl-3.5 font-mono text-[10px] text-fg-muted">
                A hidden test case is failing. Check edge cases.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ResultsPanelProps {
  running: boolean;
  submitting: boolean;
  runOutput: RunOutput | null;
  submitOutput: SubmitOutput | null;
}

const ResultsPanel = memo(function ResultsPanel({
  running,
  submitting,
  runOutput,
  submitOutput,
}: ResultsPanelProps) {
  if (running || submitting) {
    return (
      <div className="flex items-center justify-center gap-1.5 py-6 font-mono text-[11px] text-fg-muted">
        <Loader2 size={13} className="animate-spin" />
        {submitting ? "Submitting…" : "Running…"}
      </div>
    );
  }

  if (submitOutput) return <SubmitResults output={submitOutput} />;

  if (runOutput) {
    return (
      <div>
        <VerdictChip output={runOutput} className="mb-2.5" />
        <pre
          className={cn(
            "whitespace-pre-wrap font-mono text-xs leading-relaxed",
            runOutput.outputType === "success" ? "text-success" : "text-danger",
          )}
        >
          {runOutput.stdout || "(no output)"}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-6 font-mono text-[11px] italic text-fg-dim">
      Run your code to see output here
    </div>
  );
});

export default ResultsPanel;
