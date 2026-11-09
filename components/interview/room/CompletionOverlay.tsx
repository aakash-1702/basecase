"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface CompletionOverlayProps {
  isVisible: boolean;
  interviewId: string;
}

export function CompletionOverlay({
  isVisible,
  interviewId,
}: CompletionOverlayProps) {
  const router = useRouter();

  // Show the overlay for 2s, then hand off to the report page.
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      router.push(`/interview/${interviewId}/report`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isVisible, interviewId, router]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center justify-center bg-bg/95"
      role="status"
      aria-live="polite"
    >
      <div className="mb-8 h-0.5 w-16 rounded-full bg-accent/40" />
      <h1 className="font-display text-3xl tracking-tight text-fg">
        Interview Complete
      </h1>
      <p className="mt-3 font-mono text-sm text-fg-muted">
        Generating your feedback report...
      </p>
      <div className="mt-6 h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}
