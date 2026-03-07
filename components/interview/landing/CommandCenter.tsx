"use client";

import { useState } from "react";
import { interviews } from "@/lib/mockData";
import { StartInterviewModal } from "../StartInterviewModal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/* ── Score Ring SVG ── */
function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 10) * circumference;
  const color =
    score >= 8 ? "#10b981" : score >= 6 ? "#f59e0b" : score >= 4 ? "#f97316" : "#f43f5e";

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2.5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        fill="var(--text-primary)" fontSize={size * 0.28}
        fontFamily="var(--font-dm-mono)"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {score}
      </text>
    </svg>
  );
}

export function InterviewLanding() {
  const [showModal, setShowModal] = useState(false);

  const avgScore = interviews.reduce((acc, i) => acc + i.score, 0) / interviews.length;
  const sessionCount = interviews.length;

  return (
    <div className="min-h-screen interview-ambient-bg interview-grid-overlay">
      <div className="relative z-10">
        {/* ── HERO ── */}
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
          {/* Tag */}
          <div
            className="text-[10px] tracking-[0.2em] uppercase mb-8"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
              animation: "fadeSlideUp 0.5s ease backwards",
            }}
          >
            BASECASE · INTERVIEW PREP
          </div>

          {/* Title */}
          <h1
            className="text-5xl mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
              animation: "fadeSlideUp 0.5s ease 0.06s backwards",
            }}
          >
            Your Interview
            <br />
            Command Center.
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm max-w-xl leading-relaxed mb-10"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
              animation: "fadeSlideUp 0.5s ease 0.12s backwards",
            }}
          >
            Practice with an AI interviewer that mirrors real sessions.
            Voice-first, feedback-driven, and brutally honest.
          </p>

          {/* Stats + CTA row */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-12"
            style={{ animation: "fadeSlideUp 0.5s ease 0.18s backwards" }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: "var(--amber)",
                color: "#000",
                borderRadius: "6px",
                fontFamily: "var(--font-dm-mono)",
              }}
            >
              + Start New Session
            </button>

            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
                  {avgScore.toFixed(1)}
                </div>
                <div className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                  Avg Score
                </div>
              </div>
              <div className="w-px bg-white/[0.06]" />
              <div>
                <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
                  {sessionCount}
                </div>
                <div className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                  Sessions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAST SESSIONS ── */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-5">
            <div
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}
            >
              Past Sessions
            </div>
            <span
              className="text-[11px]"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-dim)" }}
            >
              {interviews.length} total
            </span>
          </div>

          <div className="h-px mb-6" style={{ background: "var(--border-subtle)" }} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview, idx) => (
              <PastInterviewCard key={interview.id} interview={interview} delay={idx * 70} />
            ))}
          </div>
        </div>
      </div>

      {showModal && <StartInterviewModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ── Past Interview Card ── */
function PastInterviewCard({
  interview,
  delay,
}: {
  interview: (typeof interviews)[0];
  delay: number;
}) {
  const metricColor = (val: number) =>
    val >= 85 ? "#10b981" : val >= 70 ? "#f59e0b" : val >= 55 ? "#f97316" : "#f43f5e";

  return (
    <Link href={`/interview/${interview.id}/report`}>
      <div
        className="group p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.1] cursor-pointer"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          borderRadius: "8px",
          animation: "fadeSlideUp 0.4s ease forwards",
          animationDelay: `${delay}ms`,
          opacity: 0,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-primary)" }}>
                {interview.company}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider"
                style={{
                  background: "var(--amber-dim)",
                  color: "var(--amber)",
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                {interview.type}
              </span>
            </div>
            <div className="text-[11px]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
              {interview.date} · {interview.questionCount} questions
            </div>
          </div>
          <ScoreRing score={interview.score} size={40} />
        </div>

        {/* Metric bars */}
        <div className="space-y-1.5 mb-3">
          {[
            { label: "Confidence", val: interview.metrics.confidence },
            { label: "Depth", val: interview.metrics.conceptClarity },
            { label: "Clarity", val: interview.metrics.englishClarity },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="text-[10px] w-[58px] shrink-0" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                {m.label}
              </span>
              <div className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/[0.04]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.val}%`, background: metricColor(m.val) }}
                />
              </div>
              <span className="text-[10px] w-5 text-right" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                {Math.round(m.val / 10)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04]">
          <div className="flex gap-1">
            {interview.topics.slice(0, 2).map((topic) => (
              <span key={topic} className="px-2 py-0.5 rounded text-[9px]" style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                {topic}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-medium group-hover:underline flex items-center gap-1" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
            Report
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>
    </Link>
  );
}
