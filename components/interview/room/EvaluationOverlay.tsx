"use client";

interface EvaluationOverlayProps {
  evaluation: string;
  score: number;
  followUp?: string;
  onNext: () => void;
}

export function EvaluationOverlay({ evaluation, score, followUp, onNext }: EvaluationOverlayProps) {
  const scoreColor = score >= 8 ? "var(--emerald)" : score >= 6 ? "var(--amber)" : "var(--rose)";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6"
      style={{ background: "rgba(8,8,8,0.95)", backdropFilter: "blur(8px)", animation: "fadeSlideIn 0.3s ease forwards" }}
    >
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
          Evaluation
        </div>

        {/* Feedback */}
        <div className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-mono)", color: "#ccc" }}>
          {evaluation}
        </div>

        {/* Score Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>Score</span>
            <span className="text-sm font-medium" style={{ fontFamily: "var(--font-dm-mono)", color: scoreColor }}>
              {score} / 10
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--text-dim)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${score * 10}%`, background: scoreColor, animation: "fillBar 0.8s ease forwards" }}
            />
          </div>
        </div>

        {/* Follow-up Question */}
        {followUp && (
          <div className="p-4 border-l-2" style={{ background: "var(--amber-dim)", borderColor: "var(--amber)", borderRadius: "4px" }}>
            <div className="text-xs mb-2" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
              ↳ Follow-up
            </div>
            <div className="text-sm italic" style={{ fontFamily: "var(--font-dm-mono)", color: "#777" }}>
              &ldquo;{followUp}&rdquo;
            </div>
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={onNext}
          className="w-full py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
          style={{ background: "var(--amber)", color: "#000", borderRadius: "4px", fontFamily: "var(--font-dm-mono)" }}
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}
