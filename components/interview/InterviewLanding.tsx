"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Sparkles,
  Mic,
  Brain,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import type { Interview } from "@/lib/mockData";

const companies = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Uber",
];

const scoreStyle = (score: number) => {
  if (score >= 8)
    return {
      color: "text-emerald-400",
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/10",
    };
  if (score >= 6)
    return {
      color: "text-amber-400",
      bar: "bg-amber-500",
      glow: "shadow-amber-500/10",
    };
  return {
    color: "text-red-400",
    bar: "bg-red-500",
    glow: "shadow-red-500/10",
  };
};

const metricLabel = (val: number) => {
  if (val >= 85) return "Excellent";
  if (val >= 70) return "Good";
  if (val >= 55) return "Average";
  return "Needs work";
};

const metricColor = (val: number) => {
  if (val >= 85) return "text-emerald-400";
  if (val >= 70) return "text-amber-400";
  if (val >= 55) return "text-orange-400";
  return "text-red-400";
};

export default function InterviewLanding({
  interviews,
}: {
  interviews: Interview[];
}) {
  const router = useRouter();

  const avgScore =
    interviews.length > 0
      ? (
          interviews.reduce((a, b) => a + b.score, 0) / interviews.length
        ).toFixed(1)
      : "0";
  const uniqueCompanies = new Set(interviews.map((i) => i.company)).size;
  const totalQuestions = interviews.reduce((a, b) => a + b.questionCount, 0);
  const avgConfidence =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((a, b) => a + b.metrics.confidence, 0) /
            interviews.length,
        )
      : 0;

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(245,158,11,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        {/* ── HERO SECTION ── */}
        <section className="space-y-8 pt-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-[#111117] text-xs text-[#A1A1AA]"
            style={{ animation: "fadeSlideUp 0.5s ease backwards" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            AI Mock Interviews — BaseCase
          </div>

          <div
            className="space-y-5"
            style={{ animation: "fadeSlideUp 0.5s ease 0.08s backwards" }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              The realest interview
              <br />
              experience for{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                top tech companies.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
              Practice with an AI interviewer that mirrors real sessions at
              Google, Amazon, Meta, and more. Voice-first, feedback-driven, and
              brutally honest — so the real thing feels like a rerun.
            </p>
          </div>

          {/* Company ticker */}
          <div
            className="flex items-center gap-3 flex-wrap"
            style={{ animation: "fadeSlideUp 0.5s ease 0.16s backwards" }}
          >
            <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA]/50">
              Prep for
            </span>
            {companies.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-md text-[11px] bg-[#111117] border border-[#1F1F2A] text-[#A1A1AA]/70"
              >
                {c}
              </span>
            ))}
          </div>

          {/* Feature highlights */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
            style={{ animation: "fadeSlideUp 0.5s ease 0.24s backwards" }}
          >
            {[
              {
                icon: <Mic className="w-4 h-4" />,
                title: "Voice-first",
                desc: "Speak your answers. Real-time transcription.",
              },
              {
                icon: <Brain className="w-4 h-4" />,
                title: "AI evaluation",
                desc: "Instant scoring on clarity, depth & confidence.",
              },
              {
                icon: <TrendingUp className="w-4 h-4" />,
                title: "Track progress",
                desc: "See how you improve across sessions.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#1F1F2A] bg-[#111117]/60"
              >
                <div className="mt-0.5 text-amber-500">{f.icon}</div>
                <div>
                  <div className="text-sm font-medium text-[#F5F5F7]">
                    {f.title}
                  </div>
                  <div className="text-xs text-[#A1A1AA] mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NEW INTERVIEW SECTION ── */}
        <section
          className="space-y-6"
          style={{ animation: "fadeSlideUp 0.5s ease 0.32s backwards" }}
        >
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-[0.25em]">
              New Session
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Pick your mode and start practicing.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-[#1F1F2A] bg-[#111117] space-y-6">
            {/* Description */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
              <div className="flex-1 space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F7]">
                  Start a mock interview
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-lg">
                  Choose your target company, interview type, difficulty, and
                  focus areas. The AI adapts to your level and gives real-time
                  feedback on every answer — scoring your confidence, clarity,
                  and conceptual depth.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    {
                      icon: <MessageSquare className="w-3 h-3" />,
                      text: "Technical · HR · Behavioral",
                    },
                    {
                      icon: <Clock className="w-3 h-3" />,
                      text: "12–25 min sessions",
                    },
                    {
                      icon: <Zap className="w-3 h-3" />,
                      text: "Instant AI feedback",
                    },
                  ].map((tag) => (
                    <span
                      key={tag.text}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-amber-500/8 border border-amber-500/15 text-amber-400/80"
                    >
                      {tag.icon}
                      {tag.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual accent */}
              <div className="hidden sm:flex flex-col items-center gap-3 shrink-0">
                <div className="w-20 h-20 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <span className="text-[10px] text-[#A1A1AA]/50 uppercase tracking-widest">
                  AI-powered
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-[#1F1F2A]">
              <button
                onClick={() => router.push("/interview/session/demo")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-900/30"
              >
                <Sparkles className="w-4 h-4" />
                Start Mock Interview
              </button>
              <p className="text-xs text-[#A1A1AA]/40 italic">
                Your future interviewer is already asking questions.
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        {interviews.length > 0 && (
          <section
            className="space-y-6"
            style={{ animation: "fadeSlideUp 0.5s ease 0.4s backwards" }}
          >
            <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-[0.25em]">
              Your Progress
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: interviews.length, label: "Sessions done" },
                { value: uniqueCompanies, label: "Companies" },
                { value: `${avgScore}/10`, label: "Avg score" },
                { value: `${avgConfidence}%`, label: "Avg confidence" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-xl border border-[#1F1F2A] bg-[#111117]/80 hover:border-amber-500/20 transition-colors duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-semibold text-[#F5F5F7]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PAST SESSIONS ── */}
        <section className="space-y-6 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-[0.25em]">
              Past Sessions
            </h2>
            <span className="text-xs text-[#A1A1AA]/40">
              {interviews.length} total
            </span>
          </div>

          {interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {interviews.map((interview, idx) => (
                <PastInterviewCard
                  key={interview.id}
                  interview={interview}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-[#1F1F2A] rounded-xl bg-[#111117]/50">
              <p className="text-[#A1A1AA] text-sm">No sessions yet.</p>
              <p className="text-[#A1A1AA]/50 text-xs mt-1">
                Start your first mock interview above.
              </p>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* ── Past Interview Card ── */
function PastInterviewCard({
  interview,
  index,
}: {
  interview: Interview;
  index: number;
}) {
  const { color, bar } = scoreStyle(interview.score);
  const scorePercent = (interview.score / 10) * 100;
  const avgMetric = Math.round(
    (interview.metrics.confidence +
      interview.metrics.englishClarity +
      interview.metrics.conceptClarity) /
      3,
  );

  return (
    <Link href={`/interview/${interview.id}`}>
      <div
        className="group relative p-5 rounded-xl border border-[#1F1F2A] bg-[#111117] hover:border-amber-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/[0.04] transition-all duration-300 cursor-pointer"
        style={{
          animation: `fadeSlideUp 0.4s ease ${index * 0.06}s backwards`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7]">
              {interview.company}
            </h3>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5">
              {interview.type} · {interview.difficulty} ·{" "}
              {interview.questionCount} Qs
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#1F1F2A] group-hover:text-amber-500 transition-colors duration-200" />
        </div>

        {/* Score */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-[#A1A1AA]">Score</span>
            <span className={`font-medium ${color}`}>{interview.score}/10</span>
          </div>
          <div className="h-[3px] w-full bg-[#1F1F2A] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${bar} transition-all duration-700`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Confidence", val: interview.metrics.confidence },
            { label: "Clarity", val: interview.metrics.englishClarity },
            { label: "Concepts", val: interview.metrics.conceptClarity },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className={`text-xs font-semibold ${metricColor(m.val)}`}>
                {m.val}%
              </div>
              <div className="text-[9px] text-[#A1A1AA]/60 mt-0.5">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-2 border-t border-[#1F1F2A]/60">
          <span>{interview.date}</span>
          <span>{interview.duration}</span>
        </div>

        {/* Topics */}
        {interview.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {interview.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-md text-[10px] bg-[#1A1A22] text-[#A1A1AA]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
