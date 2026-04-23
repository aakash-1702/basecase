"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CreationStairStep, type CreationStepState } from "./CreationStairStep";

interface InterviewCreationLoaderProps {
  title: string;
  subtitle: string;
  steps: string[];
  apiStatus: "pending" | "success" | "error";
  errorMessage?: string;
  onComplete: () => void;
  onRetry: () => void;
  securityNote: string;
  sideVisual?: ReactNode;
  successMessage?: string;
  stepDelays?: number[];
}

const DEFAULT_DELAYS = [0, 1500, 3500, 5500, 7000];

export function InterviewCreationLoader({
  title,
  subtitle,
  steps,
  apiStatus,
  errorMessage,
  onComplete,
  onRetry,
  securityNote,
  sideVisual,
  successMessage = "Interview ready. Lets go.",
  stepDelays = DEFAULT_DELAYS,
}: InterviewCreationLoaderProps) {
  const [stepStates, setStepStates] = useState<CreationStepState[]>(
    steps.map(() => "pending"),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const settledRef = useRef(false);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const setStep = (index: number, state: CreationStepState) => {
    setStepStates((prev) => {
      const next = [...prev];
      next[index] = state;
      return next;
    });
  };

  useEffect(() => {
    stepDelays.forEach((delay, index) => {
      if (index >= steps.length) return;

      const timer = setTimeout(() => {
        setStepStates((prev) => {
          const next = [...prev];
          if (index > 0 && next[index - 1] === "active") {
            next[index - 1] = "completed";
          }
          next[index] = "active";
          return next;
        });
      }, delay);
      timersRef.current.push(timer);
    });

    return clearAllTimers;
  }, [stepDelays, steps.length]);

  useEffect(() => {
    if (apiStatus === "pending" || settledRef.current) return;
    settledRef.current = true;
    clearAllTimers();

    if (apiStatus === "error") return;

    const totalSteps = steps.length;
    const activeIndex = stepStates.findIndex((state) => state === "active");
    const completedCount = stepStates.filter(
      (state) => state === "completed",
    ).length;
    const startFrom = Math.max(activeIndex, completedCount, 0);

    for (let i = startFrom; i < totalSteps; i += 1) {
      const activateDelay = (i - startFrom) * 200;
      const completeDelay = activateDelay + 200;

      timersRef.current.push(setTimeout(() => setStep(i, "active"), activateDelay));
      timersRef.current.push(
        setTimeout(() => setStep(i, "completed"), completeDelay),
      );
    }

    const doneDelay = (totalSteps - startFrom) * 200 + 400;
    timersRef.current.push(setTimeout(() => setShowSuccess(true), doneDelay));
    timersRef.current.push(setTimeout(() => setIsExiting(true), doneDelay + 600));
    timersRef.current.push(setTimeout(onComplete, doneDelay + 1000));
  }, [apiStatus, onComplete, stepStates, steps.length]);

  const activeIndex = stepStates.findIndex((state) => state === "active");
  const errorIndex =
    apiStatus === "error" ? (activeIndex >= 0 ? activeIndex : steps.length - 1) : -1;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: "#08080F",
        opacity: isExiting ? 0 : 1,
        transition: "opacity 400ms ease",
      }}
    >
      <div className="h-full w-full flex flex-col lg:flex-row">
        <div className="lg:w-[55%] w-full flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10">
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-zinc-500 mb-10">{subtitle}</p>

          <div className="flex flex-col gap-3">
            {steps.map((label, index) => {
              if (index === errorIndex && errorMessage) {
                return (
                  <div
                    key={`error-${index}`}
                    style={{ marginLeft: index * 32 }}
                    className="min-w-[320px] rounded-xl px-5 py-4 border-l-2 border-red-500 border border-zinc-800/60 bg-zinc-900 flex flex-col gap-3"
                  >
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="self-start text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                );
              }

              return (
                <CreationStairStep
                  key={`${index}-${label}`}
                  index={index}
                  label={label}
                  state={stepStates[index]}
                />
              );
            })}

            {showSuccess && (
              <p
                className="text-emerald-400 text-sm font-medium mt-2 ml-1"
                style={{ animation: "ghv2FadeIn 400ms ease-out both" }}
              >
                {successMessage}
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-[45%] w-full relative flex items-center justify-center min-h-[220px] lg:min-h-0 pb-10 lg:pb-0">
          <div
            className="absolute"
            style={{
              width: 420,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.2) 40%, rgba(37,99,235,0.1) 70%, transparent 100%)",
              filter: "blur(60px)",
              opacity: 0.45,
              animation: "ghv2AmbientOrb 40s linear infinite",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-2 mt-20 lg:mt-72">
            {sideVisual}
            <p className="text-zinc-600 text-xs text-center">{securityNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
