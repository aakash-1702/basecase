"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";

function ReadyPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const interviewId = params.id as string;
  const repoUrl = searchParams.get("repo") || "";
  const questions = searchParams.get("questions") || "8";
  const difficulty = searchParams.get("difficulty") || "Mid";
  const role = searchParams.get("role") || "Full Stack";

  // Extract repo name from URL (e.g. "aakash-1702/basecase")
  const repoName = (() => {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      return match ? match[1].replace(/\.git$/, "") : repoUrl || "Unknown Repo";
    } catch {
      return "Unknown Repo";
    }
  })();

  const handleStart = () => {
    const params = new URLSearchParams({
      repo: repoUrl,
      questions,
      difficulty,
      role,
    });
    router.push(`/interview/${interviewId}/room?${params.toString()}`);
  };

  return (
    <div
      data-interview-room="active"
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          zIndex: 0,
        }}
      />

      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(234,88,12,0.04) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "40px 36px",
          animation: "ghSlideUp 0.5s ease forwards",
        }}
      >
        {/* Type label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: "#f97316",
              textTransform: "uppercase",
            }}
          >
            GitHub Interview
          </span>
        </div>

        {/* Repo name */}
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "20px",
            color: "#f5f5f5",
            fontWeight: 500,
            marginBottom: 24,
            wordBreak: "break-all",
          }}
        >
          {repoName}
        </div>

        {/* Config summary pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Questions", value: questions },
            { label: "Difficulty", value: difficulty },
            { label: "Role", value: role },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "8px",
                  letterSpacing: "0.15em",
                  color: "#525252",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "13px",
                  color: "#d4d4d4",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Browser compatibility warning */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "14px 16px",
            borderRadius: 8,
            background: "rgba(249,115,22,0.06)",
            border: "1px solid rgba(249,115,22,0.15)",
            marginBottom: 32,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: "#f97316",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Browser Requirement
            </div>
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "#71717a",
                lineHeight: 1.5,
              }}
            >
              This feature uses live speech recognition and works only in{" "}
              <strong style={{ color: "#d4d4d4" }}>Google Chrome</strong> and{" "}
              <strong style={{ color: "#d4d4d4" }}>Microsoft Edge</strong>.
              Other browsers are not supported.
            </div>
          </div>
        </div>

        {/* Start Interview button */}
        <button
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "16px 0",
            borderRadius: 10,
            background: "#f97316",
            color: "#000",
            border: "none",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
            animation: "ghButtonPulse 2.5s ease-in-out infinite",
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.1)";
            e.currentTarget.style.transform = "scale(1.01)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Start Interview →
        </button>

        {/* Disclaimer */}
        <p
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            color: "#3a3a3a",
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Once you start, your session begins and credits will be consumed
        </p>
      </div>
    </div>
  );
}

export default function ReadyPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#3a3a3a",
            }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <ReadyPageContent />
    </Suspense>
  );
}
