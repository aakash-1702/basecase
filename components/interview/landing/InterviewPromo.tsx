import Link from "next/link";
import { ArrowUpRight, BarChart3, Mic, Sparkles, Target } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

const FEATURES = [
  {
    icon: Mic,
    title: "Voice-first design",
    desc: "Speak naturally. The AI listens, processes and responds just like a human interviewer.",
  },
  {
    icon: Target,
    title: "Company-specific patterns",
    desc: "Google's system design focus. Amazon's leadership principles. Meta's move-fast culture. We know them all.",
  },
  {
    icon: BarChart3,
    title: "Brutally honest feedback",
    desc: "No participation trophies. Detailed scores on confidence, depth, clarity and technical accuracy.",
  },
];

const MODES = [
  { label: "DSA", desc: "LeetCode-style problems with live discussion" },
  { label: "Technical", desc: "System design, OS, DBMS and more" },
  { label: "HR", desc: "Behavioural and leadership scenarios" },
  { label: "Behavioural", desc: "STAR method situational questions" },
];

/** Shown to free users with no credits left: upsell to Pro. */
export function InterviewPromo() {
  return (
    <Container size="lg" className="pb-24 pt-14 md:pt-20">
      <div className="animate-fade-up">
        <span className="eyebrow">
          <Sparkles className="h-3.5 w-3.5" />
          Pro feature
        </span>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-fg md:text-5xl lg:text-6xl">
          One decision could
          <br />
          <span className="text-gradient">shape your career.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-secondary md:text-lg">
          Most candidates fail FAANG interviews not because they lack skill — but because they never
          practised with real pressure. Our AI interviewer mirrors the exact patterns, pacing and
          follow-ups you&apos;ll face at Google, Amazon, Meta and more.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link href="/subscription" className="btn btn-primary btn-lg">
            Unlock interview prep
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <span className="font-mono text-xs text-fg-muted">Starting at ₹499/month</span>
        </div>
      </div>

      <Reveal className="mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-base card-hover p-6">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-semibold text-fg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-10" delay={80}>
        <div className="flex flex-wrap gap-3">
          {MODES.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-accent/15 bg-accent-soft/60 px-5 py-4 transition-colors hover:border-accent/35"
            >
              <p className="font-mono text-sm font-medium text-accent">{m.label}</p>
              <p className="mt-1 text-xs text-fg-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-20" delay={120}>
        <div className="card-base border-beam p-10 text-center md:p-14">
          <h2 className="font-display text-2xl tracking-tight text-fg md:text-3xl">
            Stop preparing alone.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-fg-muted">
            The difference between candidates who get offers and those who don&apos;t isn&apos;t
            just skill — it&apos;s practice under pressure.
          </p>
          <Link href="/subscription" className="btn btn-primary btn-lg mt-8">
            Start your prep today
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </Container>
  );
}
