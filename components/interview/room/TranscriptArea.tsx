"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type {
  Phase,
  HistoryTurn,
  TranscriptMessage,
} from "@/types/interview-room";

// New interface for InterviewRoom
interface NewTranscriptAreaProps {
  phase: Phase;
  currentMessage: string;
  liveTranscript: string;
  history: HistoryTurn[];
  errorMessage: string;
  canRetry: boolean;
  onRetry: () => void;
  needsManualPlay: boolean;
  onManualPlay: () => void;
}

// Legacy interface for ActiveRoom
interface LegacyTranscriptAreaProps {
  messages: TranscriptMessage[];
  isProcessing: boolean;
}

type TranscriptAreaProps = Partial<NewTranscriptAreaProps> &
  Partial<LegacyTranscriptAreaProps>;

const WAVE_BARS = Array.from({ length: 12 }, (_, i) => i);
const DOTS = [0, 1, 2];

/* ─── Memoised row components ─────────────────────────────── */

const RoleLabel = memo(function RoleLabel({ role }: { role: "ai" | "user" }) {
  const isAi = role === "ai";
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em]",
        isAi ? "text-accent" : "text-fg-muted",
      )}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", isAi ? "bg-accent" : "bg-fg-muted")} />
      {isAi ? "Interviewer" : "You"}
    </div>
  );
});

const TranscriptMessageItem = memo(function TranscriptMessageItem({
  message,
}: {
  message: TranscriptMessage;
}) {
  const isAi = message.role === "ai";
  return (
    <div className="animate-fade-in">
      <RoleLabel role={message.role} />
      <p
        className={cn(
          "whitespace-pre-wrap border-l-2 pl-3 text-sm leading-[1.75]",
          isAi ? "border-accent/30 text-fg" : "border-line-strong text-fg-secondary",
        )}
      >
        {message.text}
      </p>
    </div>
  );
});

const ThinkingIndicator = memo(function ThinkingIndicator() {
  return (
    <div className="animate-fade-in">
      <RoleLabel role="ai" />
      <div className="flex h-7 items-center gap-1.5 border-l-2 border-accent/30 pl-3">
        {DOTS.map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 animate-bounce rounded-full bg-accent/60"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
});

const HistoryTurnItem = memo(function HistoryTurnItem({ turn }: { turn: HistoryTurn }) {
  return (
    <div className="mb-7 opacity-40 transition-opacity duration-200 hover:opacity-70">
      <div className="line-clamp-2 font-mono text-xs text-fg-muted">
        <span className="mr-2 text-fg-dim">AI</span>
        {turn.aiMessage}
      </div>
      <div className="mt-1.5 line-clamp-1 font-mono text-[11px] text-fg-dim">↳ {turn.userAnswer}</div>
    </div>
  );
});

const Waveform = memo(function Waveform() {
  return (
    <div className="mt-4 flex h-5 items-end gap-[3px]" aria-hidden>
      {WAVE_BARS.map((i) => (
        <span
          key={i}
          className="h-full w-0.5 origin-bottom bg-accent/50"
          style={{ animation: "wavePulse 0.8s ease-in-out infinite", animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
});

/* ─── Main component ──────────────────────────────────────── */

export function TranscriptArea(props: TranscriptAreaProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Detect if using legacy mode
  const isLegacyMode = props.messages !== undefined;

  const messageCount = props.messages?.length ?? 0;
  const historyCount = props.history?.length ?? 0;
  const isProcessing = props.isProcessing ?? false;
  const currentMessage = props.currentMessage ?? "";

  // Auto-scroll: one rAF per new entry, no synchronous layout reads.
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "end", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [messageCount, historyCount, isProcessing, currentMessage]);

  // ==================== LEGACY MODE ====================
  if (isLegacyMode) {
    const { messages = [] } = props;

    return (
      <div className="interview-scrollbar flex-1 overflow-y-auto px-9 py-8">
        <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-dim">Transcript</p>

        {messages.length === 0 && !isProcessing && (
          <p className="pt-10 text-center font-mono text-sm italic text-fg-dim">
            Waiting for your interviewer...
          </p>
        )}

        <div className="space-y-6">
          {messages.map((msg) => (
            <TranscriptMessageItem key={msg.id} message={msg} />
          ))}
          {isProcessing && <ThinkingIndicator />}
        </div>

        {/* Sentinel + scroll padding */}
        <div ref={endRef} className="h-8" aria-hidden />
      </div>
    );
  }

  // ==================== NEW MODE ====================
  const {
    phase = "answering",
    liveTranscript = "",
    history = [],
    errorMessage = "",
    canRetry = false,
    onRetry,
    needsManualPlay = false,
    onManualPlay,
  } = props;

  const phaseIndicator =
    phase === "speaking"
      ? { text: "● speaking...", className: "text-accent" }
      : phase === "submitting"
        ? { text: "● processing...", className: "text-fg-muted" }
        : phase === "recording"
          ? { text: "● listening...", className: "text-accent/80" }
          : null;

  const messageOpacity = phase === "recording" ? 0.7 : phase === "submitting" ? 0.5 : 1;

  return (
    <div className="interview-scrollbar flex-1 overflow-y-auto p-8">
      {/* Current Message Section */}
      <div className="mb-6 animate-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-[0.15em] text-fg-dim">AI</span>
          {phaseIndicator && (
            <span className={cn("font-mono text-[9px]", phaseIndicator.className)}>
              {phaseIndicator.text}
            </span>
          )}
        </div>

        {phase === "loading" ? (
          <div className="space-y-3" aria-hidden>
            <div className="skeleton h-[22px] w-4/5" />
            <div className="skeleton h-[22px] w-3/5" />
          </div>
        ) : (
          <p
            className="max-w-[680px] font-display text-[22px] leading-[1.65] text-fg transition-opacity duration-200"
            style={{ opacity: messageOpacity }}
          >
            {currentMessage}
          </p>
        )}

        {needsManualPlay && (
          <button type="button" onClick={onManualPlay} className="btn btn-ghost btn-sm mt-3 -ml-3 font-mono text-[11px] text-accent">
            ▶ Play response
          </button>
        )}
      </div>

      {/* Live Answer Block */}
      <div className="mb-8 min-h-[100px] border-l-2 border-line pl-5">
        {phase === "answering" && !liveTranscript && (
          <p className="font-mono text-[13px] italic text-fg-dim">Click Speak when you&apos;re ready...</p>
        )}

        {phase === "recording" && (
          <>
            <p className="font-mono text-sm leading-[1.7] text-fg">{liveTranscript || "Listening..."}</p>
            <Waveform />
          </>
        )}

        {phase === "submitting" && liveTranscript && (
          <>
            <p className="font-mono text-sm leading-[1.7] text-fg opacity-50">{liveTranscript}</p>
            <div className="skeleton mt-3 h-3.5 w-[120px]" aria-hidden />
            <span className="mt-2 block font-mono text-[9px] text-fg-dim">processing...</span>
          </>
        )}
      </div>

      {/* Error Block */}
      {phase === "error" && errorMessage && (
        <div className="mb-6 animate-fade-up border-l-2 border-danger/40 pl-5">
          <span className="mb-2 block font-mono text-[9px] tracking-[0.1em] text-danger/70">
            unable to continue
          </span>
          <p className="font-mono text-[13px] leading-relaxed text-fg">{errorMessage}</p>
          {canRetry && (
            <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-3 font-mono">
              retry
            </button>
          )}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-8 border-t border-line pt-6">
          {history.map((turn, index) => (
            <HistoryTurnItem key={index} turn={turn} />
          ))}
        </div>
      )}

      <div ref={endRef} aria-hidden />
    </div>
  );
}
