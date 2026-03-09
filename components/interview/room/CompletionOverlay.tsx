"use client";

import { useEffect, useState } from "react";
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
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Wait 2000ms then redirect
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(`/interview/result/${interviewId}`);
    }
  }, [shouldRedirect, router, interviewId]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "rgba(10,10,10,0.95)",
        animation: "fadeIn 500ms ease",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes spinnerRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />

      {/* Amber line */}
      <div
        style={{
          width: "60px",
          height: "2px",
          background: "rgba(245,158,11,0.4)",
          marginBottom: "32px",
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontSize: "28px",
          color: "#f0f0f0",
          marginBottom: "16px",
        }}
      >
        Interview Complete
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "13px",
          color: "#525252",
          marginBottom: "24px",
        }}
      >
        Generating your feedback report...
      </p>

      {/* Spinner */}
      <div
        style={{
          width: "20px",
          height: "20px",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "rgba(245,158,11,0.5)",
          borderRadius: "50%",
          animation: "spinnerRotate 1s linear infinite",
        }}
      />
    </div>
  );
}
