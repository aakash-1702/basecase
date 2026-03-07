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
} from "lucide-react";
import type {
  Interview,
  InterviewMetrics,
  TranscriptItem,
} from "@/lib/mockData";

const scoreColor = (score: number) =>
  score >= 8
    ? "text-emerald-400"
    : score >= 6
      ? "text-amber-400"
      : "text-red-400";

const scoreBarColor = (score: number) =>
  score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-red-500";

const metricRingColor = (val: number) => {
  if (val >= 85) return { stroke: "#34d399", bg: "rgba(52,211,153,0.08)" };
  if (val >= 70) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.08)" };
  if (val >= 55) return { stroke: "#fb923c", bg: "rgba(251,146,60,0.08)" };
  return { stroke: "#f87171", bg: "rgba(248,113,113,0.08)" };
};

const metricTextColor = (val: number) => {
  if (val >= 85) return "text-emerald-400";
  if (val >= 70) return "text-amber-400";
  if (val >= 55) return "text-orange-400";
  return "text-red-400";
};

const metricLabel = (val: number) => {
  if (val >= 85) return "Excellent";
  if (val >= 70) return "Good";
  if (val >= 55) return "Average";
  return "Needs work";
};

export default function InterviewDetail({
  interview,
  transcript,
}: {
  interview: Interview;
  transcript: TranscriptItem[];
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const scorePercent = (interview.score / 10) * 100;

  const metrics: {
    key: keyof InterviewMetrics;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      key: "confidence",
      label: "Confidence",
      icon: <Shield className="w-4 h-4" />,
      desc: "How confident and assertive your delivery is.",
    },
    {
      key: "englishClarity",
      label: "English Clarity",
      icon: <Volume2 className="w-4 h-4" />,
      desc: "Grammar, vocabulary, and speech clarity.",
    },
    {
      key: "conceptClarity",
      label: "Concept Clarity",
      icon: <BookOpen className="w-4 h-4" />,
      desc: "Accuracy and depth of your explanations.",
    },
    {
      key: "communicationFlow",
      label: "Communication",
      icon: <MessagesSquare className="w-4 h-4" />,
      desc: "Structure, coherence, and flow of your answers.",
    },
    {
      key: "technicalDepth",
      label: "Technical Depth",
      icon: <Layers className="w-4 h-4" />,
      desc: "How deeply you cover technical details.",
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Ambient bg */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Back */}
        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
          style={{ animation: "fadeSlideUp 0.4s ease backwards" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to interviews
        </Link>

        {/* ── Header Card ── */}
        <div
          className="p-7 rounded-2xl border border-[#1F1F2A] bg-[#111117] space-y-5"
          style={{ animation: "fadeSlideUp 0.4s ease 0.06s backwards" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#1F1F2A] text-[#A1A1AA]">
                  {interview.type}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#1F1F2A] text-[#A1A1AA]">
                  {interview.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#1F1F2A] text-[#A1A1AA]">
                  {interview.questionCount} Questions
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7]">
                {interview.company}
              </h1>
              <p className="text-sm text-[#A1A1AA]">
                {interview.date} · {interview.duration}
              </p>
            </div>
            <div className="text-center shrink-0">
              <div
                className={`text-5xl font-bold tabular-nums ${scoreColor(interview.score)}`}
              >
                {interview.score}
              </div>
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-widest mt-1">
                out of 10
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="h-[4px] w-full bg-[#1F1F2A] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreBarColor(interview.score)}`}
                style={{
                  width: `${scorePercent}%`,
                  animation: "fillBar 1s ease forwards",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#A1A1AA]/50">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {interview.topics.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-md text-xs bg-[#1A1A22] text-[#A1A1AA]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Performance Metrics ── */}
        <div
          className="space-y-5"
          style={{ animation: "fadeSlideUp 0.4s ease 0.12s backwards" }}
        >
          <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-[0.25em]">
            Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.map((m, idx) => {
              const value = interview.metrics[m.key];
              const ring = metricRingColor(value);
              const circumference = 2 * Math.PI * 36;
              const dashOffset = circumference - (value / 100) * circumference;

              return (
                <div
                  key={m.key}
                  className="p-5 rounded-xl border border-[#1F1F2A] bg-[#111117] hover:border-amber-500/15 transition-colors duration-300"
                  style={{
                    animation: `fadeSlideUp 0.4s ease ${0.14 + idx * 0.06}s backwards`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Circular gauge */}
                    <div className="relative shrink-0">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="#1F1F2A"
                          strokeWidth="4"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke={ring.stroke}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          transform="rotate(-90 40 40)"
                          style={{
                            transition: "stroke-dashoffset 1s ease",
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-lg font-bold ${metricTextColor(value)}`}
                        >
                          {value}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 text-[#A1A1AA] mb-1">
                        {m.icon}
                        <span className="text-sm font-medium text-[#F5F5F7]">
                          {m.label}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-medium ${metricTextColor(value)}`}
                      >
                        {metricLabel(value)}
                      </span>
                      <p className="text-[11px] text-[#A1A1AA]/60 mt-1 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Strong Areas / Needs Work ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          style={{ animation: "fadeSlideUp 0.4s ease 0.5s backwards" }}
        >
          {/* Strong */}
          <div className="p-5 rounded-xl border border-[#1F1F2A] bg-[#111117] space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em]">
                Strong Areas
              </h3>
            </div>
            <ul className="space-y-2">
              {interview.strongAreas.map((area) => (
                <li
                  key={area}
                  className="flex items-start gap-2 text-sm text-[#A1A1AA]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Needs work */}
          <div className="p-5 rounded-xl border border-[#1F1F2A] bg-[#111117] space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-[0.2em]">
                Needs Work
              </h3>
            </div>
            <ul className="space-y-2">
              {interview.needsWork.map((area) => (
                <li
                  key={area}
                  className="flex items-start gap-2 text-sm text-[#A1A1AA]"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center mt-0.5 shrink-0 text-amber-400 text-xs">
                    ✗
                  </span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Transcript (collapsed by default) ── */}
        <div
          className="space-y-4"
          style={{ animation: "fadeSlideUp 0.4s ease 0.56s backwards" }}
        >
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full p-4 rounded-xl border border-[#1F1F2A] bg-[#111117] hover:border-amber-500/20 transition-colors duration-200 group"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-[#A1A1AA] group-hover:text-amber-500 transition-colors" />
              <span className="text-sm font-medium text-[#F5F5F7]">
                Full Transcript
              </span>
              <span className="text-[11px] text-[#A1A1AA]/50">
                {transcript.length} questions
              </span>
            </div>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4 text-[#A1A1AA]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
            )}
          </button>

          {showTranscript && (
            <div
              className="space-y-3"
              style={{ animation: "fadeSlideUp 0.3s ease backwards" }}
            >
              {transcript.length > 0 ? (
                transcript.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#1F1F2A] bg-[#111117] overflow-hidden"
                    style={{
                      animation: `fadeSlideUp 0.3s ease ${index * 0.06}s backwards`,
                    }}
                  >
                    <div className="px-5 py-3 border-b border-[#1F1F2A] flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest shrink-0">
                        Q{index + 1}
                      </span>
                      <p className="text-sm font-medium text-[#F5F5F7]">
                        {item.question}
                      </p>
                    </div>

                    <div className="divide-y divide-[#1F1F2A]">
                      <div className="px-5 py-4 space-y-1.5">
                        <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" /> Your answer
                        </p>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>

                      <div className="px-5 py-4 space-y-1.5">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Lightbulb className="w-3 h-3" /> AI Feedback
                        </p>
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                          {item.feedback}
                        </p>
                      </div>

                      {item.suggestedAnswer && (
                        <div className="px-5 py-4 space-y-1.5">
                          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Stronger answer
                          </p>
                          <p className="text-sm text-[#A1A1AA] leading-relaxed">
                            {item.suggestedAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border border-[#1F1F2A] rounded-xl">
                  <p className="text-sm text-[#A1A1AA]">
                    No transcript available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div
          className="flex items-center justify-between pt-4 border-t border-[#1F1F2A]"
          style={{ animation: "fadeSlideUp 0.4s ease 0.62s backwards" }}
        >
          <Link
            href="/interview"
            className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Interviews
          </Link>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-900/30">
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
        </div>
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
        @keyframes fillBar {
          from {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
