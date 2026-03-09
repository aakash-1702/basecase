"use client";

import { useEffect, useState, useRef } from "react";
import { AIOrb } from "../AIOrb";
import { AlertCircle } from "lucide-react";
import type { PreparingStatus } from "@/types/interview-room";

const STEPS = [
  "Analyzing your profile...",
  "Calibrating difficulty level...",
  "Preparing your interviewer...",
  "Setting up your room...",
];

const INSTRUCTIONS = [
  { emoji: "🎙", text: "Mic only activates when you click", bold: "Start Speaking" },
  { emoji: "⏹", text: "Click", bold: "Stop Speaking", suffix: "to end your turn" },
  { emoji: "💡", text: "Speak clearly — there's no rush", bold: "" },
  { emoji: "🔇", text: "End session anytime from the top bar", bold: "" },
];

interface PreparingScreenProps {
  status: PreparingStatus;
  onReady: () => void;
  onRetry: () => void;
  errorMessage: string;
}

export function PreparingScreen({ status, onReady, onRetry, errorMessage }: PreparingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAllSet, setIsAllSet] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle through step labels while loading
  useEffect(() => {
    if (status === "loading") {
      setIsAllSet(false);
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS.length);
      }, 1800);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [status]);

  // When ready, show "all set" then transition
  useEffect(() => {
    if (status === "ready") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAllSet(true);
      const timer = setTimeout(onReady, 600);
      return () => clearTimeout(timer);
    }
  }, [status, onReady]);

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen interview-ambient-bg flex items-center justify-center px-4">
        <div
          className="text-center space-y-8 max-w-md w-full"
          style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
        >
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: "#f43f5e" }} />
            </div>
          </div>

          <div>
            <div
              className="text-sm mb-2"
              style={{ fontFamily: "var(--font-dm-mono)", color: "#f43f5e" }}
            >
              Something went wrong
            </div>
            <div
              className="text-xs"
              style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}
            >
              {errorMessage}
            </div>
          </div>

          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmerSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes stepCycle {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes readyGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.2); }
          50%      { box-shadow: 0 0 20px 4px rgba(16,185,129,0.1); }
        }
      `}} />

      <div className="min-h-screen interview-ambient-bg flex items-center justify-center px-4">
        <div
          className="text-center max-w-lg w-full"
          style={{ animation: "fadeSlideUp 0.5s ease forwards" }}
        >
          {/* AI Orb */}
          <div className="flex justify-center mb-10">
            <div
              style={{
                transition: "all 0.6s ease",
                ...(isAllSet ? { animation: "readyGlow 2s ease infinite" } : {}),
              }}
            >
              <AIOrb size="large" state={isAllSet ? "idle" : "processing"} />
            </div>
          </div>

          {/* Cycling Text or Ready Text */}
          <div
            className="text-sm h-6 mb-8 transition-all duration-300"
            style={{ fontFamily: "var(--font-dm-mono)", color: isAllSet ? "var(--emerald, #10b981)" : "var(--text-muted)" }}
          >
            {isAllSet ? "You're all set" : STEPS[currentStep]}
          </div>

          {/* Shimmer Progress Bar */}
          <div className="mx-auto mb-10 max-w-xs">
            <div
              className="h-1 rounded-full overflow-hidden relative"
              style={{ background: "var(--text-dim, #1e1e1e)" }}
            >
              {isAllSet ? (
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: "100%", background: "var(--emerald, #10b981)" }}
                />
              ) : (
                <div
                  className="absolute inset-0 h-full rounded-full"
                  style={{ background: "var(--amber)" }}
                >
                  <div
                    className="absolute inset-0 h-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                      animation: "shimmerSlide 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div
            className="h-px max-w-[200px] mx-auto mb-8"
            style={{ background: "var(--border-subtle)" }}
          />

          {/* Instruction Cards */}
          <div className="space-y-3 max-w-sm mx-auto">
            {INSTRUCTIONS.map((instr, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 text-left"
                style={{
                  background: "var(--bg-card, #111)",
                  border: "1px solid var(--border-subtle, #1e1e1e)",
                  borderRadius: "8px",
                  animation: `cardFadeIn 0.4s ease ${0.1 + idx * 0.08}s backwards`,
                }}
              >
                <span className="text-base mt-0.5 shrink-0">{instr.emoji}</span>
                <span
                  className="text-xs leading-relaxed"
                  style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}
                >
                  {instr.text}{" "}
                  {instr.bold && (
                    <strong style={{ color: "var(--amber)" }}>{instr.bold}</strong>
                  )}
                  {instr.suffix && ` ${instr.suffix}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
