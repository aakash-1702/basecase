"use client";

import React, { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Lock, Sparkles, Zap } from "lucide-react";
import type { Problem } from "../types";

interface BottomSectionProps {
  isPremium: boolean;
  problem: Problem;
}

export const BottomSection = React.memo(function BottomSection({
  isPremium,
}: BottomSectionProps) {
  const [expandedBottom, setExpandedBottom] = useState(false);

  const toggle = useCallback(() => setExpandedBottom((v) => !v), []);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      {/* Toggle button — now more prominent */}
      <button
        onClick={toggle}
        className="group w-full flex items-center justify-between gap-2 mb-5 px-5 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: expandedBottom
            ? "rgba(249,115,22,0.08)"
            : "rgba(249,115,22,0.04)",
          border: expandedBottom
            ? "1px solid rgba(249,115,22,0.3)"
            : "1px solid rgba(249,115,22,0.12)",
        }}
      >
        <span
          className="mono flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] transition-colors duration-200"
          style={{ color: expandedBottom ? "#f97316" : "#71717a" }}
        >
          {expandedBottom ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Discussion &amp; Editorial
        </span>

        {/* Teaser badge — visible even when collapsed */}
        {!isPremium && (
          <span
            className="mono flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(249,115,22,0.15), rgba(234,88,12,0.15))",
              border: "1px solid rgba(249,115,22,0.25)",
              color: "#fb923c",
            }}
          >
            <Sparkles className="h-2.5 w-2.5" />
            Unlock Editorial
          </span>
        )}
      </button>

      {expandedBottom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discussion */}
          <div
            className="rounded-3xl p-6"
            style={{
              background: "rgba(10,10,14,0.98)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              className="mono text-[9px] font-black uppercase tracking-[0.3em]"
              style={{ color: "#f97316" }}
            >
              ▸ Discussion
            </span>
            <p className="sans mt-3 text-sm text-zinc-600 italic">
              Community discussion coming soon.
            </p>
          </div>

          {/* Editorial — high visibility upsell for free users */}
          <div
            className="rounded-3xl relative overflow-hidden"
            style={{
              border: isPremium
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(249,115,22,0.25)",
              background: isPremium
                ? "rgba(10,10,14,0.98)"
                : "rgba(10,10,14,0.98)",
              boxShadow: isPremium
                ? "none"
                : "0 0 40px rgba(249,115,22,0.08), inset 0 0 40px rgba(249,115,22,0.03)",
            }}
          >
            {/* Subtle top glow line for free users */}
            {!isPremium && (
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)",
                }}
              />
            )}

            <div className="p-6">
              <span
                className="mono text-[9px] font-black uppercase tracking-[0.3em]"
                style={{ color: "#f97316" }}
              >
                ▸ Official Editorial
              </span>

              {/* Blurred content preview */}
              <div
                className="sans mt-3 text-sm text-zinc-300 leading-relaxed space-y-3"
                style={{
                  filter: isPremium ? "none" : "blur(3px)",
                  userSelect: isPremium ? "auto" : "none",
                  pointerEvents: isPremium ? "auto" : "none",
                }}
              >
                <p>
                  <strong className="text-zinc-100">
                    Approach 1 — Brute Force O(n²):
                  </strong>{" "}
                  For each element, scan the rest of the array for its
                  complement. Simple but too slow for large inputs.
                </p>
                <p>
                  <strong className="text-zinc-100">
                    Approach 2 — Hash Map O(n):
                  </strong>{" "}
                  As you iterate, check if complement (target − nums[i]) exists
                  in the map. If yes, return. If no, store current value and
                  index.
                </p>
              </div>
            </div>

            {/* Premium overlay — high visibility CTA */}
            {!isPremium && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(6,6,8,0.7) 0%, rgba(15,10,6,0.92) 60%, rgba(20,10,4,0.97) 100%)",
                  backdropFilter: "blur(2px)",
                }}
              >
                {/* Icon with glow */}
                <div
                  className="mb-4 p-3 rounded-2xl"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    boxShadow: "0 0 24px rgba(249,115,22,0.15)",
                  }}
                >
                  <Lock className="h-5 w-5" style={{ color: "#f97316" }} />
                </div>

                <span className="mono text-[11px] font-black uppercase tracking-[0.25em] text-white block mb-1">
                  Premium Editorial
                </span>
                <span className="text-xs text-zinc-400 mb-5 block text-center px-6">
                  Step-by-step solutions, complexity analysis & multiple
                  approaches
                </span>

                {/* High-visibility CTA */}
                <button
                  className="group mono text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    border: "1px solid rgba(249,115,22,0.5)",
                    color: "#ffffff",
                    boxShadow:
                      "0 4px 20px rgba(249,115,22,0.35), 0 0 0 0 rgba(249,115,22,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "scale(1.04) translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 28px rgba(249,115,22,0.5), 0 0 0 3px rgba(249,115,22,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(249,115,22,0.35), 0 0 0 0 rgba(249,115,22,0.3)";
                  }}
                >
                  <Zap className="h-3 w-3" />
                  Upgrade to Plus
                </button>

                {/* Social proof nudge */}
                <p className="mt-3 text-[10px] text-zinc-600">
                  Join 2,000+ devs leveling up faster
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
