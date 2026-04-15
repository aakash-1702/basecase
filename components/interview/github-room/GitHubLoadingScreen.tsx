"use client";

import { useState, useEffect, useRef } from "react";

const LOADING_MESSAGES = [
  "Reviewing your repository...",
  "Preparing your first question...",
  "Almost ready to begin...",
  "Warming up the interviewer...",
];

interface GitHubLoadingScreenProps {
  isVisible: boolean;
}

export function GitHubLoadingScreen({ isVisible }: GitHubLoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle messages every 2.5s
  useEffect(() => {
    if (!isVisible) return;
    intervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 600ms ease, visibility 600ms ease",
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Animated Orb */}
      <div
        style={{
          position: "relative",
          width: 160,
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outermost ring — expands outward */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(249, 115, 22, 0.15)",
            animation: "ghRingExpand 3s ease-out infinite",
          }}
        />
        {/* Second ring — staggered */}
        <div
          style={{
            position: "absolute",
            inset: "15px",
            borderRadius: "50%",
            border: "1px solid rgba(249, 115, 22, 0.2)",
            animation: "ghRingExpand 3s ease-out 1s infinite",
          }}
        />
        {/* Third ring — staggered */}
        <div
          style={{
            position: "absolute",
            inset: "30px",
            borderRadius: "50%",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            animation: "ghRingExpand 3s ease-out 2s infinite",
          }}
        />
        {/* Core orb — breathing glow */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.15) 60%, transparent 80%)",
            animation: "ghOrbBreathe 2s ease-in-out infinite",
            boxShadow: "0 0 40px rgba(249,115,22,0.2)",
          }}
        />
      </div>

      {/* Cycling text */}
      <div
        style={{
          marginTop: 48,
          height: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {LOADING_MESSAGES.map((msg, i) => (
          <div
            key={msg}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              color: "#71717a",
              letterSpacing: "0.02em",
              opacity: i === messageIndex ? 1 : 0,
              transform:
                i === messageIndex ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 400ms ease, transform 400ms ease",
            }}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
