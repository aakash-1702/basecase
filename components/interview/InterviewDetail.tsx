"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  Shield,
  Volume2,
  BookOpen,
  MessagesSquare,
  Layers,
  TrendingUp,
  TrendingDown,
  XCircle,
} from "lucide-react";
import ProgressBar from "@/components/shared/ProgressBar";
import { cn } from "@/lib/utils";
import type { Interview, InterviewMetrics, TranscriptItem } from "@/types/interview";

/* ── tone helpers (design tokens only) ── */

const scoreTextClass = (score: number) =>
  score >= 8 ? "text-success" : score >= 6 ? "text-warning" : "text-danger";

const scoreBarColor = (score: number) =>
  score >= 8 ? "success" : score >= 6 ? "linear-gradient(90deg, var(--warning), #fbbf24)" : "danger";

const metricTone = (val: number) => {
  if (val >= 85) return { text: "text-success", stroke: "var(--success)", label: "Excellent" };
  if (val >= 70) return { text: "text-warning", stroke: "var(--warning)", label: "Good" };
  if (val >= 55) return { text: "text-accent", stroke: "var(--accent)", label: "Average" };
  return { text: "text-danger", stroke: "var(--danger)", label: "Needs work" };
};

const METRICS: { key: keyof InterviewMetrics; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "confidence", label: "Confidence", icon: <Shield className="h-4 w-4" />, desc: "How confident and assertive your delivery is." },
  { key: "englishClarity", label: "English Clarity", icon: <Volume2 className="h-4 w-4" />, desc: "Grammar, vocabulary, and speech clarity." },
  { key: "conceptClarity", label: "Concept Clarity", icon: <BookOpen className="h-4 w-4" />, desc: "Accuracy and depth of your explanations." },
  { key: "communicationFlow", label: "Communication", icon: <MessagesSquare className="h-4 w-4" />, desc: "Structure, coherence, and flow of your answers." },
  { key: "technicalDepth", label: "Technical Depth", icon: <Layers className="h-4 w-4" />, desc: "How deeply you cover technical details." },
];

const RING_R = 36;
const RING_C = 2 * Math.PI * RING_R;

export default function InterviewDetail({
  interview,
  transcript,
}: {
  interview: Interview;
  transcript: TranscriptItem[];
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const scorePercent = (interview.score / 10) * 100;

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        {/* Back */}
        <Link
          href="/interview"
          className="inline-flex animate-fade-up items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to interviews
        </Link>

        {/* ── Header Card ── */}
        <div className="card-base animate-fade-up space-y-5 p-7" style={{ animationDelay: "60ms" }}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-neutral">{interview.type}</span>
                <span className="chip chip-neutral">{interview.difficulty}</span>
                <span className="chip chip-neutral">{interview.questionCount} Questions</span>
              </div>
              <h1 className="font-display text-2xl tracking-tight text-fg sm:text-3xl">
                {interview.company}
              </h1>
              <p className="text-sm text-fg-muted">
                {interview.date} · {interview.duration}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div className={cn("font-display text-5xl tabular-nums", scoreTextClass(interview.score))}>
                {interview.score}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                out of 10
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1.5">
            <ProgressBar value={scorePercent} color={scoreBarColor(interview.score)} />
            <div className="flex justify-between font-mono text-[10px] text-fg-dim">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {interview.topics.map((t) => (
              <span key={t} className="chip chip-accent">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Performance Metrics ── */}
        <div className="animate-fade-up space-y-5" style={{ animationDelay: "120ms" }}>
          <span className="eyebrow">Performance breakdown</span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map((m) => {
              const value = interview.metrics[m.key];
              const tone = metricTone(value);
              const dashOffset = RING_C - (value / 100) * RING_C;

              return (
                <div key={m.key} className="card-base card-hover p-5">
                  <div className="flex items-start gap-4">
                    {/* Circular gauge */}
                    <div className="relative shrink-0">
                      <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
                        <circle cx="40" cy="40" r={RING_R} fill="none" stroke="var(--line)" strokeWidth="4" />
                        <circle
                          cx="40"
                          cy="40"
                          r={RING_R}
                          fill="none"
                          stroke={tone.stroke}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={RING_C}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("font-display text-lg tabular-nums", tone.text)}>
                          {value}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="mb-1 flex items-center gap-2 text-fg-muted">
                        {m.icon}
                        <span className="text-sm font-medium text-fg">{m.label}</span>
                      </div>
                      <span className={cn("text-[11px] font-medium", tone.text)}>{tone.label}</span>
                      <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{m.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Strong Areas / Needs Work ── */}
        <div className="grid animate-fade-up grid-cols-1 gap-3 sm:grid-cols-2" style={{ animationDelay: "180ms" }}>
          <div className="card-base space-y-3 p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-success">
                Strong areas
              </h3>
            </div>
            <ul className="space-y-2">
              {interview.strongAreas.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-fg-secondary">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-base space-y-3 p-5">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-warning">
                Needs work
              </h3>
            </div>
            <ul className="space-y-2">
              {interview.needsWork.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-fg-secondary">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Transcript (collapsed by default) ── */}
        <div className="animate-fade-up space-y-4" style={{ animationDelay: "240ms" }}>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            className="group card-base card-hover flex w-full items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-fg-muted transition-colors group-hover:text-accent" />
              <span className="text-sm font-medium text-fg">Full transcript</span>
              <span className="font-mono text-[11px] text-fg-muted">{transcript.length} questions</span>
            </div>
            {showTranscript ? (
              <ChevronUp className="h-4 w-4 text-fg-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-fg-muted" />
            )}
          </button>

          {showTranscript && (
            <div className="animate-fade-in space-y-3">
              {transcript.length > 0 ? (
                transcript.map((item, index) => (
                  <div key={index} className="card-base overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-line px-5 py-3">
                      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
                        Q{index + 1}
                      </span>
                      <p className="text-sm font-medium text-fg">{item.question}</p>
                    </div>

                    <div className="divide-y divide-line">
                      <div className="space-y-1.5 px-5 py-4">
                        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-fg-muted">
                          <MessageSquare className="h-3 w-3" /> Your answer
                        </p>
                        <p className="text-sm leading-relaxed text-fg-secondary">{item.answer}</p>
                      </div>

                      <div className="space-y-1.5 px-5 py-4">
                        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
                          <Lightbulb className="h-3 w-3" /> AI feedback
                        </p>
                        <p className="text-sm leading-relaxed text-fg-secondary">{item.feedback}</p>
                      </div>

                      {item.suggestedAnswer && (
                        <div className="space-y-1.5 px-5 py-4">
                          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-success">
                            <CheckCircle2 className="h-3 w-3" /> Stronger answer
                          </p>
                          <p className="text-sm leading-relaxed text-fg-secondary">{item.suggestedAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-base py-12 text-center">
                  <p className="text-sm text-fg-muted">No transcript available.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div
          className="flex animate-fade-up items-center justify-between border-t border-line pt-4"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/interview"
            className="flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All interviews
          </Link>
          <Link href="/interview" className="btn btn-primary btn-sm">
            <RotateCcw className="h-4 w-4" />
            Practice again
          </Link>
        </div>
      </div>
    </div>
  );
}
