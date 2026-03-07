"use client";

import { useEffect, useState } from "react";
import { AIOrb } from "../AIOrb";
import { Check } from "lucide-react";

const PREP_STEPS = [
  "Initializing session...",
  "Loading your profile...",
  "Selecting interview questions...",
  "Briefing your interviewer...",
  "Almost ready...",
];

const STEP_LABELS = [
  "Session configured",
  "Profile loaded",
  "Briefing interviewer",
  "Preparing first question",
];

interface PreparingScreenProps {
  onReady: () => void;
}

export function PreparingScreen({ onReady }: PreparingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= PREP_STEPS.length - 1) { clearInterval(stepInterval); return prev; }
        return prev + 1;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressInterval); setTimeout(onReady, 500); return 100; }
        return prev + 2.5;
      });
    }, 100);

    return () => { clearInterval(stepInterval); clearInterval(progressInterval); };
  }, [onReady]);

  return (
    <div className="min-h-screen interview-ambient-bg flex items-center justify-center px-4">
      <div className="text-center space-y-10 max-w-md w-full" style={{ animation: "fadeSlideUp 0.5s ease forwards" }}>
        {/* AI Orb */}
        <div className="flex justify-center">
          <AIOrb size="large" state="processing" />
        </div>

        {/* Cycling Text */}
        <div className="text-sm h-6" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
          {PREP_STEPS[currentStep]}
        </div>

        {/* Progress Bar */}
        <div className="mx-auto">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--text-dim)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "var(--amber)",
                backgroundImage: `linear-gradient(90deg, var(--amber) 25%, rgba(245,158,11,0.5) 50%, var(--amber) 75%)`,
                backgroundSize: "600px 100%",
                animation: "shimmer 2s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px max-w-[200px] mx-auto" style={{ background: "var(--border-subtle)" }} />

        {/* Step Indicators */}
        <div className="space-y-2">
          {STEP_LABELS.map((step, idx) => (
            <div
              key={step}
              className="text-xs flex items-center gap-2 justify-center transition-all duration-300"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: idx < currentStep ? "var(--emerald)" : idx === currentStep ? "var(--amber)" : "var(--text-dim)",
              }}
            >
              {idx < currentStep ? (
                <Check className="w-3.5 h-3.5" />
              ) : idx === currentStep ? (
                <span style={{ animation: "stepCycle 1s ease-in-out infinite" }}>◎</span>
              ) : (
                <span>◌</span>
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
