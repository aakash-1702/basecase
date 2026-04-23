"use client";

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

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10,10,10,0.96)",
        animation: "ghFadeIn 500ms ease forwards",
      }}
    >
      {/* CSS-only Checkmark */}
      <div
        style={{
          width: 80,
          height: 80,
          marginBottom: 32,
        }}
      >
        <svg viewBox="0 0 56 56" width="80" height="80">
          {/* Circle */}
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeDasharray="166"
            strokeDashoffset="166"
            style={{
              animation: "ghCheckCircle 600ms ease forwards",
            }}
          />
          {/* Checkmark */}
          <path
            d="M16 28 L24 36 L40 20"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="36"
            strokeDashoffset="36"
            style={{
              animation: "ghCheckDraw 400ms ease 500ms forwards",
            }}
          />
        </svg>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontSize: "32px",
          color: "#f5f5f5",
          marginBottom: 12,
          animation: "ghSlideUp 400ms ease 300ms backwards",
        }}
      >
        Interview Complete
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "14px",
          color: "#71717a",
          textAlign: "center",
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: 40,
          animation: "ghSlideUp 400ms ease 500ms backwards",
        }}
      >
        Your responses are being analyzed. You'll receive detailed feedback
        shortly.
      </p>

      {/* View Results button */}
      <button
        onClick={() => router.push(`/interview/${interviewId}/results`)}
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "14px",
          fontWeight: 600,
          color: "#000",
          background: "#f97316",
          border: "none",
          borderRadius: 8,
          padding: "14px 36px",
          cursor: "pointer",
          letterSpacing: "0.04em",
          animation: "ghSlideUp 400ms ease 700ms backwards",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(1.1)";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        View Results →
      </button>
    </div>
  );
}
