"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AIChatPanel } from "./ai-chat-panel";
import { AI_FEATURES } from "../constants";
import type { Problem, UserAccount, AIFeatureId } from "../types";

interface AIMentorPanelProps {
  isPremium: boolean;
  problem: Problem;
  account: UserAccount;
}

export const AIMentorPanel = React.memo(function AIMentorPanel({
  isPremium,
  problem,
  account,
}: AIMentorPanelProps) {
  const [activeAI, setActiveAI] = useState<AIFeatureId | null>(null);

  if (isPremium) {
    return <PlusMentor problem={problem} account={account} activeAI={activeAI} setActiveAI={setActiveAI} />;
  }
  return <FreeMentor problem={problem} />;
});

// ═══════════════════════════════════════════════════════════
// PLUS VARIANT
// ═══════════════════════════════════════════════════════════

function PlusMentor({
  problem,
  account,
  activeAI,
  setActiveAI,
}: {
  problem: Problem;
  account: UserAccount;
  activeAI: AIFeatureId | null;
  setActiveAI: React.Dispatch<React.SetStateAction<AIFeatureId | null>>;
}) {
  return (
    <div
      className="og-glow rounded-3xl overflow-hidden"
      style={{
        background: "rgba(10,10,14,0.98)",
        border: "1px solid rgba(249,115,22,0.28)",
      }}
    >
      {/* Glow bg textures */}
      <div className="relative">
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.07), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.1), transparent 70%)",
          }}
        />

        <div className="relative p-6">
          {/* AI header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl"
                style={{ background: "#f97316" }}
              >
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="sans text-lg font-black text-white uppercase tracking-tight">
                  AI Mentor
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="flex h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: "#f97316" }}
                  />
                  <span
                    className="mono text-[9px] font-black uppercase tracking-widest"
                    style={{ color: "#f97316" }}
                  >
                    System Ready
                  </span>
                  <span
                    className="mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(251,191,36,0.1)",
                      color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.25)",
                    }}
                  >
                    Plus
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Credits bar */}
          {account.aiCreditsRemaining !== null &&
            account.aiCreditsTotal !== null && (
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <span className="mono text-[9px] uppercase tracking-widest text-zinc-600">
                    AI Credits
                  </span>
                  <span
                    className="mono text-[9px] font-black"
                    style={{
                      color:
                        account.aiCreditsRemaining > 5
                          ? "#34d399"
                          : "#f87171",
                    }}
                  >
                    {account.aiCreditsRemaining}/{account.aiCreditsTotal}
                  </span>
                </div>
                <div
                  className="w-full h-[3px] rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(account.aiCreditsRemaining / account.aiCreditsTotal) * 100}%`,
                      background:
                        account.aiCreditsRemaining > 5
                          ? "linear-gradient(90deg,#34d399,#10b981)"
                          : "linear-gradient(90deg,#f87171,#ef4444)",
                    }}
                  />
                </div>
              </div>
            )}

          {/* AI action buttons */}
          <div className="space-y-2">
            {AI_FEATURES.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                onClick={() =>
                  setActiveAI((prev) => (prev === id ? null : id))
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 group"
                style={{
                  background:
                    activeAI === id
                      ? "rgba(249,115,22,0.1)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeAI === id ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.06)"}`,
                }}
                onMouseEnter={(e) =>
                  activeAI !== id &&
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(249,115,22,0.25)")
                }
                onMouseLeave={(e) =>
                  activeAI !== id &&
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.06)")
                }
              >
                <Icon
                  className="h-5 w-5 shrink-0 transition-colors"
                  style={{
                    color: activeAI === id ? "#f97316" : "#3f3f46",
                  }}
                />
                <div className="flex-1">
                  <div className="sans text-[14px] font-bold text-zinc-200">
                    {label}
                  </div>
                  <div className="mono text-[9px] text-zinc-600 uppercase tracking-tight mt-0.5">
                    {desc}
                  </div>
                </div>
                {activeAI === id ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-orange-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-700" />
                )}
              </button>
            ))}
          </div>

          {/* Inline chat */}
          {activeAI && account.aiCreditsRemaining !== null && (
            <div className="mt-3">
              <AIChatPanel
                feature={activeAI}
                onClose={() => setActiveAI(null)}
                creditsRemaining={account.aiCreditsRemaining}
              />
            </div>
          )}

          {/* Patterns */}
          <div
            className="mt-6 pt-5"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <PatternsSection patterns={problem.patterns} variant="plus" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FREE VARIANT
// ═══════════════════════════════════════════════════════════

function FreeMentor({ problem }: { problem: Problem }) {
  return (
    <div
      className="rounded-3xl overflow-hidden og-hover"
      style={{
        background: "rgba(10,10,14,0.98)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.04), transparent 70%)",
          }}
        />

        <div className="relative p-6 space-y-4">
          {/* Locked header */}
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Sparkles className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="sans text-lg font-black text-zinc-400 uppercase tracking-tight">
                AI Mentor
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Lock className="h-3 w-3 text-zinc-700" />
                <span className="mono text-[9px] font-black uppercase tracking-widest text-zinc-700">
                  Plus Only
                </span>
              </div>
            </div>
          </div>

          {/* Locked items */}
          <div className="space-y-2 opacity-30 pointer-events-none select-none">
            {AI_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon className="h-5 w-5 text-zinc-700 shrink-0" />
                <div>
                  <div className="sans text-[14px] font-bold text-zinc-400">
                    {label}
                  </div>
                  <div className="mono text-[9px] text-zinc-700 uppercase tracking-tight mt-0.5">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          <button className="btn-orange w-full mono text-[10px] uppercase tracking-[0.25em] py-3.5 rounded-2xl flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade to Plus — Learn 2× Faster
          </button>

          <p className="sans text-center text-[12px] text-zinc-600">
            Get AI hints, code review &amp; unlimited chat. Resets monthly.
          </p>
        </div>
      </div>

      {/* Patterns still visible for free */}
      <div
        className="px-6 pb-6 pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <PatternsSection patterns={problem.patterns} variant="free" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHARED PATTERNS
// ═══════════════════════════════════════════════════════════

function PatternsSection({
  patterns,
  variant,
}: {
  patterns: string[];
  variant: "plus" | "free";
}) {
  return (
    <>
      <span className="mono text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-3">
        Problem Patterns
      </span>
      <div className="flex flex-wrap gap-2">
        {patterns.map((p) => (
          <span
            key={p}
            className="mono text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-default"
            style={
              variant === "plus"
                ? {
                    background: "rgba(249,115,22,0.07)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    color: "#fb923c",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#52525b",
                  }
            }
            onMouseEnter={(e) => {
              if (variant === "plus") {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(249,115,22,0.15)";
                (e.currentTarget as HTMLElement).style.color = "#f97316";
              }
            }}
            onMouseLeave={(e) => {
              if (variant === "plus") {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(249,115,22,0.07)";
                (e.currentTarget as HTMLElement).style.color = "#fb923c";
              }
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </>
  );
}
