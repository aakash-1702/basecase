"use client";

import { useState, useEffect } from "react";
import { StartInterviewModal } from "../StartInterviewModal";
import {
  PremiumGateOverlay,
  BlurredReportPreview,
} from "../PremiumGateOverlay";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Clock,
  Sparkles,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ── Types ── */
interface InterviewData {
  id: string;
  company: string;
  mode: string;
  status: string;
  difficulty: string | null;
  questionLimit: number | null;
  startedAt: string;
  completedAt: string | null;
  feedback: {
    overallScore: number;
    confidence?: { score: number };
    depthReview?: { score: number };
    englishQuality?: { score: number };
  } | null;
}

/* ── Score Ring SVG ── */
function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 10) * circumference;
  const color =
    score >= 8
      ? "#10b981"
      : score >= 6
        ? "#f59e0b"
        : score >= 4
          ? "#f97316"
          : "#f43f5e";

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={2.5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={size * 0.28}
        fontFamily="var(--font-dm-mono)"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

/* ── Loading Skeleton ── */
function CardSkeleton() {
  return (
    <div
      className="p-6 border animate-pulse"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
        borderRadius: "8px",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 w-24 rounded bg-white/[0.06] mb-2" />
          <div className="h-3 w-36 rounded bg-white/[0.04]" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-[3px] w-full rounded-full bg-white/[0.04]" />
        <div className="h-[3px] w-3/4 rounded-full bg-white/[0.04]" />
      </div>
      <div className="flex gap-1">
        <div className="h-5 w-14 rounded bg-white/[0.04]" />
        <div className="h-5 w-14 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

interface InterviewLandingProps {
  isPremium?: boolean;
}

export function InterviewLanding({ isPremium = false }: InterviewLandingProps) {
  const [showModal, setShowModal] = useState(false);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for delete confirmation flow
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch interviews function (extracted for reuse in polling)
  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/interview");
      const json = await res.json();
      if (json.success && json.data) {
        setInterviews(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleDeleteInterview = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    const toastId = toast.loading("Deleting interview...");

    try {
      const res = await fetch(`/api/interview/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Interview deleted", { id: toastId });
        setInterviews((prev) => prev.filter((i) => i.id !== deleteTargetId));
      } else {
        toast.error(data.message || "Failed to delete interview", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("An error occurred while deleting", { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const pendingInterviews = interviews.filter((i) => i.status === "notStarted");
  const processingInterviews = interviews.filter(
    (i) => i.status === "processing",
  );
  const pastInterviews = interviews.filter(
    (i) => i.status !== "notStarted" && i.status !== "processing",
  );

  const completedWithScores = pastInterviews.filter(
    (i) => i.feedback?.overallScore != null,
  );
  const avgScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce(
          (acc, i) => acc + (i.feedback?.overallScore ?? 0),
          0,
        ) / completedWithScores.length
      : 0;
  const sessionCount = interviews.length;

  // Auto-refresh when processing interviews exist (poll every 15s)
  useEffect(() => {
    if (processingInterviews.length === 0) return;
    const interval = setInterval(() => {
      fetchInterviews();
    }, 15000);
    return () => clearInterval(interval);
  }, [processingInterviews.length]);

  // For free users, show a promotional landing page
  if (!isPremium) {
    return (
      <div className="relative">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-12">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.15)",
              animation: "fadeSlideUp 0.5s ease backwards",
            }}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "var(--amber)" }}
            />
            <span
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--amber)",
              }}
            >
              Pro Feature
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.1]"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
              animation: "fadeSlideUp 0.5s ease 0.05s backwards",
            }}
          >
            One decision could
            <br />
            <span style={{ color: "var(--amber)" }}>shape your career.</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-2xl leading-relaxed mb-10"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "#737373",
              animation: "fadeSlideUp 0.5s ease 0.1s backwards",
            }}
          >
            Most candidates fail FAANG interviews not because they lack skill —
            but because they never practiced with real pressure. Our AI
            interviewer mirrors the exact patterns, pacing, and follow-ups
            you'll face at Google, Amazon, Meta, and more.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-start gap-4 mb-16"
            style={{ animation: "fadeSlideUp 0.5s ease 0.15s backwards" }}
          >
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "var(--amber)",
                color: "#000",
                borderRadius: "8px",
                fontFamily: "var(--font-dm-mono)",
              }}
            >
              Unlock Interview Prep
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <span
              className="text-xs self-center"
              style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
            >
              Starting at ₹499/month
            </span>
          </div>
        </div>

        {/* Screenshot showcase */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(249,115,22,0.05) 0%, transparent 100%)",
              border: "1px solid rgba(249,115,22,0.1)",
              animation: "fadeSlideUp 0.5s ease 0.2s backwards",
            }}
          >
            {/* Main screenshot */}
            <div className="relative">
              <Image
                src="/interview/Screenshot 2026-03-09 194317.png"
                alt="Interview Room"
                width={1200}
                height={675}
                className="w-full rounded-t-xl"
                style={{
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
                priority
              />
              {/* Gradient overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{
                  background:
                    "linear-gradient(to top, #0a0a0a 0%, transparent 100%)",
                }}
              />
            </div>
          </div>

          {/* Caption */}
          <p
            className="text-center mt-6 text-xs"
            style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
          >
            Voice-first interview simulation with real-time AI feedback
          </p>
        </div>

        {/* Feature highlights */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="text-center mb-12"
            style={{ animation: "fadeSlideUp 0.5s ease 0.25s backwards" }}
          >
            <h2
              className="text-2xl md:text-3xl mb-4"
              style={{
                fontFamily: "var(--font-dm-serif)",
                color: "var(--text-primary)",
              }}
            >
              What makes this different
            </h2>
            <p
              className="text-sm max-w-xl mx-auto"
              style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
            >
              Not another coding platform. A real interview simulator that
              listens, responds, and pushes you like a real FAANG interviewer
              would.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Voice-First Design",
                desc: "Speak naturally. The AI listens, processes, and responds just like a human interviewer.",
                icon: "🎙️",
              },
              {
                title: "Company-Specific Patterns",
                desc: "Google's system design focus. Amazon's leadership principles. Meta's move fast culture. We know them all.",
                icon: "🎯",
              },
              {
                title: "Brutally Honest Feedback",
                desc: "No participation trophies. Detailed scores on confidence, depth, clarity, and technical accuracy.",
                icon: "📊",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 transition-all duration-300 hover:border-amber-500/30"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  animation: `fadeSlideUp 0.5s ease ${0.3 + i * 0.05}s backwards`,
                }}
              >
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3
                  className="text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "#525252",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* More screenshots */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                animation: "fadeSlideUp 0.5s ease 0.4s backwards",
              }}
            >
              <Image
                src="/interview/Screenshot 2026-03-09 194328.png"
                alt="AI Interviewer"
                width={600}
                height={400}
                className="w-full"
                style={{ opacity: 0.9 }}
              />
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                animation: "fadeSlideUp 0.5s ease 0.45s backwards",
              }}
            >
              <Image
                src="/interview/Screenshot 2026-03-09 194431.png"
                alt="Feedback Report"
                width={600}
                height={400}
                className="w-full"
                style={{ opacity: 0.9 }}
              />
            </div>
          </div>
        </div>

        {/* Interview modes */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <h2
            className="text-xl mb-8"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
              animation: "fadeSlideUp 0.5s ease 0.5s backwards",
            }}
          >
            Every interview type. Covered.
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "DSA",
                desc: "LeetCode-style problems with live discussion",
              },
              { label: "Technical", desc: "System design, OS, DBMS, and more" },
              { label: "HR", desc: "Behavioural and leadership scenarios" },
              {
                label: "Behavioural",
                desc: "STAR method situational questions",
              },
            ].map((mode, i) => (
              <div
                key={i}
                className="px-5 py-4 transition-all duration-300 hover:border-amber-500/30"
                style={{
                  background: "rgba(249,115,22,0.03)",
                  border: "1px solid rgba(249,115,22,0.1)",
                  borderRadius: "8px",
                  animation: `fadeSlideUp 0.5s ease ${0.55 + i * 0.05}s backwards`,
                }}
              >
                <div
                  className="text-sm font-medium mb-1"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--amber)",
                  }}
                >
                  {mode.label}
                </div>
                <div
                  className="text-[11px]"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "#525252",
                  }}
                >
                  {mode.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial / Social proof */}
        <div
          className="max-w-3xl mx-auto px-6 pb-20 text-center"
          style={{ animation: "fadeSlideUp 0.5s ease 0.7s backwards" }}
        >
          <div
            className="relative p-8 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>
              "
            </div>
            <p
              className="text-base leading-relaxed mb-6"
              style={{
                fontFamily: "var(--font-dm-serif)",
                color: "var(--text-primary)",
              }}
            >
              I bombed my first Google interview because I froze under pressure.
              After 20 sessions on BaseCase, I walked into my Amazon loop
              feeling like I'd done it a hundred times. Got the offer.
            </p>
            <div
              className="text-xs"
              style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
            >
              — SDE at Amazon, previously rejected at Google
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="max-w-6xl mx-auto px-6 pb-24"
          style={{ animation: "fadeSlideUp 0.5s ease 0.75s backwards" }}
        >
          <div
            className="text-center p-12 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)",
              border: "1px solid rgba(249,115,22,0.15)",
            }}
          >
            <h2
              className="text-2xl md:text-3xl mb-4"
              style={{
                fontFamily: "var(--font-dm-serif)",
                color: "var(--text-primary)",
              }}
            >
              Stop preparing alone.
            </h2>
            <p
              className="text-sm max-w-lg mx-auto mb-8"
              style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
            >
              The difference between candidates who get offers and those who
              don't isn't just skill — it's practice under pressure.
            </p>
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 px-10 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "var(--amber)",
                color: "#000",
                borderRadius: "8px",
                fontFamily: "var(--font-dm-mono)",
              }}
            >
              Start Your Prep Today
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
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
                <div
                  className="text-2xl font-semibold"
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    color: "var(--text-primary)",
                  }}
                >
                  {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                </div>
                <div
                  className="text-[10px] tracking-[0.1em] uppercase"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  Avg Score
                </div>
              </div>
              <div className="w-px bg-white/6" />
              <div>
                <div
                  className="text-2xl font-semibold"
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    color: "var(--text-primary)",
                  }}
                >
                  {sessionCount}
                </div>
                <div
                  className="text-[10px] tracking-[0.1em] uppercase"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  Sessions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PENDING INTERVIEWS ── */}
        {(isLoading || pendingInterviews.length > 0) && (
          <div className="max-w-5xl mx-auto px-6 pb-16">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <div
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--amber)",
                  }}
                >
                  Pending Interviews
                </div>
              </div>
              <span
                className="text-[11px]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-dim)",
                }}
              >
                {isLoading ? "..." : `${pendingInterviews.length} waiting`}
              </span>
            </div>

            <div
              className="h-px mb-6"
              style={{ background: "var(--border-subtle)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                pendingInterviews.map((interview, idx) => (
                  <PendingInterviewCard
                    key={interview.id}
                    interview={interview}
                    delay={idx * 70}
                    onDeleteClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTargetId(interview.id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}
        {/* ── PROCESSING INTERVIEWS ── */}
        {processingInterviews.length > 0 && (
          <div className="max-w-5xl mx-auto px-6 pb-16">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--amber)" }}
                />
                <div
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--amber)",
                  }}
                >
                  Processing
                </div>
              </div>
              <span
                className="text-[11px]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-dim)",
                }}
              >
                {processingInterviews.length} generating report{processingInterviews.length > 1 ? "s" : ""}
              </span>
            </div>

            <div
              className="h-px mb-6"
              style={{ background: "var(--border-subtle)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processingInterviews.map((interview, idx) => (
                <div
                  key={interview.id}
                  className="relative p-6 border overflow-hidden"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "rgba(245,158,11,0.15)",
                    borderRadius: "8px",
                    animation: "fadeSlideUp 0.4s ease forwards",
                    animationDelay: `${idx * 70}ms`,
                    opacity: 0,
                  }}
                >
                  {/* Shimmer overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(245,158,11,0.04), transparent)",
                      backgroundSize: "400px 100%",
                      animation: "shimmer 2.5s ease-in-out infinite",
                    }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className="text-sm font-medium mb-0.5"
                        style={{
                          fontFamily: "var(--font-dm-mono)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {interview.company}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{
                          fontFamily: "var(--font-dm-mono)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {interview.mode}
                        {interview.difficulty && (
                          <>
                            <span style={{ margin: "0 6px", opacity: 0.3 }}>·</span>
                            {interview.difficulty}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pulsing processing indicator */}
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded"
                      style={{
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.15)",
                      }}
                    >
                      <span
                        className="w-1 h-1 rounded-full animate-pulse"
                        style={{ background: "var(--amber)" }}
                      />
                      <span
                        className="text-[10px] tracking-wide uppercase"
                        style={{
                          fontFamily: "var(--font-dm-mono)",
                          color: "var(--amber)",
                        }}
                      >
                        Processing
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-xs mt-3"
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      color: "var(--text-dim)",
                    }}
                  >
                    Your feedback report is being generated…
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAST SESSIONS (completed only) ── */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-5">
            <div
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--amber)",
              }}
            >
              Past Sessions
            </div>
            <span
              className="text-[11px]"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-dim)",
              }}
            >
              {isLoading ? "..." : `${pastInterviews.length} total`}
            </span>
          </div>

          <div
            className="h-px mb-6"
            style={{ background: "var(--border-subtle)" }}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : pastInterviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastInterviews.map((interview, idx) => (
                <CompletedInterviewCard
                  key={interview.id}
                  interview={interview}
                  delay={idx * 70}
                  onDeleteClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTargetId(interview.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              className="py-16 text-center border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                borderRadius: "8px",
              }}
            >
              <p
                className="text-sm"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-muted)",
                }}
              >
                No completed sessions yet.
              </p>
              <p
                className="text-xs mt-1"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-dim)",
                }}
              >
                Start your first mock interview above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTargetId(null)}
      >
        <AlertDialogContent className="bg-[#0f0f0f] border-white/6 text-white">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="font-dm-serif text-xl">
              Delete Interview?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 font-dm-mono text-sm leading-relaxed">
              This action cannot be undone. The interview session, performance
              metrics, and all associated AI feedback will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteInterview();
              }}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all shadow-none"
            >
              {isDeleting ? "Deleting..." : "Delete Interview"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showModal && <StartInterviewModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ── Pending Interview Card ── */
function PendingInterviewCard({
  interview,
  delay,
  onDeleteClick,
}: {
  interview: InterviewData;
  delay: number;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  const timeAgo = formatTimeAgo(interview.startedAt);

  return (
    <Link
      href={`/interview/new-session?interviewId=${interview.id}&mode=${interview.mode}&company=${interview.company}&difficulty=${interview.difficulty || "senior"}&questions=${interview.questionLimit || 8}`}
    >
      <div
        className="group relative p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30 cursor-pointer overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          borderRadius: "8px",
          animation: "fadeSlideUp 0.4s ease forwards",
          animationDelay: `${delay}ms`,
          opacity: 0,
        }}
      >
        {/* Delete Button */}
        <button
          onClick={onDeleteClick}
          className="absolute top-3 right-3 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 z-20 text-white/[0.4] hover:text-white"
          aria-label="Delete interview"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-primary)",
                }}
              >
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
                {interview.mode}
              </span>
            </div>
            <div
              className="text-[11px]"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              {interview.questionLimit || "—"} questions ·{" "}
              {interview.difficulty || "—"}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Status Banner */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded mb-4"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.12)",
            borderRadius: "6px",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--amber)" }} />
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}
          >
            Ready to begin — Join Room
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
          <span
            className="text-[11px] font-medium group-hover:underline flex items-center gap-1"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}
          >
            Join Room
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Completed Interview Card ── */
function CompletedInterviewCard({
  interview,
  delay,
  onDeleteClick,
}: {
  interview: InterviewData;
  delay: number;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  const score = interview.feedback?.overallScore ?? 0;
  const metricColor = (val: number) =>
    val >= 85
      ? "#10b981"
      : val >= 70
        ? "#f59e0b"
        : val >= 55
          ? "#f97316"
          : "#f43f5e";

  const confidenceScore = (interview.feedback?.confidence as any)?.score ?? 0;
  const depthScore = (interview.feedback?.depthReview as any)?.score ?? 0;
  const englishScore = (interview.feedback?.englishQuality as any)?.score ?? 0;

  // Calculate Efficiency Score (average of confidence and depth)
  const efficiencyScore = Math.round((confidenceScore + depthScore) / 2) * 10;

  const statusLabel =
    interview.status === "processing" ? "Processing…" : "Completed";
  const statusColor =
    interview.status === "processing"
      ? "var(--amber)"
      : "var(--emerald, #10b981)";

  const timeAgo = formatTimeAgo(interview.completedAt || interview.startedAt);

  return (
    <Link href={`/interview/${interview.id}/report`}>
      <div
        className="group relative p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.1] cursor-pointer overflow-hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          borderRadius: "8px",
          animation: "fadeSlideUp 0.4s ease forwards",
          animationDelay: `${delay}ms`,
          opacity: 0,
        }}
      >
        {/* Delete Button */}
        <button
          onClick={onDeleteClick}
          className="absolute top-3 right-3 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 z-20 text-white/[0.4] hover:text-white"
          aria-label="Delete interview"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-primary)",
                }}
              >
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
                {interview.mode}
              </span>
            </div>
            <div
              className="flex items-center gap-2 text-[11px]"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              <span>{timeAgo}</span>
              <span>·</span>
              <span>{interview.questionLimit ?? "—"} questions</span>
            </div>
          </div>
        </div>

        {/* Expanded Scores Section */}
        {interview.feedback ? (
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/[0.04]">
            <div className="flex-shrink-0 flex items-center justify-center bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
              <ScoreRing score={score} size={48} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div
                className="text-[10px] uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-muted)",
                }}
              >
                Overall Score
              </div>
              <div
                className="text-xl font-medium"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  color: "var(--text-primary)",
                }}
              >
                {score.toFixed(1)}{" "}
                <span className="text-[12px] text-zinc-500">/ 10</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div
              className="inline-block px-2 py-1 rounded text-[9px] uppercase tracking-wider"
              style={{
                background:
                  interview.status === "processing"
                    ? "var(--amber-dim)"
                    : "rgba(16,185,129,0.08)",
                color: statusColor,
                fontFamily: "var(--font-dm-mono)",
              }}
            >
              {statusLabel}
            </div>
          </div>
        )}

        {/* Metric bars (only if feedback exists) */}
        {interview.feedback && (
          <div className="space-y-1.5 mb-4">
            {[
              { label: "Efficiency", val: efficiencyScore },
              { label: "Confidence", val: confidenceScore * 10 },
              { label: "Depth", val: depthScore * 10 },
              { label: "Clarity", val: englishScore * 10 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span
                  className="text-[10px] w-[58px] shrink-0"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color:
                      m.label === "Efficiency"
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {m.label}
                </span>
                <div className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${m.val}%`,
                      background: metricColor(m.val),
                    }}
                  />
                </div>
                <span
                  className="text-[10px] w-5 text-right"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color:
                      m.label === "Efficiency"
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {Math.round(m.val / 10)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex gap-1">
            <span
              className="px-2 py-0.5 rounded text-[9px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-dm-mono)",
              }}
            >
              {interview.difficulty || "—"}
            </span>
          </div>
          <span
            className="text-[11px] font-medium group-hover:underline flex items-center gap-1"
            style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}
          >
            Report
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Helper ── */
function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
