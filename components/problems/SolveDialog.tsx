"use client";

import { useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { autoConfidence } from "./problem-utils";
import type { SolveDialogData } from "./types";

const MOTIVATION = [
  "Every problem solved is a step closer to mastery.",
  "Your future self will thank you for this grind.",
  "Consistency beats talent. Keep showing up.",
  "One more problem down. Unstoppable.",
  "You're building something incredible — one solve at a time.",
  "The best coders aren't born, they're forged.",
];

const SUCCESS = "border-success/30 bg-success/10 text-success";
const WARNING = "border-warning/30 bg-warning/10 text-warning";
const DANGER = "border-danger/30 bg-danger/10 text-danger";
const ACCENT = "border-accent/30 bg-accent-soft text-accent";

const DIFF_OPTS: ReadonlyArray<{ value: string; label: string; activeClass: string }> = [
  { value: "TOO_EASY", label: "Too Easy", activeClass: SUCCESS },
  { value: "EASY", label: "Easy", activeClass: SUCCESS },
  { value: "JUST_RIGHT", label: "Just Right", activeClass: ACCENT },
  { value: "HARD", label: "Hard", activeClass: DANGER },
  { value: "VERY_HARD", label: "Very Hard", activeClass: DANGER },
];

const CONF_OPTS: ReadonlyArray<{ value: string; label: string; activeClass: string }> = [
  { value: "LOW", label: "Low", activeClass: DANGER },
  { value: "MEDIUM", label: "Medium", activeClass: WARNING },
  { value: "HIGH", label: "High", activeClass: SUCCESS },
];

const PILL =
  "rounded-md border px-3.5 py-[7px] font-mono text-[9px] font-bold uppercase tracking-[0.07em] transition-colors active:scale-[0.96]";
const PILL_IDLE =
  "border-line bg-fg/[0.02] text-fg-muted hover:border-line-strong hover:bg-fg/[0.04] hover:text-fg-secondary";

interface SolveDialogProps {
  problemTitle: string;
  passed: number;
  total: number;
  onClose: () => void;
  onSave: (data: SolveDialogData) => Promise<void>;
}

export default function SolveDialog({
  problemTitle,
  passed,
  total,
  onClose,
  onSave,
}: SolveDialogProps) {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [insight, setInsight] = useState("");
  const [reviewEnabled, setReviewEnabled] = useState(true);
  const [flashKey, setFlashKey] = useState(0);
  const [phase, setPhase] = useState<"form" | "saving" | "saved">("form");
  const [motivation, setMotivation] = useState("");
  const userToggledReview = useRef(false);

  const selectDifficulty = (value: string) => {
    if (value === difficulty) return;
    const auto = autoConfidence(value);
    setDifficulty(value);
    setConfidence(auto);
    if (!userToggledReview.current) setReviewEnabled(auto !== "HIGH");
    setFlashKey((k) => k + 1);
  };

  const selectConfidence = (value: string) => {
    setConfidence(value);
    if (!userToggledReview.current) setReviewEnabled(value !== "HIGH");
  };

  const toggleReview = (checked: boolean) => {
    userToggledReview.current = true;
    setReviewEnabled(checked);
  };

  const handleSave = async () => {
    if (!difficulty || !confidence) return;
    setMotivation(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    setPhase("saving");
    try {
      await onSave({ difficulty, confidence, insight, enableReview: reviewEnabled });
      setPhase("saved");
      setTimeout(onClose, 2000);
    } catch {
      setPhase("form");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solve-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card-base relative max-h-[90vh] w-[520px] max-w-[92vw] overflow-y-auto border-accent/20 bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[15%] top-0 h-px bg-linear-to-r from-transparent via-success/50 to-transparent"
        />

        {phase === "saving" && (
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-20">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="font-mono text-xs tracking-[0.04em] text-fg-muted">
              Saving progress…
            </p>
          </div>
        )}

        {phase === "saved" && (
          <div className="flex flex-col items-center justify-center gap-2.5 px-8 py-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-full border border-success/30 bg-success/[0.08]">
              <CheckCircle size={28} className="text-success" />
            </div>
            <p className="font-display text-xl tracking-tight text-fg">
              Enjoy solving! 🚀
            </p>
            <p className="max-w-[340px] text-center text-[13px] leading-relaxed text-fg-muted">
              {motivation}
            </p>
          </div>
        )}

        {phase === "form" && (
          <>
            {/* Success header */}
            <div className="border-b border-line px-8 pb-6 pt-8 text-center">
              <div className="mx-auto mb-5 grid h-[72px] w-[72px] place-items-center rounded-full border border-success/20 bg-success/[0.04]">
                <div className="grid h-[54px] w-[54px] place-items-center rounded-full border border-success/35 bg-success/[0.08]">
                  <CheckCircle size={26} className="text-success" />
                </div>
              </div>
              <p
                id="solve-dialog-title"
                className="mb-1.5 font-display text-[22px] tracking-tight text-fg"
              >
                All Tests Passed!
              </p>
              <p className="mb-2.5 font-mono text-[11px] tracking-[0.04em] text-fg-muted">
                {problemTitle}
              </p>
              <span className="chip border-success/20 bg-success/[0.08] font-mono text-[11px] text-success">
                {total > 0 ? `${passed} / ${total} test cases passed` : "All tests passed"}
              </span>
            </div>

            {/* Form body */}
            <div className="flex flex-col gap-6 px-8 py-6">
              <fieldset>
                <legend className="mb-2.5 text-[13px] font-medium text-fg-secondary">
                  How hard did this feel?
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {DIFF_OPTS.map((o) => {
                    const active = difficulty === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectDifficulty(o.value)}
                        className={cn(PILL, active ? o.activeClass : PILL_IDLE)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="h-px bg-line" />

              <fieldset>
                <legend className="mb-2.5 text-[13px] font-medium text-fg-secondary">
                  Your confidence level?
                </legend>
                <div key={flashKey} className="flex gap-1.5 animate-in fade-in-50 duration-300">
                  {CONF_OPTS.map((o) => {
                    const active = confidence === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectConfidence(o.value)}
                        className={cn(PILL, active ? o.activeClass : PILL_IDLE)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="h-px bg-line" />

              <div>
                <label
                  htmlFor="solve-insight"
                  className="mb-2.5 block text-[13px] font-medium text-fg-secondary"
                >
                  Key insight? (optional)
                </label>
                <textarea
                  id="solve-insight"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  maxLength={280}
                  placeholder="What was the key idea? What pattern did you recognize?"
                  className="input-base h-auto max-h-40 min-h-20 resize-y rounded-lg bg-fg/[0.02] px-3.5 py-3 text-[13px] leading-relaxed"
                />
                <p className="mt-1 text-right font-mono text-[9px] text-fg-dim">
                  {insight.length}/280
                </p>
              </div>

              <div className="h-px bg-line" />

              <div className="flex items-center justify-between rounded-[10px] border border-line bg-fg/[0.02] px-4 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-fg">
                    Remind me to review this
                  </span>
                  <span className="font-mono text-[10px] text-fg-muted">
                    We’ll schedule a review based on your confidence
                  </span>
                </div>
                <Switch
                  checked={reviewEnabled}
                  onCheckedChange={toggleReview}
                  aria-label="Remind me to review this"
                />
              </div>
            </div>

            <div className="h-px bg-line" />

            {/* Actions */}
            <div className="flex items-center justify-between px-8 pb-7 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm font-mono text-[9px] font-semibold uppercase tracking-[0.06em]"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={!difficulty}
                onClick={handleSave}
                className="btn btn-primary font-mono text-[10px] font-bold uppercase tracking-[0.07em]"
              >
                Save &amp; Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
