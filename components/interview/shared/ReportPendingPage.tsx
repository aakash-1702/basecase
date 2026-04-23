"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ReportPendingPageProps {
  interviewId: string;
}

export function ReportPendingPage({ interviewId }: ReportPendingPageProps) {
  const router = useRouter();
  const [dots, setDots] = useState(".");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : `${prev}.`));
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/interview/${interviewId}/report`, {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.ok) {
          router.push(`/interview/${interviewId}/report`);
        }
      } catch {
        // keep polling
      }
    };

    poll();
    const timer = setInterval(poll, 30_000);
    return () => clearInterval(timer);
  }, [interviewId, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="mb-8 relative"
        style={{ animation: "ghv2Breathing 3s ease-in-out infinite" }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          className="drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          <rect
            x="12"
            y="8"
            width="48"
            height="56"
            rx="6"
            fill="rgba(99,102,241,0.1)"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <line x1="22" y1="26" x2="50" y2="26" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="34" x2="50" y2="34" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="42" x2="38" y2="42" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="56" cy="18" r="3" fill="#818cf8" style={{ animation: "ghv2Breathing 2s ease-in-out 0.5s infinite" }} />
          <circle cx="14" cy="52" r="2" fill="#a5b4fc" style={{ animation: "ghv2Breathing 2s ease-in-out 1s infinite" }} />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-white mb-3 text-center">
        Generating your report{dots}
      </h1>

      <p className="text-zinc-400 text-sm text-center max-w-md leading-relaxed mb-10">
        Your interview is being analysed. This usually takes a few minutes. In
        peak hours it may take up to 2 hours.
      </p>

      <div className="w-full max-w-sm h-1 bg-zinc-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-indigo-500/60 rounded-full"
          style={{
            animation: "ghv2FakeProgress 180s linear forwards",
            width: "0%",
          }}
        />
      </div>

      <p className="text-zinc-600 text-xs text-center">
        This page will redirect automatically when your report is ready.
      </p>
    </div>
  );
}
