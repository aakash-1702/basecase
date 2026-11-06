"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { BookOpen, CalendarClock, Cpu, Mic, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING_SNAPPY } from "@/components/motion/presets";
import { SHOWCASE_SCENES, type ShowcaseLine } from "./showcaseScenes";

const ICONS = { sheets: BookOpen, judge0: Cpu, voice: Mic, sm2: CalendarClock, planly: Route } as const;

const TONE: Record<NonNullable<ShowcaseLine["tone"]>, string> = {
  cmd: "text-fg",
  code: "text-fg-secondary",
  kw: "syn-keyword",
  ok: "text-success",
  warn: "text-warning",
  dim: "syn-comment",
  ai: "text-accent",
  you: "text-fg",
  accent: "text-accent",
};

const CHAR_MS = 22; // typing speed
const HOLD_MS = 2600; // pause on a finished scene before advancing

/** Total play time of a scene, used for the tab progress bar. */
function sceneDuration(lines: ShowcaseLine[]) {
  return (
    lines.reduce((t, l) => t + (l.wait ?? 60) + (l.typed ? l.text.length * CHAR_MS : 0), 0) +
    HOLD_MS
  );
}

/**
 * Drives one scene: returns how many lines are fully visible and how many
 * characters of the current line have been typed. One setTimeout chain, no
 * intervals, cleaned up on scene change / unmount.
 */
function useTypewriter(lines: ShowcaseLine[], instant: boolean, onDone: () => void) {
  // <SceneBody> is keyed per scene, so the initial state is per scene too
  const [cursor, setCursor] = useState(() =>
    instant ? { line: lines.length, chars: 0, done: true } : { line: 0, chars: 0, done: false },
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (instant) {
      const t = setTimeout(() => onDoneRef.current(), HOLD_MS);
      return () => clearTimeout(t);
    }

    let line = 0;
    let chars = 0;
    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      timer.current = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const step = () => {
      if (line >= lines.length) {
        setCursor({ line, chars: 0, done: true });
        schedule(() => onDoneRef.current(), HOLD_MS);
        return;
      }
      const l = lines[line];
      if (!l.typed) {
        line += 1;
        setCursor({ line, chars: 0, done: false });
        schedule(step, lines[line]?.wait ?? 60);
        return;
      }
      if (chars < l.text.length) {
        chars += 1;
        setCursor({ line, chars, done: false });
        schedule(step, CHAR_MS);
      } else {
        line += 1;
        chars = 0;
        setCursor({ line, chars: 0, done: false });
        schedule(step, lines[line]?.wait ?? 60);
      }
    };

    schedule(step, lines[0]?.wait ?? 200);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lines, instant]);

  return cursor;
}

function SceneBody({
  lines,
  instant,
  onDone,
  onTyped,
}: {
  lines: ShowcaseLine[];
  instant: boolean;
  onDone: () => void;
  onTyped: () => void;
}) {
  const { line, chars, done } = useTypewriter(lines, instant, onDone);
  const onTypedRef = useRef(onTyped);
  useEffect(() => {
    onTypedRef.current = onTyped;
  }, [onTyped]);
  useEffect(() => {
    if (done) onTypedRef.current();
  }, [done]);
  const visible = lines.slice(0, Math.min(line + 1, lines.length));

  return (
    <pre className="relative h-full overflow-hidden whitespace-pre-wrap break-words p-5 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]">
      {visible.map((l, i) => {
        const isCurrent = i === line && !done;
        const text = isCurrent && l.typed ? l.text.slice(0, chars) : l.text;
        if (i > line) return null;
        return (
          <m.div
            key={i}
            initial={l.typed ? false : { opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn("min-h-[1.75em]", TONE[l.tone ?? "code"])}
          >
            {l.prefix && <span className="select-none text-fg-muted">{l.prefix}</span>}
            {text}
            {isCurrent && l.typed && (
              <span className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[2px] animate-pulse bg-accent" />
            )}
          </m.div>
        );
      })}
    </pre>
  );
}

export default function FeatureShowcase({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [held, setHeld] = useState(false); // typing finished, hold elapsed
  const reduced = useReducedMotion() ?? false;
  const scene = SHOWCASE_SCENES[index];
  const duration = useMemo(() => sceneDuration(scene.lines), [scene]);

  const go = useCallback((i: number) => {
    setCompleted(false);
    setHeld(false);
    setIndex(((i % SHOWCASE_SCENES.length) + SHOWCASE_SCENES.length) % SHOWCASE_SCENES.length);
  }, []);

  const handleTyped = useCallback(() => setCompleted(true), []);
  const handleDone = useCallback(() => setHeld(true), []);

  // advance once the hold has elapsed and the pointer isn't over the demo
  useEffect(() => {
    if (!held || paused) return;
    const t = setTimeout(() => {
      setHeld(false);
      go(index + 1);
    }, 120);
    return () => clearTimeout(t);
  }, [held, paused, index, go]);

  return (
    <div
      className={cn("grid gap-3 lg:grid-cols-[200px_1fr]", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* tab rail */}
      <div
        role="tablist"
        aria-label="Product features"
        className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {SHOWCASE_SCENES.map((s, i) => {
          const Icon = ICONS[s.id as keyof typeof ICONS] ?? Cpu;
          const active = i === index;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => go(i)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-accent/40 bg-accent-soft text-fg"
                  : "border-line bg-surface/60 text-fg-secondary hover:border-line-strong hover:text-fg",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-fg-muted")} />
                {s.label}
              </span>
              {active && (
                <m.span
                  key={`${s.id}-${duration}`}
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* window */}
      <div className="relative">
        <m.div
          layout
          transition={SPRING_SNAPPY}
          className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-soft"
        >
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={scene.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                className="font-mono text-[11px] text-fg-muted"
              >
                {scene.file}
              </m.span>
            </AnimatePresence>
            <span className="chip chip-neutral">{index + 1}/{SHOWCASE_SCENES.length}</span>
          </div>

          <div className="relative h-[300px] sm:h-[320px]">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={scene.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="absolute inset-0"
              >
                <SceneBody
                  lines={scene.lines}
                  instant={reduced}
                  onDone={handleDone}
                  onTyped={handleTyped}
                />
              </m.div>
            </AnimatePresence>

            {scene.id === "voice" && (
              <div className="pointer-events-none absolute bottom-4 left-5 flex h-5 items-end gap-[3px]" aria-hidden>
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[3px] origin-bottom rounded-full bg-accent"
                    style={{
                      height: "100%",
                      animation: `wavePulse ${0.9 + (i % 5) * 0.13}s ease-in-out ${i * 0.06}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[11px] text-fg-muted">
            <span>{scene.status}</span>
            <AnimatePresence>
              {completed && (
                <m.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING_SNAPPY}
                  className="chip chip-accent"
                >
                  {scene.badge}
                </m.span>
              )}
            </AnimatePresence>
          </div>
        </m.div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={scene.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="mt-3 px-1"
          >
            <p className="text-sm font-semibold text-fg">{scene.title}</p>
            <p className="text-sm text-fg-secondary">{scene.blurb}</p>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
