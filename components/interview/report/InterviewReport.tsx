"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Download, RotateCcw } from "lucide-react";

interface InterviewReportProps {
  interview: any;
  transcript: any[];
}

export function InterviewReport({
  interview,
  transcript,
}: InterviewReportProps) {
  return (
    <div className="min-h-screen interview-ambient-bg interview-grid-overlay">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div
            className="text-[10px] tracking-[0.2em] uppercase mb-2"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--amber)",
            }}
          >
            SESSION COMPLETE
          </div>
          <div
            className="text-sm"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            {interview.company} · {interview.type} Interview · {interview.date}
          </div>
        </div>

        {/* Score Rings */}
        <div className="grid grid-cols-5 gap-6 mb-16">
          <ScoreRing
            label="Conf."
            score={interview.metrics.confidence}
            delay={0}
          />
          <ScoreRing
            label="Depth"
            score={interview.metrics.conceptClarity}
            delay={150}
          />
          <ScoreRing
            label="Engl."
            score={interview.metrics.englishClarity}
            delay={300}
          />
          <ScoreRing
            label="Tech."
            score={interview.metrics.technicalDepth}
            delay={450}
          />
          <ScoreRing
            label="Comm."
            score={interview.metrics.communicationFlow}
            delay={600}
          />
        </div>

        {/* Overall Performance */}
        <div className="mb-16">
          <div
            className="text-[10px] tracking-[0.2em] uppercase mb-4"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            OVERALL PERFORMANCE
          </div>
          <div
            className="text-6xl mb-4"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--amber)",
            }}
          >
            {interview.score.toFixed(1)} / 10
          </div>
          <div className="h-3 bg-[var(--text-dim)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--amber)]"
              style={{
                width: `${interview.score * 10}%`,
                animation: "fillBar 1.2s ease forwards",
              }}
            />
          </div>
        </div>

        {/* Strong / Weak Areas */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          {/* Strong Areas */}
          <div>
            <div
              className="text-[10px] tracking-[0.2em] uppercase mb-4"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--emerald)",
              }}
            >
              STRONG AREAS
            </div>
            <div className="space-y-2">
              {interview.strongAreas.map((area: string) => (
                <div
                  key={area}
                  className="text-sm flex items-start gap-2"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ color: "var(--emerald)" }}>✓</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Work */}
          <div>
            <div
              className="text-[10px] tracking-[0.2em] uppercase mb-4"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--rose)",
              }}
            >
              NEEDS WORK
            </div>
            <div className="space-y-2">
              {interview.needsWork.map((area: string) => (
                <div
                  key={area}
                  className="text-sm flex items-start gap-2"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ color: "var(--rose)" }}>✗</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Q&A Breakdown */}
        <div className="mb-16">
          <div
            className="text-[10px] tracking-[0.2em] uppercase mb-6"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            FULL Q&A BREAKDOWN
          </div>
          <div className="space-y-4">
            {transcript.map((item, idx) => (
              <QuestionBreakdown key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex gap-4">
          <Link
            href="/interview/new-session?mode=technical&company=Google&difficulty=senior&questions=8"
            className="flex-1 py-4 px-6 text-sm font-medium tracking-wide text-center transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "4px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            <RotateCcw className="inline mr-2" size={16} />
            Retry Similar Session
          </Link>

          <button
            className="px-6 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/5"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            <Download className="inline mr-2" size={16} />
            Download Report
          </button>

          <Link
            href="/interview"
            className="px-6 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/5"
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  const normalizedScore = score / 10;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - normalizedScore * circumference;

  const strokeColor =
    score >= 80
      ? "var(--emerald)"
      : score >= 60
        ? "var(--amber)"
        : "var(--rose)";

  return (
    <div className="text-center">
      <svg width="120" height="120" className="mx-auto mb-2">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{
            animation: "ringFill 1.2s ease forwards",
            animationDelay: `${delay}ms`,
            strokeDashoffset: circumference,
            ["--target-offset" as any]: offset,
          }}
        />
        {/* Score text */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "24px",
            fill: "var(--text-primary)",
          }}
        >
          {(score / 10).toFixed(1)}
        </text>
      </svg>
      <div
        className="text-xs"
        style={{
          fontFamily: "var(--font-dm-mono)",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function QuestionBreakdown({ item, index }: { item: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreColor =
    item.score >= 8
      ? "var(--emerald)"
      : item.score >= 6
        ? "var(--amber)"
        : "var(--rose)";

  return (
    <div
      className="border"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
        borderRadius: "6px",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-6">
          <div
            className="text-sm font-medium"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--amber)",
            }}
          >
            Q{index + 1}
          </div>
          <div
            className="text-sm text-left"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-primary)",
            }}
          >
            {item.question}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="text-sm font-medium"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: scoreColor,
            }}
          >
            Score: {item.score}/10
          </div>
          <div className="flex gap-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-4 rounded-full"
                style={{
                  background: i < item.score ? scoreColor : "var(--text-dim)",
                  opacity: i < item.score ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          <div
            className="h-px"
            style={{ background: "var(--border-subtle)" }}
          />

          {/* Your Answer */}
          <div>
            <div
              className="text-xs uppercase tracking-wide mb-2"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              YOUR ANSWER
            </div>
            <div
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "#ccc",
              }}
            >
              {item.answer}
            </div>
          </div>

          {/* Gold Standard */}
          {item.suggestedAnswer && (
            <div
              className="p-4 border-l-2"
              style={{
                background: "rgba(245, 158, 11, 0.04)",
                borderColor: "rgba(245, 158, 11, 0.3)",
                borderRadius: "4px",
              }}
            >
              <div
                className="text-xs uppercase tracking-wide mb-2"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--amber)",
                }}
              >
                GOLD STANDARD
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "#888",
                }}
              >
                {item.suggestedAnswer}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div>
            <div
              className="text-xs uppercase tracking-wide mb-2"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              FEEDBACK
            </div>
            <div
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "#888",
              }}
            >
              {item.feedback}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
