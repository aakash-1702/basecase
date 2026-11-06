"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Upload, Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartInterviewModalProps {
  onClose: () => void;
}

type InterviewMode = "dsa" | "technical" | "hr";
type Difficulty = "entry" | "mid" | "senior" | "staff";

const modeMap: Record<InterviewMode, string> = {
  dsa: "DSA",
  technical: "Technical",
  hr: "HR",
};

const difficultyMap: Record<Difficulty, string> = {
  entry: "Entry",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
};

const MODES: InterviewMode[] = ["dsa", "technical", "hr"];
const DIFFICULTIES: Difficulty[] = ["entry", "mid", "senior", "staff"];
const companies = ["Google", "Amazon", "Microsoft", "Flipkart", "Uber", "Swiggy", "Netflix", "Generic"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.15em] text-fg-muted">
      {children}
    </span>
  );
}

function Toggle({
  active,
  onClick,
  variant = "solid",
  className,
  children,
}: {
  active: boolean;
  onClick: () => void;
  variant?: "solid" | "subtle";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-lg border px-3 py-2.5 font-mono text-xs transition-colors",
        active
          ? variant === "solid"
            ? "border-accent bg-accent font-semibold text-accent-ink"
            : "border-accent/40 bg-surface-3 text-fg"
          : "border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StartInterviewModal({ onClose }: StartInterviewModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [company, setCompany] = useState("Google");
  const [difficulty, setDifficulty] = useState<Difficulty>("senior");
  const [questionCount, setQuestionCount] = useState(8);
  const [resume, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/new-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: modeMap[mode],
          company,
          difficulty: difficultyMap[difficulty],
          noOfQuestions: questionCount,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Failed to create interview");
        setIsLoading(false);
        return;
      }
      const interviewId = json.data;
      const params = new URLSearchParams({
        interviewId,
        mode,
        company,
        difficulty,
        questions: questionCount.toString(),
      });
      router.push(`/interview/new-session?${params.toString()}`);
      // Don't call onClose() — keep modal open with loading state
      // until the route change unmounts the page naturally
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") setResume(file);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-scrim px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-interview-title"
        className="card-base interview-scrollbar relative max-h-[85vh] w-full max-w-[540px] animate-fade-up overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-7 py-5">
          <h2
            id="start-interview-title"
            className="font-display text-base tracking-tight text-fg"
          >
            Configure session
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost btn-sm h-8 w-8 px-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-7 px-7 py-6">
          {/* ① Interview Mode */}
          <div>
            <FieldLabel>Interview mode</FieldLabel>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <Toggle key={m} active={mode === m} onClick={() => setMode(m)} className="flex-1 py-3 uppercase">
                  {m}
                </Toggle>
              ))}
            </div>
          </div>

          {/* ② Company */}
          <div>
            <FieldLabel>Company</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {companies.map((c) => (
                <Toggle key={c} variant="subtle" active={company === c} onClick={() => setCompany(c)}>
                  {c}
                </Toggle>
              ))}
            </div>
          </div>

          {/* ③ Difficulty */}
          <div>
            <FieldLabel>Difficulty</FieldLabel>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <Toggle key={d} active={difficulty === d} onClick={() => setDifficulty(d)} className="flex-1 py-3">
                  {difficultyMap[d]}
                </Toggle>
              ))}
            </div>
          </div>

          {/* ④ Questions */}
          {mode !== "dsa" && (
            <div>
              <FieldLabel>Questions</FieldLabel>
              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  aria-label="Fewer questions"
                  onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                  className="btn btn-ghost btn-sm h-9 w-9 px-0 text-accent"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="w-14 text-center font-display text-3xl tabular-nums text-fg">
                  {questionCount.toString().padStart(2, "0")}
                </div>
                <button
                  type="button"
                  aria-label="More questions"
                  onClick={() => setQuestionCount(Math.min(10, questionCount + 1))}
                  className="btn btn-ghost btn-sm h-9 w-9 px-0 text-accent"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* ⑤ Resume Upload */}
          {mode === "technical" && (
            <div>
              <FieldLabel>Resume (optional)</FieldLabel>
              <label className="block cursor-pointer rounded-lg border-2 border-dashed border-line bg-surface-2 px-6 py-7 text-center transition-colors hover:border-line-strong">
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                <Upload className="mx-auto mb-2 h-5 w-5 text-fg-muted" />
                <span className={cn("font-mono text-xs", resume ? "text-accent" : "text-fg-muted")}>
                  {resume ? resume.name : "Drop resume PDF here"}
                </span>
              </label>
            </div>
          )}

          {/* DSA Warning */}
          {mode === "dsa" && (
            <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent-soft p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-fg-secondary">
                This mode requires a scratchpad or IDE. Keep one open before entering the room.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 border-t border-line bg-surface px-7 py-5">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className="btn btn-primary btn-lg w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating session...
              </>
            ) : (
              <>→ Start {modeMap[mode]} interview</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
