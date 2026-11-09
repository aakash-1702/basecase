"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  MessageSquare,
  Mic,
  Shield,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

/* ─── Types ────────────────────────────────────────────────── */

interface ScoreDimension {
  score: number;
  summary: string;
}

interface InterviewMeta {
  company: string;
  mode: string;
  difficulty: string;
  startedAt: string;
  completedAt: string;
}

interface ReportData {
  id: string;
  interviewId: string;
  overallScore: number;
  confidence: ScoreDimension;
  depthReview: ScoreDimension;
  englishQuality: ScoreDimension;
  technicalAccuracy: ScoreDimension;
  starStructure: ScoreDimension | null;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  createdAt: string;
  interview: InterviewMeta;
}

interface InterviewReportProps {
  interviewId: string;
}

/* ─── Helpers ──────────────────────────────────────────────── */

interface Tone {
  text: string;
  soft: string;
  bar: string;
}

const TONES = {
  success: { text: "text-success", soft: "bg-success/10", bar: "var(--success)" },
  accent: { text: "text-accent", soft: "bg-accent-soft", bar: "var(--accent)" },
  danger: { text: "text-danger", soft: "bg-danger/10", bar: "var(--danger)" },
} satisfies Record<string, Tone>;

function scoreTone(score: number, max = 10): Tone {
  const pct = (score / max) * 100;
  if (pct >= 70) return TONES.success;
  if (pct >= 40) return TONES.accent;
  return TONES.danger;
}

function scoreLabel(score: number): string {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Average";
  return "Needs Work";
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Main Component ───────────────────────────────────────── */

export function InterviewReport({ interviewId }: InterviewReportProps) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/interview/${interviewId}/report`);
        const json = await res.json();
        if (json.success && json.data) {
          setReport(json.data);
        } else {
          setError(json.message || "Failed to load report");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [interviewId]);

  if (loading) return <ReportSkeleton />;
  if (error || !report) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24">
        <EmptyState
          icon={<XCircle className="h-5 w-5" />}
          title={error ?? "Report not found"}
          description="We couldn't load this interview report."
          action={
            <Link href="/interview" className="btn btn-secondary btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to interviews
            </Link>
          }
        />
      </div>
    );
  }

  const {
    interview,
    overallScore,
    confidence,
    depthReview,
    englishQuality,
    technicalAccuracy,
    starStructure,
    strongAreas,
    weakAreas,
    recommendations,
  } = report;

  const dimensions = [
    { key: "confidence", label: "Confidence", icon: Mic, data: confidence },
    { key: "depth", label: "Depth of Knowledge", icon: Brain, data: depthReview },
    { key: "english", label: "Communication Quality", icon: MessageSquare, data: englishQuality },
    ...(technicalAccuracy
      ? [{ key: "technical", label: "Technical Accuracy", icon: Shield, data: technicalAccuracy }]
      : []),
    ...(starStructure
      ? [{ key: "star", label: "STAR Structure", icon: Award, data: starStructure }]
      : []),
  ];

  const overallTone = scoreTone(overallScore);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      {/* ── Back link ── */}
      <Link
        href="/interview"
        className="mb-10 inline-flex items-center gap-2 text-xs text-fg-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} /> Back to interviews
      </Link>

      {/* ── Header ── */}
      <header className="mb-12 animate-fade-up">
        <span className="eyebrow">Interview report</span>
        <h1 className="mb-3 mt-3 font-display text-2xl tracking-tight text-fg sm:text-3xl">
          {interview.company} <span className="text-fg-muted">·</span> {interview.mode} Interview
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-neutral px-3 py-1.5 capitalize">
            <Target size={12} />
            {interview.difficulty}
          </span>
          <span className="chip chip-neutral px-3 py-1.5">
            <Clock size={12} />
            {formatDuration(interview.startedAt, interview.completedAt)}
          </span>
          <span className="chip chip-neutral px-3 py-1.5">{formatDate(interview.startedAt)}</span>
        </div>
      </header>

      {/* ── Overall Score Card ── */}
      <section
        className="card-base card-hover mb-10 animate-fade-up p-6 sm:p-8"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
              Overall score
            </p>
            <div className="flex items-baseline gap-3">
              <span className={cn("font-display text-5xl tabular-nums sm:text-6xl", overallTone.text)}>
                {overallScore}
              </span>
              <span className="font-display text-lg text-fg-dim">/ 10</span>
            </div>
            <p className={cn("mt-1 text-xs font-medium", overallTone.text)}>{scoreLabel(overallScore)}</p>
          </div>

          <div className="w-full sm:w-64">
            <div className="h-2 overflow-hidden rounded-full bg-fg/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${overallScore * 10}%`, background: overallTone.bar }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Dimensions ── */}
      <section className="mb-10">
        <SectionHeading>Performance breakdown</SectionHeading>
        <div className="grid gap-4">
          {dimensions.map(({ key, label, icon: Icon, data }) => (
            <DimensionCard key={key} label={label} icon={Icon} score={data.score} summary={data.summary} />
          ))}
        </div>
      </section>

      {/* ── Strong & Weak Areas ── */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="card-base card-hover p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-success" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-success">
              Strong areas
            </span>
          </div>
          <ul className="space-y-3">
            {strongAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-fg">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-base card-hover p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target size={14} className="text-danger" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-danger">
              Areas to improve
            </span>
          </div>
          <ul className="space-y-3">
            {weakAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-fg">
                <XCircle size={14} className="mt-0.5 shrink-0 text-danger" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section className="mb-14">
        <SectionHeading>Recommendations</SectionHeading>
        <div className="card-base card-hover p-6">
          <ul className="space-y-4">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-fg">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer CTAs ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/interview" className="group btn btn-primary flex-1">
          <BookOpen size={15} />
          Practice again
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/interview" className="btn btn-secondary">
          <ArrowLeft size={14} />
          Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">{children}</h2>
  );
}

function DimensionCard({
  label,
  icon: Icon,
  score,
  summary,
}: {
  label: string;
  icon: React.ElementType;
  score: number;
  summary: string;
}) {
  const tone = scoreTone(score);

  return (
    <div className="card-base card-hover p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-8 w-8 place-items-center rounded-lg", tone.soft, tone.text)}>
            <Icon size={15} />
          </div>
          <span className="text-sm font-medium text-fg">{label}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={cn("font-display text-xl tabular-nums", tone.text)}>{score}</span>
          <span className="text-xs text-fg-dim">/10</span>
          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-fg/[0.06] sm:block">
            <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: tone.bar }} />
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-fg-muted">{summary}</p>
    </div>
  );
}

/* ─── Loading Skeleton ─────────────────────────────────────── */

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16" aria-hidden>
      <div className="skeleton mb-10 h-3 w-32" />
      <div className="mb-12 space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-3 w-48" />
      </div>
      <div className="card-base mb-10 h-32" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-base mb-4 h-28" />
      ))}
    </div>
  );
}
