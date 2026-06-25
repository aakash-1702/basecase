"use client";

import { useState, type CSSProperties } from "react";
import { motion } from "framer-motion";

type FeatureCard = {
  id: string;
  title: string;
  short: string;
  detail: string;
  color: string;
  isLink?: boolean;
  href?: string;
  position: CSSProperties;
};

const featureCards: FeatureCard[] = [
  {
    id: "ai-interview",
    title: "AI Interview",
    short: "voice + realtime feedback",
    detail: "Mock interview room with instant scoring and guidance.",
    color: "#3b82f6",
    position: { top: "17%", right: "5%" },
  },
  {
    id: "judge0-ide",
    title: "Judge0 IDE",
    short: "multi-language coding",
    detail: "Browser IDE with compile-run powered by Judge0.",
    color: "#60a5fa",
    position: { bottom: "14%", right: "2%" },
  },
  {
    id: "ai-mentor",
    title: "AI Mentor",
    short: "always-on doubt solver",
    detail: "Personalized hints and coaching for every problem.",
    color: "#f97316",
    position: { top: "24%", left: "2%" },
  },
  {
    id: "sm2",
    title: "SM-2 Algorithm",
    short: "spaced repetition engine",
    detail: "Adaptive revision schedule tuned by your performance.",
    color: "#facc15",
    position: { bottom: "18%", left: "8%" },
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    short: "creator profile",
    detail: "linkedin.com/in/aakash49",
    color: "#38bdf8",
    isLink: true,
    href: "https://linkedin.com/in/aakash49",
    position: { top: "52%", right: "-1%" },
  },
];

function HeroPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
      style={{ position: "relative", zIndex: 20 }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.018, 1],
        }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 430,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(12,12,12,0.96)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 34px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(249,115,22,0.12)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(22,22,22,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              KS
            </div>
            <div>
              <div style={{ color: "#ffffff", fontSize: 12, fontWeight: 700 }}>Kushagra Sahay</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>Joined interview queue</div>
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: "1px solid rgba(249,115,22,0.35)",
              background: "rgba(249,115,22,0.14)",
              color: "#fb923c",
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 10px",
            }}
          >
            Live
          </div>
        </div>

        <div style={{ padding: "14px" }}>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              padding: "10px 12px",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>Prompt</div>
            <div style={{ color: "#f1f5f9", fontSize: 12, lineHeight: 1.5 }}>
              Explain the optimal approach for Two Sum and its complexity tradeoff.
            </div>
          </div>

          {["Approach", "Edge Cases", "Complexity", "Follow-up"].map((item, idx) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9,
                background: idx === 0 ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.02)",
                padding: "9px 11px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: idx === 0 ? "#fb923c" : "#cbd5e1", fontSize: 11 }}>{item}</span>
              <span style={{ color: "#64748b", fontSize: 10 }}>{idx === 0 ? "In progress" : "Pending"}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "rgba(15,15,15,0.95)",
          }}
        >
          <span style={{ color: "#64748b", fontSize: 10 }}>Interview Readiness</span>
          <span style={{ color: "#fb923c", fontSize: 11, fontWeight: 700 }}>82%</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SpatialHeroVisual() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const isPaused = hoveredCard !== null;

  return (
    <div
      id="spatial-hero-visual"
      style={{
        position: "relative",
        width: "100%",
        minHeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        background: "transparent",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "52%",
            transform: "translateX(-50%)",
            color: "rgba(249,115,22,0.1)",
            fontSize: "clamp(120px, 18vw, 220px)",
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          01
        </div>
      </div>

      <motion.div
        aria-hidden
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.03, 1] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 560,
          height: 380,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 72%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div
          className={`bc-orbit ${isPaused ? "paused" : ""}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 570,
            height: 570,
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(148,163,184,0.22)",
            borderRadius: "50%",
          }}
        />
        <div
          className={`bc-orbit bc-orbit-slow ${isPaused ? "paused" : ""}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 460,
            height: 460,
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(148,163,184,0.15)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div style={{ position: "relative", width: "100%", minHeight: 700, zIndex: 2 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 30,
          }}
        >
          <HeroPanel />
        </div>

        {featureCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.2 + idx * 0.06, ease: "easeOut" }}
            className={isPaused ? "paused" : ""}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              position: "absolute",
              width: hoveredCard === card.id ? 220 : 170,
              borderRadius: 14,
              border: `1px solid ${card.color}55`,
              background: "rgba(10,10,10,0.82)",
              backdropFilter: "blur(8px)",
              boxShadow: `0 12px 32px rgba(0,0,0,0.45), 0 0 16px ${card.color}22`,
              padding: "11px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 8,
              transition: "width 0.2s ease, border-color 0.2s ease",
              ...card.position,
              animationName: "bcCardFloat",
              animationDuration: "4.3s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${idx * 0.4}s`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  color: "#f8fafc",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                {card.title}
              </span>
              <span
                style={{
                  borderRadius: 999,
                  border: `1px solid ${card.color}66`,
                  background: `${card.color}1e`,
                  color: card.color,
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "3px 8px",
                  textTransform: "uppercase",
                }}
              >
                live
              </span>
            </div>

            <span style={{ color: "#94a3b8", fontSize: 10, lineHeight: 1.4 }}>{card.short}</span>

            <div
              style={{
                maxHeight: hoveredCard === card.id ? 54 : 0,
                opacity: hoveredCard === card.id ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.2s ease, opacity 0.2s ease",
                color: "#cbd5e1",
                fontSize: 10,
                lineHeight: 1.45,
              }}
            >
              {card.isLink ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#7dd3fc", textDecoration: "underline" }}
                >
                  {card.detail}
                </a>
              ) : (
                card.detail
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        .bc-orbit {
          animation: bcOrbitSpin 22s linear infinite;
          transform-origin: center;
          animation-play-state: running;
        }
        .bc-orbit.bc-orbit-slow {
          animation-duration: 32s;
          animation-direction: reverse;
        }
        .bc-orbit.paused {
          animation-play-state: paused !important;
        }
        @keyframes bcOrbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bcCardFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @media (max-width: 1200px) {
          #spatial-hero-visual { min-height: 620px !important; }
          #spatial-hero-visual > div:last-child { transform: scale(0.9); transform-origin: center; }
        }
        @media (max-width: 1024px) {
          #spatial-hero-visual { min-height: 560px !important; }
          #spatial-hero-visual > div:last-child { transform: scale(0.82); transform-origin: center; }
        }
        @media (max-width: 700px) {
          #spatial-hero-visual { min-height: 480px !important; }
          #spatial-hero-visual > div:last-child { transform: scale(0.7); transform-origin: center top; }
        }
      `}</style>
    </div>
  );
}
