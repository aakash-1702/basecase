"use client";

import { useEffect, useState } from "react";
import { Mic, Monitor, CreditCard } from "lucide-react";

interface ReadyScreenProps {
  interviewContextLabel: string;
  /** Credits remaining after this interview. If undefined, shows generic credits text. */
  credits?: number;
  onJoin: () => void;
}

function detectBrowser(): "chrome" | "edge" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "chrome";
  return "other";
}

export function ReadyScreen({ interviewContextLabel, credits, onJoin }: ReadyScreenProps) {
  const [browser, setBrowser] = useState<"chrome" | "edge" | "other" | null>(null);

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const isSupported = browser === "chrome" || browser === "edge";
  const browserLabel = browser === "chrome" ? "Chrome" : browser === "edge" ? "Edge" : null;

  return (
    <div
      data-interview-room="active"
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        animation: "ghv2FadeIn 350ms ease-out both",
      }}
    >
      {/* ── Background grid ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          zIndex: 0,
        }}
      />

      {/* ── Ambient glow ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(234,88,12,0.04) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* ── Header strip ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            letterSpacing: "0.12em",
            color: "#f97316",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          BaseCase
        </span>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.05)",
            animation: "ghv2SlideIn 400ms ease-out both",
          }}
        >
          {/* ── Top section ── */}
          <div style={{ padding: "36px 36px 28px" }}>
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Mic
                style={{
                  width: 24,
                  height: 24,
                  color: "#f97316",
                  animation: "ghv2Breathing 3s ease-in-out infinite",
                }}
              />
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontSize: "24px",
                color: "#f5f5f5",
                letterSpacing: "-0.01em",
                marginBottom: 8,
                lineHeight: 1.25,
              }}
            >
              <span style={{ textTransform: "capitalize" }}>
                {interviewContextLabel.split(" ")[0]}
              </span>
              {interviewContextLabel.includes(" ")
                ? ` ${interviewContextLabel.split(" ").slice(1).join(" ")}`
                : ""}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#52525b",
                lineHeight: 1.6,
              }}
            >
              Your interview room is ready
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 36px" }} />

          {/* ── Info rows ── */}
          <div style={{ padding: "20px 36px" }}>
            {/* Credits row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
                marginBottom: 10,
              }}
            >
              <CreditCard
                style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "12px",
                  color: "#a3a3a3",
                  lineHeight: 1.5,
                }}
              >
                {typeof credits === "number"
                  ? `You now have ${credits} credit${credits !== 1 ? "s" : ""} remaining`
                  : "This interview uses 3 credits from your account"}
              </span>
            </div>

            {/* Browser row — renders only after client-side detection */}
            {browser !== null &&
              (isSupported ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.20)",
                  }}
                >
                  <Monitor
                    style={{ width: 16, height: 16, color: "#10b981", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "12px",
                      color: "#6ee7b7",
                    }}
                  >
                    {browserLabel} detected — audio features fully supported
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.20)",
                  }}
                >
                  <Monitor
                    style={{ width: 16, height: 16, color: "#f59e0b", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "12px",
                      color: "#f59e0b",
                    }}
                  >
                    Requires Chrome or Edge for audio and speech features
                  </span>
                </div>
              ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 36px" }} />

          {/* ── Bottom section ── */}
          <div style={{ padding: "28px 36px 32px" }}>
            <button
              type="button"
              onClick={onJoin}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "16px 0",
                borderRadius: 10,
                border: "none",
                background:
                  "linear-gradient(135deg, #fb923c 0%, #f97316 45%, #ea580c 100%)",
                boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "15px",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "all 200ms ease",
                animation: "ghv2FadeIn 600ms ease-out 200ms both",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.1)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(249,115,22,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(249,115,22,0.3)";
              }}
            >
              <Mic style={{ width: 18, height: 18 }} />
              Join Interview Room
            </button>

            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "#3a3a3a",
                textAlign: "center",
                marginTop: 14,
                lineHeight: 1.5,
              }}
            >
              Make sure your microphone is enabled before joining.
            </p>
          </div>
        </div>

        {/* ── Below-card help text ── */}
        <p
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "11px",
            color: "#27272a",
            textAlign: "center",
            marginTop: 20,
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Having issues? Make sure pop-ups and microphone access are allowed in
          your browser settings.
        </p>
      </div>
    </div>
  );
}
