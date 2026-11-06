import Link from "next/link";
import { ArrowRight, Mic, Sparkles } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/shared/Reveal";

const POINTS = [
  { title: "Adaptive questions", text: "Difficulty and follow-ups adjust to how you answer." },
  { title: "Voice-first", text: "Speak your approach out loud — exactly like the real thing." },
  { title: "Scored report", text: "Confidence, depth, communication and a per-question breakdown." },
];

export default function InterviewSection() {
  return (
    <section id="interview" className="border-t border-line py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              eyebrow="AI interview practice"
              title="Practice like it's the real thing."
              description="Our AI interviewer runs a full technical round — asking follow-ups, testing edge cases and giving you a detailed report the moment you finish."
            />
            <ul className="mt-8 space-y-4">
              {POINTS.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-fg">{p.title}</p>
                    <p className="text-sm text-fg-secondary">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/interview" className="btn btn-primary mt-8">
              Start a mock interview <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-base overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-3">
                <span className="font-mono text-xs text-fg-muted">Mock interview · Google · SDE-2</span>
                <span className="chip border border-success/30 bg-success/10 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
                </span>
              </div>
              <div className="space-y-4 p-6">
                <Bubble who="ai">
                  Let&apos;s start with a classic. Given an array of integers, find two numbers
                  that add up to a target. What&apos;s your approach?
                </Bubble>
                <Bubble who="you">
                  I&apos;d use a hash map to store values as I iterate. For each number I check
                  whether the complement exists…
                </Bubble>
                <Bubble who="ai">
                  Good. What&apos;s the time and space complexity? And what if the array is sorted —
                  can you do better on space?
                </Bubble>
              </div>
              <div className="flex items-center justify-between border-t border-line px-6 py-3 text-xs text-fg-muted">
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-ink">
                    <Mic className="h-3 w-3" />
                  </span>
                  Listening…
                </span>
                <span className="font-mono">12:34</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Bubble({ who, children }: { who: "ai" | "you"; children: React.ReactNode }) {
  const ai = who === "ai";
  return (
    <div className={ai ? "flex gap-3" : "flex justify-end gap-3"}>
      {ai && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent">
          AI
        </span>
      )}
      <p
        className={
          ai
            ? "max-w-[85%] rounded-xl rounded-tl-sm bg-surface-2 p-3.5 text-sm text-fg-secondary"
            : "max-w-[85%] rounded-xl rounded-tr-sm border border-accent/25 bg-accent-soft p-3.5 text-sm text-fg"
        }
      >
        {children}
      </p>
      {!ai && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-3 font-mono text-[11px] font-semibold text-fg-secondary">
          You
        </span>
      )}
    </div>
  );
}
