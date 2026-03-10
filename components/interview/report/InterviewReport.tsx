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

function scoreColor(score: number, max = 10): string {
  const pct = (score / max) * 100;
  if (pct >= 70) return "var(--emerald)";
  if (pct >= 40) return "var(--amber)";
  return "var(--rose)";
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--rose)" }}
          >
            {error ?? "Report not found"}
          </p>
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 text-xs transition-colors duration-300 ease-out hover:text-(--amber)"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            <ArrowLeft size={14} /> Back to Interviews
          </Link>
        </div>
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
    {
      key: "confidence",
      label: "Confidence",
      icon: Mic,
      data: confidence,
    },
    {
      key: "depth",
      label: "Depth of Knowledge",
      icon: Brain,
      data: depthReview,
    },
    {
      key: "english",
      label: "Communication Quality",
      icon: MessageSquare,
      data: englishQuality,
    },
    ...(technicalAccuracy
      ? [
          {
            key: "technical",
            label: "Technical Accuracy",
            icon: Shield,
            data: technicalAccuracy,
          },
        ]
      : []),
    ...(starStructure
      ? [
          {
            key: "star",
            label: "STAR Structure",
            icon: Award,
            data: starStructure,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* ── Back link ── */}
      <Link
        href="/interview"
        className="inline-flex items-center gap-2 text-xs mb-10 transition-colors duration-300 ease-out hover:text-(--amber)"
        style={{
          fontFamily: "var(--font-dm-mono)",
          color: "var(--text-muted)",
        }}
      >
        <ArrowLeft size={14} /> Back to Interviews
      </Link>

      {/* ── Header ── */}
      <header className="mb-12">
        <div
          className="text-[10px] tracking-[0.25em] uppercase mb-3"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "var(--amber)",
          }}
        >
          Interview Report
        </div>
        <h1
          className="text-2xl sm:text-3xl mb-3"
          style={{
            fontFamily: "var(--font-dm-serif)",
            color: "var(--text-primary)",
          }}
        >
          {interview.company}{" "}
          <span style={{ color: "var(--text-muted)" }}>·</span> {interview.mode}{" "}
          Interview
        </h1>
        <div
          className="flex flex-wrap items-center gap-2.5 text-xs"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "var(--text-muted)",
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Target size={12} />
            {interview.difficulty}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Clock size={12} />
            {formatDuration(interview.startedAt, interview.completedAt)}
          </span>
          <span
            className="inline-flex items-center rounded-full border px-3 py-1.5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/3"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {formatDate(interview.startedAt)}
          </span>
        </div>
      </header>

      {/* ── Overall Score Card ── */}
      <section
        className="group rounded-xl p-6 sm:p-8 mb-10 border transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--bg-card-hover) hover:shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div
              className="text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              Overall Score
            </div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl sm:text-6xl"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  color: scoreColor(overallScore),
                }}
              >
                {overallScore}
              </span>
              <span
                className="text-lg"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  color: "var(--text-dim)",
                }}
              >
                / 10
              </span>
            </div>
            <div
              className="text-xs mt-1"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: scoreColor(overallScore),
              }}
            >
              {scoreLabel(overallScore)}
            </div>
          </div>

          {/* Mini score bar */}
          <div className="w-full sm:w-64">
            <div className="h-2 rounded-full overflow-hidden bg-(--text-dim)">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out group-hover:brightness-110"
                style={{
                  width: `${overallScore * 10}%`,
                  background: scoreColor(overallScore),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Dimensions ── */}
      <section className="mb-10">
        <SectionHeading>Performance Breakdown</SectionHeading>
        <div className="grid gap-4">
          {dimensions.map(({ key, label, icon: Icon, data }) => (
            <DimensionCard
              key={key}
              label={label}
              icon={Icon}
              score={data.score}
              summary={data.summary}
            />
          ))}
        </div>
      </section>

      {/* ── Strong & Weak Areas ── */}
      <section className="grid sm:grid-cols-2 gap-4 mb-10">
        {/* Strengths */}
        <div
          className="group rounded-xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--bg-card-hover) hover:shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "var(--emerald)" }} />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--emerald)",
              }}
            >
              Strong Areas
            </span>
          </div>
          <ul className="space-y-3">
            {strongAreas.map((area, i) => (
              <li
                key={i}
                className="-mx-2 flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-300 ease-out hover:translate-x-0.5 hover:bg-white/3"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-primary)",
                }}
              >
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--emerald)" }}
                />
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div
          className="group rounded-xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--bg-card-hover) hover:shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={14} style={{ color: "var(--rose)" }} />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--rose)",
              }}
            >
              Areas to Improve
            </span>
          </div>
          <ul className="space-y-3">
            {weakAreas.map((area, i) => (
              <li
                key={i}
                className="-mx-2 flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition-all duration-300 ease-out hover:translate-x-0.5 hover:bg-white/3"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-primary)",
                }}
              >
                <XCircle
                  size={14}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--rose)" }}
                />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section className="mb-14">
        <SectionHeading>Recommendations</SectionHeading>
        <div
          className="group rounded-xl p-6 border transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-(--bg-card-hover) hover:shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <ul className="space-y-4">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-300 ease-out hover:translate-x-0.5 hover:bg-white/3"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-primary)",
                }}
              >
                <Lightbulb
                  size={14}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--amber)" }}
                />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer CTAs ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/interview"
          className="group flex-1 flex items-center justify-center gap-2 py-3.5 px-6 text-sm rounded-lg transition-all duration-300 ease-out hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "var(--amber)",
            color: "#000",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          <BookOpen size={15} />
          Practice Again
          <ChevronRight
            size={14}
            className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
          />
        </Link>

        <Link
          href="/interview"
          className="flex items-center justify-center gap-2 py-3.5 px-6 text-sm rounded-lg border transition-all duration-300 ease-out hover:bg-white/3 hover:border-(--text-muted)"
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            borderColor: "var(--border-subtle)",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
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
    <h2
      className="text-[10px] tracking-[0.2em] uppercase mb-4"
      style={{
        fontFamily: "var(--font-dm-mono)",
        color: "var(--text-muted)",
      }}
    >
      {children}
    </h2>
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
  const color = scoreColor(score);

  return (
    <div
      className="group rounded-xl p-5 border transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(255,255,255,0.1)] hover:bg-(--bg-card-hover) hover:shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-105 group-hover:brightness-110"
            style={{ background: `${color}15` }}
          >
            <Icon size={15} style={{ color }} />
          </div>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-primary)",
            }}
          >
            {label}
          </span>
        </div>

        {/* Score pill */}
        <div className="flex items-center gap-2.5">
          <span
            className="text-xl tabular-nums"
            style={{ fontFamily: "var(--font-dm-serif)", color }}
          >
            {score}
          </span>
          <span
            className="text-xs"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-dim)",
            }}
          >
            /10
          </span>

          {/* Bar */}
          <div className="hidden sm:block w-20 h-1.5 rounded-full overflow-hidden bg-(--text-dim)">
            <div
              className="h-full rounded-full"
              style={{ width: `${score * 10}%`, background: color }}
            />
          </div>
        </div>
      </div>

      <p
        className="text-xs leading-relaxed"
        style={{
          fontFamily: "var(--font-dm-mono)",
          color: "var(--text-muted)",
        }}
      >
        {summary}
      </p>
    </div>
  );
}

/* ─── Loading Skeleton ─────────────────────────────────────── */

function ReportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-pulse">
      <div className="h-3 w-32 rounded bg-white/5 mb-10" />
      <div className="space-y-3 mb-12">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-8 w-72 rounded bg-white/5" />
        <div className="h-3 w-48 rounded bg-white/5" />
      </div>
      <div className="rounded-xl h-32 bg-white/2 border border-white/5 mb-10" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl h-28 bg-white/2 border border-white/5 mb-4"
        />
      ))}
    </div>
  );
}
