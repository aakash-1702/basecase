import {
  BookOpen,
  BrainCircuit,
  Code2,
  Flame,
  Repeat,
  Trophy,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Curated sheets, not random grinding",
    description:
      "Blind 75, NeetCode 150, Striver's SDE and more — ordered by concept, difficulty-ramped, built the way interviews actually test you.",
    span: "md:col-span-2",
    visual: "sheets",
  },
  {
    icon: Code2,
    title: "Code in the browser",
    description:
      "Monaco editor, multiple languages, custom test cases and sub-second verdicts.",
    span: "",
    visual: "editor",
  },
  {
    icon: BrainCircuit,
    title: "AI interviewer that pushes back",
    description:
      "Voice-first mock interviews. It asks follow-ups, probes edge cases and scores confidence, depth and communication.",
    span: "",
    visual: "ai",
  },
  {
    icon: Repeat,
    title: "Spaced repetition",
    description:
      "Mark your confidence after each solve; problems come back exactly when you're about to forget them.",
    span: "",
    visual: "revise",
  },
  {
    icon: Flame,
    title: "Streaks, badges & leaderboard",
    description:
      "Consistency beats intensity. Show up daily, climb the board, and keep the momentum visible.",
    span: "",
    visual: "streak",
  },
];

function Visual({ kind }: { kind: string }) {
  if (kind === "sheets") {
    return (
      <div className="mt-6 grid grid-cols-3 gap-2">
        {["Arrays", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Graphs"].map(
          (t, i) => (
            <div
              key={t}
              className="rounded-lg border border-line bg-bg/60 px-3 py-2 font-mono text-[11px] text-fg-secondary"
            >
              <div className="flex items-center justify-between">
                <span>{t}</span>
                <span className="text-fg-dim">{[12, 9, 8, 7, 10, 14][i]}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-fg/5">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${[90, 70, 55, 40, 25, 10][i]}%` }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    );
  }
  if (kind === "editor") {
    return (
      <pre className="mt-6 rounded-lg border border-line bg-bg/60 p-3 font-mono text-[11px] leading-5 text-fg-secondary">
        <span className="text-accent-hover">const</span> lo = <span className="text-warning">0</span>, hi = n - <span className="text-warning">1</span>;{"\n"}
        <span className="text-accent-hover">while</span> (lo &lt;= hi) {"{"}{"\n"}
        {"  "}<span className="text-accent-hover">const</span> mid = (lo + hi) &gt;&gt; <span className="text-warning">1</span>;{"\n"}
        {"}"}
        {"\n"}
        <span className="text-success">✓ 24/24 tests passed · 3 ms</span>
      </pre>
    );
  }
  if (kind === "ai") {
    return (
      <div className="mt-6 space-y-2">
        <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-line bg-bg/60 px-3 py-2 text-xs text-fg-secondary">
          What&apos;s the time complexity, and can you handle duplicates?
        </div>
        <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm border border-accent/25 bg-accent-soft px-3 py-2 text-xs text-fg">
          O(n) with a hash map — duplicates are fine since I store indices…
        </div>
      </div>
    );
  }
  if (kind === "revise") {
    return (
      <div className="mt-6 flex items-end gap-1.5">
        {[20, 35, 55, 40, 70, 85, 60, 95].map((h, i) => (
          <div
            key={i}
            className={cn("flex-1 rounded-sm", i === 7 ? "bg-accent" : "bg-accent/30")}
            style={{ height: `${h * 0.56}px` }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-7 gap-1">
      {Array.from({ length: 21 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "aspect-square rounded-[3px]",
            i < 18 ? "bg-accent" : i === 18 ? "bg-accent/40" : "border border-line",
          )}
          style={i < 18 ? { opacity: 0.45 + (i % 5) * 0.12 } : undefined}
        />
      ))}
    </div>
  );
}

export default function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Why BaseCase"
            title={
              <>
                Everything you need to go from
                <span className="text-gradient"> tutorial hell</span> to offer.
              </>
            }
            description="Not another list of problems. A system that decides what you practice next, checks your code, and interviews you — so every session compounds."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className={cn("h-full", f.span)}>
              <article className="card-base card-hover card-glow-top flex h-full flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="card-icon grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-display text-lg text-fg">{f.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{f.description}</p>
                <Visual kind={f.visual} />
              </article>
            </Reveal>
          ))}
          <Reveal delay={320} className="h-full md:col-span-1">
            <article className="card-base flex h-full flex-col items-start justify-between bg-gradient-to-br from-accent/15 via-surface to-surface p-6">
              <Trophy className="h-6 w-6 text-accent" />
              <div>
                <p className="font-display text-3xl text-fg">Top 1%</p>
                <p className="mt-1 text-sm text-fg-secondary">
                  of learners finish a full sheet in under 60 days with the revision queue on.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
