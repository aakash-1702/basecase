"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { StartInterviewModal } from "../StartInterviewModal";
import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
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

interface InterviewLandingProps {
  isPremium?: boolean;
  initialCredits?: number;
  expiresAt?: string | null;
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

/* ── Full-Page Skeleton ── */
function PageSkeleton() {
  return (
    <div className="interview-ambient-bg interview-grid-overlay min-h-screen">
      {/* Hero banner skeleton */}
      <div
        style={{
          height: 88,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: "1.75rem auto 0",
          padding: "0 2rem",
        }}
      >
        {/* Analytics cards skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            marginBottom: "2.5rem",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 96,
                borderRadius: 12,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div className="skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Section skeletons */}
        {[0, 1, 2].map((section) => (
          <div key={section} style={{ marginTop: "2rem" }}>
            <div
              style={{
                height: 20,
                width: 120,
                borderRadius: 4,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "1rem",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div className="skeleton-shimmer" />
            </div>
            {[0, 1].map((card) => (
              <div
                key={card}
                style={{
                  height: 72,
                  borderRadius: 10,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div className="skeleton-shimmer" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(245,158,11,0.05) 50%,
            transparent 100%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ── Padlock SVG ── */
function LockIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--amber)"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export function InterviewLanding({
  isPremium = false,
  initialCredits = 0,
  expiresAt = null,
}: InterviewLandingProps) {
  const [showModal, setShowModal] = useState(false);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const interviewCredits = initialCredits;
  const premium = isPremium;

  /* ── Data fetching ── */
  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/interview");
      let json: any = null;

      try {
        json = await res.json();
      } catch {
        throw new Error("Invalid server response while fetching interviews");
      }

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to fetch interviews");
      }

      setInterviews(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong fetching interviews",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  /* ── Delete handler ── */
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
    } catch {
      toast.error("An error occurred while deleting", { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  /* ── Memoized pipeline categorisation ── */
  const pendingInterviews = useMemo(
    () => interviews.filter((i) => i.status === "notStarted"),
    [interviews],
  );
  const processingInterviews = useMemo(
    () => interviews.filter((i) => i.status === "processing"),
    [interviews],
  );
  const pastInterviews = useMemo(
    () =>
      interviews.filter(
        (i) => i.status !== "notStarted" && i.status !== "processing",
      ),
    [interviews],
  );

  /* ── Polling with visibilitychange optimisation ── */
  useEffect(() => {
    if (processingInterviews.length === 0) return;

    pollRef.current = setInterval(fetchInterviews, 15000);

    const handleVisibility = () => {
      if (document.hidden) {
        if (pollRef.current) clearInterval(pollRef.current);
      } else {
        pollRef.current = setInterval(fetchInterviews, 15000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [processingInterviews.length]);

  /* ── Analytics ── */
  const completedWithScores = pastInterviews.filter(
    (i) => i.feedback?.overallScore != null,
  );
  const avgScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce(
          (acc, i) => acc + (i.feedback?.overallScore ?? 0),
          0,
        ) / completedWithScores.length
      : null;
  const sessionCount = interviews.length;

  /* ── Loading skeleton ── */
  if (isLoading) return <PageSkeleton />;

  /* ══════════════════════════════════════
     STATE A — Non-premium / zero credits
  ══════════════════════════════════════ */
  if (!premium && interviewCredits === 0) {
    return (
      <div
        className="interview-ambient-bg interview-grid-overlay"
        style={{ minHeight: "100vh" }}
      >
        {/* ── HERO ── */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(3rem, 6vw, 5rem) 2rem clamp(2.5rem, 4vw, 4rem)",
          }}
        >
          <div className="promo-hero-grid">
            {/* Left column */}
            <div style={{ animation: "fadeSlideUp 0.45s ease backwards" }}>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.16em",
                  color: "var(--amber)",
                  marginBottom: "1.25rem",
                  textTransform: "uppercase",
                }}
              >
                AI Mock Interviews
              </p>

              <h1
                style={{
                  fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Interview like someone <br className="hero-br" />
                who&apos;s{" "}
                <span style={{ color: "var(--amber)" }}>already done it.</span>
              </h1>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  maxWidth: 460,
                  marginTop: "1rem",
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                }}
              >
                AI-powered mock interviews tailored to your resume, your stack,
                and the exact role you&apos;re targeting.
              </p>

              <Link
                href="/subscription"
                prefetch
                className="promo-cta-btn"
                style={{
                  display: "inline-block",
                  marginTop: "1.75rem",
                  background: "var(--amber)",
                  color: "#000",
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "11px 22px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Unlock Interview Access →
              </Link>
            </div>

            {/* Right column — Locked preview card */}
            <div
              style={{
                position: "relative",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 14,
                padding: "1.5rem",
                overflow: "hidden",
                minHeight: 260,
                animation: "fadeSlideUp 0.45s ease 0.2s backwards",
              }}
            >
              {/* Fake session rows */}
              <div
                style={{
                  height: 48,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  height: 48,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  height: 48,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                }}
              />

              {/* Lock overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(8,8,8,0.78)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                }}
              >
                <LockIcon />
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.8rem",
                    letterSpacing: "0.1em",
                    color: "var(--amber)",
                    marginTop: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Premium Only
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF STRIP ── */}
        <div
          style={{
            background: "rgba(15,15,15,0.9)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "1.5rem 2rem",
          }}
        >
          <div className="proof-strip-inner">
            {[
              {
                value: "30+",
                sub: "engineers interviewed on BaseCase",
              },
              {
                value: "4 modes",
                sub: "DSA · Technical · HR · Behavioural",
              },
              {
                value: "FAANG-style",
                sub: "real interview question patterns",
              },
              {
                value: "Repo-aware",
                sub: "questions from your GitHub projects",
              },
            ].map((stat, idx) => (
              <div key={idx} className="proof-stat-block">
                <div
                  style={{
                    fontFamily:
                      "var(--font-dm-serif), 'DM Serif Display', serif",
                    fontSize: "1.4rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES GRID ── */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "4rem 2rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
              fontSize: "1.6rem",
              color: "var(--text-primary)",
              marginBottom: "2rem",
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need to land the role
          </h2>

          <div className="features-grid-wrapper">
            {[
              {
                label: "DSA",
                title: "Data Structures & Algorithms",
                desc: "LeetCode-style questions with real-time difficulty calibration. Start approachable, finish hard.",
              },
              {
                label: "System Design",
                title: "Architecture & Scale",
                desc: "Design distributed systems under pressure. Evaluated on your reasoning and tradeoffs, not vocabulary.",
              },
              {
                label: "Behavioural",
                title: "STAR-format Coaching",
                desc: "Structure your stories. Get scored on clarity, confidence, and communication quality.",
              },
              {
                label: "Project-Based",
                title: "From Your GitHub Repo",
                desc: "Questions generated from your actual codebase. If you built it, you can explain it.",
              },
            ].map((card, idx) => (
              <div key={idx} className="feature-card">
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.68rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                  }}
                >
                  {card.label}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: 6,
                    marginBottom: 0,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "var(--text-muted)",
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <section
          style={{
            padding: "5rem 2rem",
            textAlign: "center",
            background: "var(--bg-base)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
              fontSize: "2rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            One session away from interview-ready.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginTop: "0.5rem",
            }}
          >
            Join 30+ engineers already simulating real interviews on BaseCase.
          </p>
          <Link
            href="/subscription"
            prefetch
            className="promo-cta-btn"
            style={{
              display: "inline-block",
              marginTop: "1.75rem",
              background: "var(--amber)",
              color: "#000",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.85rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              padding: "11px 22px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Unlock Interview Access →
          </Link>
          <p
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.7rem",
              color: "var(--text-dim)",
              marginTop: 12,
            }}
          >
            No credit card required to explore the platform
          </p>
        </section>

        {/* Scoped styles for State A */}
        <style>{`
          .promo-hero-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
          }
          @media (max-width: 767px) {
            .promo-hero-grid {
              grid-template-columns: 1fr;
            }
            .hero-br { display: none; }
          }

          .promo-cta-btn {
            transition: background 180ms ease, transform 180ms ease;
          }
          .promo-cta-btn:hover {
            background: #d97706 !important;
            transform: translateY(-1px);
          }
          .promo-cta-btn:active {
            transform: translateY(0);
          }

          .proof-strip-inner {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            gap: 0;
            align-items: stretch;
            justify-content: center;
          }
          .proof-stat-block {
            padding: 0 2.5rem;
            text-align: center;
            flex: 1 1 160px;
            border-right: 1px solid var(--border-subtle);
          }
          .proof-stat-block:last-child {
            border-right: none;
          }
          @media (max-width: 639px) {
            .proof-strip-inner {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
            }
            .proof-stat-block {
              border-right: none;
              padding: 1rem;
            }
            .proof-stat-block:nth-child(1),
            .proof-stat-block:nth-child(2) {
              border-bottom: 1px solid var(--border-subtle);
            }
            .proof-stat-block:nth-child(odd) {
              border-right: 1px solid var(--border-subtle);
            }
          }

          .features-grid-wrapper {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1px;
            background: var(--border-subtle);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            overflow: hidden;
          }
          @media (max-width: 639px) {
            .features-grid-wrapper {
              grid-template-columns: 1fr;
            }
          }
          .feature-card {
            background: var(--bg-card);
            padding: 1.75rem;
            transition: background 200ms ease;
          }
          .feature-card:hover {
            background: rgba(20,20,20,0.95);
          }
        `}</style>
      </div>
    );
  }

  /* ══════════════════════════════════════
     STATE B — Premium Dashboard
  ══════════════════════════════════════ */
  return (
    <div
      className="interview-ambient-bg interview-grid-overlay"
      style={{ minHeight: "100vh" }}
    >
      {/* ── HERO BANNER ── */}
      <div
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "1.75rem 2rem",
        }}
      >
        <div className="dashboard-hero-inner">
          {/* Left */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
                fontSize: "1.45rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              You&apos;re closer than you think.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                letterSpacing: "0.04em",
                marginTop: 4,
              }}
            >
              Keep your streak alive. One session a day compounds fast.
            </p>
          </div>

          {/* Right */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Credits block */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Interview Credits
              </div>
              {interviewCredits === 0 ? (
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 3,
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    padding: "3px 10px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                  }}
                >
                  Exhausted
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color:
                      interviewCredits <= 2
                        ? "var(--amber)"
                        : "var(--text-primary)",
                    marginTop: 2,
                  }}
                >
                  {interviewCredits} remaining
                </div>
              )}
            </div>

            {/* Start button */}
            <button
              onClick={() => setShowModal(true)}
              disabled={interviewCredits === 0}
              style={{
                background: "var(--amber)",
                color: "#000",
                fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                cursor: interviewCredits === 0 ? "not-allowed" : "pointer",
                opacity: interviewCredits === 0 ? 0.4 : 1,
                pointerEvents: interviewCredits === 0 ? "none" : "auto",
                transition: "background 180ms ease, transform 180ms ease",
                flexShrink: 0,
              }}
              className="start-btn"
            >
              + Start New Session
            </button>
          </div>
        </div>
      </div>

      {/* ── ANALYTICS STRIP ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "1.75rem auto 0",
          padding: "0 2rem",
        }}
      >
        <div className="analytics-grid">
          {[
            {
              label: "Average Score",
              value: avgScore != null ? `${avgScore.toFixed(1)} / 10` : "—",
            },
            { label: "Sessions Taken", value: String(sessionCount) },
            {
              label: "Credits Remaining",
              value: String(interviewCredits),
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                padding: "1.25rem 1.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
                  fontSize: "2rem",
                  color: "var(--text-primary)",
                  marginTop: 6,
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SESSION PIPELINE ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "2rem auto",
          padding: "0 2rem 4rem",
        }}
      >
        {/* PENDING */}
        <PipelineSection
          title="Pending"
          count={pendingInterviews.length}
          showDot={pendingInterviews.length > 0}
          dotColor="var(--amber)"
          animate
        >
          {pendingInterviews.length === 0 ? (
            <EmptyState text="No pending interviews" />
          ) : (
            pendingInterviews.map((interview) => (
              <PendingCard
                key={interview.id}
                interview={interview}
                onDeleteClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteTargetId(interview.id);
                }}
              />
            ))
          )}
        </PipelineSection>

        {/* PROCESSING */}
        {processingInterviews.length > 0 && (
          <PipelineSection
            title="Processing"
            count={processingInterviews.length}
            showDot
            dotColor="var(--amber)"
            dotPulse
            animate
          >
            {processingInterviews.map((interview) => (
              <ProcessingCard key={interview.id} interview={interview} />
            ))}
          </PipelineSection>
        )}

        {/* COMPLETED */}
        <PipelineSection title="Past Sessions" count={pastInterviews.length}>
          {pastInterviews.length === 0 ? (
            <EmptyState text="No completed sessions yet — start your first above." />
          ) : (
            <>
              {pastInterviews.slice(0, visibleCount).map((interview) => (
                <CompletedCard
                  key={interview.id}
                  interview={interview}
                  onDeleteClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTargetId(interview.id);
                  }}
                />
              ))}
              {pastInterviews.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => c + 5)}
                  style={{
                    color: "var(--amber)",
                    background: "transparent",
                    border: "none",
                    fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    marginTop: 8,
                    letterSpacing: "0.04em",
                    padding: 0,
                  }}
                >
                  Show {Math.min(5, pastInterviews.length - visibleCount)} more
                  →
                </button>
              )}
            </>
          )}
        </PipelineSection>
      </div>

      {/* ── DELETE DIALOG — completely unchanged ── */}
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

      {showModal && (
        <StartInterviewModal
          onClose={() => setShowModal(false)}
          initialCredits={interviewCredits}
        />
      )}

      {/* Scoped styles for State B */}
      <style>{`
        .dashboard-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 639px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
        .start-btn:hover:not(:disabled) {
          background: #d97706 !important;
          transform: translateY(-1px);
        }
        .start-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PIPELINE SECTION WRAPPER
══════════════════════════════════════════════════════ */
function PipelineSection({
  title,
  count,
  showDot,
  dotColor,
  dotPulse,
  animate,
  children,
}: {
  title: string;
  count: number;
  showDot?: boolean;
  dotColor?: string;
  dotPulse?: boolean;
  animate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "1rem",
        }}
      >
        {showDot && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dotColor ?? "var(--amber)",
              display: "inline-block",
            }}
            className={dotPulse ? "animate-pulse" : ""}
          />
        )}
        <span
          style={{
            fontFamily: "var(--font-dm-mono), DM Mono, monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {title}
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-dm-mono), DM Mono, monospace",
            fontSize: "0.7rem",
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "1.25rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-dm-mono), DM Mono, monospace",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ── Pending Card ── */
function PendingCard({
  interview,
  onDeleteClick,
}: {
  interview: InterviewData;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  const timeAgo = formatTimeAgo(interview.startedAt);
  return (
    <Link
      href={`/interview/new-session?interviewId=${interview.id}&mode=${interview.mode}&company=${interview.company}&difficulty=${interview.difficulty || "senior"}&questions=${interview.questionLimit || 8}`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="pipeline-card pending-card"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          transition: "border-color 180ms ease",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              display: "inline-block",
              background: "var(--amber-dim)",
              color: "var(--amber)",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 20,
              alignSelf: "flex-start",
            }}
          >
            {interview.mode}
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Clock size={11} />
            {timeAgo}
          </span>
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              border: "1px solid var(--amber)",
              color: "var(--amber)",
              background: "transparent",
              padding: "6px 14px",
              borderRadius: 6,
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.78rem",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Resume
          </span>
          <button
            onClick={onDeleteClick}
            style={{
              border: "none",
              color: "#f87171",
              background: "transparent",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.78rem",
              cursor: "pointer",
              padding: "6px 0",
              letterSpacing: "0.04em",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ── Processing Card ── */
function ProcessingCard({ interview }: { interview: InterviewData }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderLeft: "3px solid var(--amber)",
        borderRadius: 10,
        padding: "1rem 1.25rem",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              background: "var(--amber-dim)",
              color: "var(--amber)",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {interview.mode}
          </span>
          <p
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: 8,
              marginBottom: 2,
            }}
          >
            Analyzing your session...
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              margin: 0,
            }}
          >
            Results appear here when ready
          </p>
        </div>
        <span
          style={{
            background: "var(--amber-dim)",
            border: "1px solid rgba(245,158,11,0.15)",
            color: "var(--amber)",
            fontFamily: "var(--font-dm-mono), DM Mono, monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          Processing
        </span>
      </div>
    </div>
  );
}

/* ── Completed Card ── */
function CompletedCard({
  interview,
  onDeleteClick,
}: {
  interview: InterviewData;
  onDeleteClick: (e: React.MouseEvent) => void;
}) {
  const score = interview.feedback?.overallScore ?? 0;
  const confidenceScore = (interview.feedback?.confidence as any)?.score ?? 0;
  const depthScore = (interview.feedback?.depthReview as any)?.score ?? 0;
  const englishScore = (interview.feedback?.englishQuality as any)?.score ?? 0;
  const timeAgo = formatTimeAgo(interview.completedAt || interview.startedAt);

  const metricColor = (val: number) =>
    val >= 85
      ? "#10b981"
      : val >= 70
        ? "#f59e0b"
        : val >= 55
          ? "#f97316"
          : "#f43f5e";

  return (
    <Link
      href={`/interview/${interview.id}/report`}
      style={{ textDecoration: "none" }}
    >
      <div
        className="completed-card"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          padding: "1.25rem",
          marginBottom: 8,
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
          transition: "border-color 180ms ease",
          position: "relative",
        }}
      >
        {/* Score ring */}
        {interview.feedback && (
          <div style={{ flexShrink: 0 }}>
            <ScoreRing score={score} size={48} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {interview.company}
            </span>
            <span
              style={{
                background: "var(--amber-dim)",
                color: "var(--amber)",
                fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              {interview.mode}
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              margin: "0 0 8px 0",
            }}
          >
            {timeAgo} · {interview.questionLimit ?? "—"} questions ·{" "}
            {interview.difficulty ?? "—"}
          </p>

          {/* Mini metrics */}
          {interview.feedback && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Confidence", val: confidenceScore * 10 },
                { label: "Depth", val: depthScore * 10 },
                { label: "Clarity", val: englishScore * 10 },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      width: 62,
                      flexShrink: 0,
                    }}
                  >
                    {m.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.04)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${m.val}%`,
                        height: "100%",
                        background: metricColor(m.val),
                        transition: "width 700ms ease",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono), DM Mono, monospace",
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      width: 18,
                      textAlign: "right",
                    }}
                  >
                    {Math.round(m.val / 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="view-report-btn"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.78rem",
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              transition: "border-color 180ms ease, color 180ms ease",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            View Report
          </span>
          <button
            onClick={onDeleteClick}
            style={{
              border: "none",
              color: "#f87171",
              background: "transparent",
              fontFamily: "var(--font-dm-mono), DM Mono, monospace",
              fontSize: "0.72rem",
              cursor: "pointer",
              padding: 0,
              letterSpacing: "0.04em",
            }}
          >
            Delete
          </button>
        </div>

        {/* Hover styles injected via global style tag below */}
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
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
