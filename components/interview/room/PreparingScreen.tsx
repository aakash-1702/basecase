"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { AlertCircle, Check, Lightbulb, LogOut, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING_SNAPPY } from "@/components/motion/presets";
import type { PreparingStatus } from "@/types/interview-room";

/* ────────────────────────────────────────────────────────────────────────────
   The join request (`POST /join-interview`) does, in order: auth → load the
   interview → build a question plan with the LLM → write the session →
   synthesise the greeting (TTS). The feed below mirrors those stages so the
   wait reads as real progress. Stages advance on a timer until the request
   resolves; the moment it does, the remaining stages complete in a burst.
   ──────────────────────────────────────────────────────────────────────────── */

interface Stage {
  id: string;
  label: string;
  detail: string;
  /** typical duration before the next stage starts (ms) */
  ms: number;
}

const STAGES: Stage[] = [
  { id: "auth", label: "Verifying session", detail: "GET /api/auth/get-session", ms: 500 },
  { id: "load", label: "Loading interview", detail: "interview · status notStarted", ms: 650 },
  { id: "plan", label: "Building the question plan", detail: "LLM · role-calibrated set", ms: 1600 },
  { id: "brief", label: "Briefing the interviewer", detail: "persona · follow-up policy · scoring rubric", ms: 1400 },
  { id: "tts", label: "Synthesising the greeting", detail: "TTS · en-IN · bulbul:v3", ms: 1300 },
  { id: "room", label: "Opening the room", detail: "websocket · mic permissions", ms: 600 },
];

const INSTRUCTIONS = [
  { icon: Mic, text: "Mic only activates when you click", bold: "Start speaking" },
  { icon: Square, text: "Click", bold: "Stop speaking", suffix: "to end your turn" },
  { icon: Lightbulb, text: "Speak clearly — there's no rush" },
  { icon: LogOut, text: "End the session any time from the top bar" },
];

interface PreparingScreenProps {
  status: PreparingStatus;
  onReady: () => void;
  onRetry: () => void;
  errorMessage: string;
  config?: { company: string; mode: string; difficulty: string; questions?: number };
}

type LogLine = { id: number; t: number; text: string; tone: "muted" | "ok" | "accent" };

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}
function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}.${pad(Math.floor((ms % 1000) / 100), 1)}`;
}

export function PreparingScreen({ status, onReady, onRetry, errorMessage, config }: PreparingScreenProps) {
  /** index of the stage currently "in progress"; stages before it are done */
  const [active, setActive] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lines, setLines] = useState<LogLine[]>([]);
  const startRef = useRef<number>(0);
  const lineId = useRef(0);

  const pushLine = (text: string, tone: LogLine["tone"] = "muted") =>
    setLines((prev) => [...prev.slice(-6), { id: ++lineId.current, t: Date.now() - startRef.current, text, tone }]);

  /* elapsed clock (only while loading) */
  useEffect(() => {
    if (status === "error") return;
    startRef.current = startRef.current || Date.now();
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [status]);

  /* advance stages on their typical timings while the request is pending;
     never pass the last stage until the backend actually answers */
  useEffect(() => {
    if (status !== "loading") return;
    let cancelled = false;
    let i = 0;
    setActive(0);
    setFinished(false);
    setLines([]);
    pushLine(`POST /api/interview/join-interview`, "accent");

    const step = () => {
      if (cancelled) return;
      const stage = STAGES[i];
      pushLine(`${stage.label.toLowerCase()} … ok`, "ok");
      if (i < STAGES.length - 2) {
        i += 1;
        setActive(i);
        timer = setTimeout(step, STAGES[i].ms);
      } else {
        // hold on the penultimate stage; the "room" stage completes on success
        i = STAGES.length - 2;
        setActive(i);
      }
    };
    let timer = setTimeout(step, STAGES[0].ms);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /* backend answered: burst through whatever is left, then hand over */
  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    const run = async () => {
      for (let i = active; i < STAGES.length; i++) {
        if (cancelled) return;
        setActive(i);
        pushLine(`${STAGES[i].label.toLowerCase()} … ok`, "ok");
        await new Promise((r) => setTimeout(r, 180));
      }
      if (cancelled) return;
      setFinished(true);
      pushLine("room ready · 200 OK", "accent");
      setTimeout(() => !cancelled && onReady(), 900);
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const progress = useMemo(() => {
    if (finished) return 1;
    return Math.min(0.92, (active + 0.35) / STAGES.length);
  }, [active, finished]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-up space-y-8 text-center">
          <div className="flex justify-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-danger/20 bg-danger/10 text-danger">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <div>
            <p className="mb-2 font-display text-2xl text-fg">Something went wrong</p>
            <p className="text-sm text-fg-muted">{errorMessage}</p>
          </div>
          <button type="button" onClick={onRetry} className="btn btn-primary">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.25fr_1fr]"
      >
        {/* ── left: live status feed ─────────────────────────────────── */}
        <section className="card-base overflow-hidden" aria-live="polite" aria-busy={!finished}>
          <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {!finished && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                )}
                <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", finished ? "bg-success" : "bg-accent")} />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-fg-muted">
                {finished ? "Room ready" : "Preparing your room"}
              </p>
            </div>
            <p className="font-mono text-xs tabular-nums text-fg-muted">{fmtElapsed(elapsed)}</p>
          </header>

          <div className="px-5 pt-5">
            <h1 className="font-display text-3xl leading-tight text-fg sm:text-4xl">
              {config ? (
                <>
                  {config.company} <span className="text-fg-muted">·</span> {config.mode}
                </>
              ) : (
                "Setting things up"
              )}
            </h1>
            {config && (
              <p className="mt-1 font-mono text-xs text-fg-muted">
                {config.difficulty} level
                {config.questions ? ` · ${config.questions} questions` : ""}
              </p>
            )}

            {/* progress */}
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-fg/[0.08]">
              <m.div
                className={cn("h-full rounded-full", finished ? "bg-success" : "bg-accent")}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                style={{ transformOrigin: "left" }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
              />
            </div>
          </div>

          {/* stages */}
          <ol className="mt-4 divide-y divide-line border-t border-line">
            {STAGES.map((stage, i) => {
              const state: "done" | "active" | "pending" =
                finished || i < active ? "done" : i === active ? "active" : "pending";
              return (
                <li
                  key={stage.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-2.5 transition-colors",
                    state === "active" && "bg-accent-soft/60",
                  )}
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {state === "done" ? (
                        <m.span
                          key="done"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={SPRING_SNAPPY}
                          className="grid h-5 w-5 place-items-center rounded-full bg-success text-accent-ink"
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </m.span>
                      ) : state === "active" ? (
                        <m.span
                          key="active"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent"
                        />
                      ) : (
                        <m.span
                          key="pending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-1.5 w-1.5 rounded-full bg-fg/20"
                        />
                      )}
                    </AnimatePresence>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        state === "pending" ? "text-fg-muted" : "text-fg",
                      )}
                    >
                      {stage.label}
                      {state === "active" && <Dots />}
                    </p>
                    <p className="truncate font-mono text-[11px] text-fg-muted">{stage.detail}</p>
                  </div>
                  <span className="font-mono text-[11px] text-fg-dim">{pad(i + 1)}</span>
                </li>
              );
            })}
          </ol>

          {/* log */}
          <div className="border-t border-line bg-surface px-5 py-3 font-mono text-[11px] leading-5">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <m.p
                  key={l.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className={cn(
                    "flex gap-3",
                    l.tone === "ok" ? "text-success" : l.tone === "accent" ? "text-accent" : "text-fg-muted",
                  )}
                >
                  <span className="text-fg-dim">{fmtElapsed(l.t)}</span>
                  <span className="truncate">{l.text}</span>
                </m.p>
              ))}
            </AnimatePresence>
            {!finished && (
              <p className="flex gap-3 text-fg-muted">
                <span className="text-fg-dim">{fmtElapsed(elapsed)}</span>
                <span>
                  waiting for server
                  <Dots />
                </span>
              </p>
            )}
          </div>
        </section>

        {/* ── right: what to expect ──────────────────────────────────── */}
        <aside className="flex flex-col gap-3">
          <div className="card-base p-5">
            <p className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-accent" /> Before you start
            </p>
            <ul className="mt-4 space-y-3">
              {INSTRUCTIONS.map((instr, idx) => (
                <m.li
                  key={instr.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.07, duration: 0.35, ease: EASE_OUT }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                    <instr.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-fg-secondary">
                    {instr.text}{" "}
                    {instr.bold && <strong className="font-semibold text-fg">{instr.bold}</strong>}
                    {"suffix" in instr && instr.suffix ? ` ${instr.suffix}` : ""}
                  </span>
                </m.li>
              ))}
            </ul>
          </div>

          <div className="card-base flex items-center gap-4 p-5">
            <Waveform active={!finished} />
            <p className="text-sm text-fg-secondary">
              {finished ? (
                <>
                  Your interviewer is ready. <span className="text-fg">Entering the room…</span>
                </>
              ) : (
                <>
                  The interviewer is reading your brief. <span className="text-fg">Take a breath.</span>
                </>
              )}
            </p>
          </div>
        </aside>
      </m.div>
    </div>
  );
}

function Dots() {
  return (
    <span className="ml-0.5 inline-flex w-4 justify-start" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-[3px] w-[3px] rounded-full bg-current"
          style={{ animation: `stepCycle 1.2s ease-in-out ${i * 0.2}s infinite`, marginLeft: i ? 2 : 0 }}
        />
      ))}
    </span>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <span className="flex h-7 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-bottom rounded-full", active ? "bg-accent" : "bg-success")}
          style={{
            height: "100%",
            animation: active ? `wavePulse ${0.9 + (i % 4) * 0.15}s ease-in-out ${i * 0.07}s infinite` : "none",
            transform: active ? undefined : `scaleY(${0.3 + ((i * 7) % 5) * 0.12})`,
          }}
        />
      ))}
    </span>
  );
}
