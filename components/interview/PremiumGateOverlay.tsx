"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  Check,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

interface PremiumGateOverlayProps {
  onClose?: () => void;
}

export function PremiumGateOverlay({ onClose }: PremiumGateOverlayProps) {
  const [showFeatures, setShowFeatures] = useState(false);

  const features = [
    { text: "Unlimited mock interviews", included: true },
    { text: "Full AI feedback report after every session", included: true },
    {
      text: "Score across confidence, depth, english, technical accuracy",
      included: true,
    },
    { text: "Company-specific interview patterns", included: true },
    { text: "HR, Behavioural, DSA, Technical modes", included: true },
    { text: "No mock interviews", included: false, isCurrent: true },
  ];

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      {/* Floating Card */}
      <div
        className="relative w-full max-w-md mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            "linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)",
          border: "1px solid rgba(249,115,22,0.15)",
          borderRadius: "16px",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(249,115,22,0.05)",
          animation: "floatIn 0.4s ease forwards",
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 hover:bg-white/[0.05]"
            style={{ color: "#525252" }}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Pro Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.2)",
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: "var(--amber)" }} />
            <span
              className="text-[10px] tracking-[0.15em] uppercase font-medium"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--amber)",
              }}
            >
              BaseCase Pro
            </span>
          </div>
        </div>

        {/* Main Copy */}
        <h2
          className="text-xl mb-3 leading-snug"
          style={{
            fontFamily: "var(--font-dm-serif)",
            color: "var(--text-primary)",
          }}
        >
          Mock interviews are a Pro feature
        </h2>

        <p
          className="text-[13px] leading-relaxed mb-8"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "#525252",
          }}
        >
          Experience the closest simulation to a real FAANG interview.
          <br />
          Upgrade to run unlimited sessions with full feedback reports.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-3 mb-6">
          <div
            className="px-4 py-3 flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            ₹499/mo
          </div>
          <Link
            href="/subscription"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "8px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            Upgrade Now
            <span style={{ fontSize: "16px" }}>→</span>
          </Link>
        </div>

        {/* Expandable Features */}
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full flex items-center justify-center gap-2 py-2 transition-colors duration-200 hover:opacity-80"
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          See what's included
          {showFeatures ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showFeatures && (
          <div
            className="mt-4 pt-4 space-y-2.5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {feature.included ? (
                  <Check
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#10b981" }}
                  />
                ) : (
                  <X
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#ef4444" }}
                  />
                )}
                <span
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: feature.isCurrent
                      ? "#ef4444"
                      : feature.included
                        ? "var(--text-primary)"
                        : "#525252",
                    opacity: feature.isCurrent ? 0.8 : 1,
                  }}
                >
                  {feature.text}
                  {feature.isCurrent && (
                    <span style={{ marginLeft: "6px", opacity: 0.6 }}>
                      ← your plan
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Social Proof */}
        <p
          className="mt-6 text-center text-[11px]"
          style={{
            fontFamily: "var(--font-dm-mono)",
            color: "#2a2a2a",
          }}
        >
          Hundreds of engineers use BaseCase to prep for FAANG interviews
        </p>
      </div>

      <style jsx>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Blurred Report Preview ── */
export function BlurredReportPreview() {
  return (
    <div
      className="relative mt-12 mx-auto max-w-2xl p-6 overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
      }}
    >
      {/* Lock overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        style={{
          background: "rgba(10,10,10,0.6)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Lock className="w-8 h-8 mb-3" style={{ color: "#525252" }} />
        <p
          className="text-xs"
          style={{ fontFamily: "var(--font-dm-mono)", color: "#525252" }}
        >
          Upgrade to see your feedback report
        </p>
      </div>

      {/* Mock report content (blurred) */}
      <div className="space-y-4" style={{ filter: "blur(6px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-32 rounded bg-white/[0.08] mb-2" />
            <div className="h-3 w-48 rounded bg-white/[0.04]" />
          </div>
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span
              className="text-xl font-bold"
              style={{ color: "var(--amber)" }}
            >
              8.2
            </span>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3 pt-4">
          {[
            "Confidence",
            "Technical Depth",
            "Communication",
            "Problem Solving",
          ].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className="text-xs w-24"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${70 + i * 8}%`,
                    background:
                      i === 0
                        ? "#10b981"
                        : i === 1
                          ? "#f59e0b"
                          : i === 2
                            ? "#10b981"
                            : "#f59e0b",
                  }}
                />
              </div>
              <span
                className="text-xs w-8"
                style={{ color: "var(--text-primary)" }}
              >
                {7 + i * 0.5}
              </span>
            </div>
          ))}
        </div>

        {/* Feedback sections */}
        <div className="pt-4 space-y-3">
          <div className="h-4 w-24 rounded bg-white/[0.06]" />
          <div className="h-3 w-full rounded bg-white/[0.04]" />
          <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
          <div className="h-3 w-4/5 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
