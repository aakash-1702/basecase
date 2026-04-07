"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";

type LanguageBadge = {
  id: string;
  label: string;
  icon: string;
  color: string;
  position: CSSProperties;
  delay: number;
};

const languageBadges: LanguageBadge[] = [
  {
    id: "python",
    label: "Py",
    icon: "PY",
    color: "#3b82f6",
    position: { top: "18%", right: "10%" },
    delay: 0,
  },
  {
    id: "cpp",
    label: "C++",
    icon: "C++",
    color: "#60a5fa",
    position: { bottom: "18%", right: "6%" },
    delay: 0.7,
  },
  {
    id: "java",
    label: "Java",
    icon: "JV",
    color: "#f97316",
    position: { top: "24%", left: "6%" },
    delay: 0.35,
  },
  {
    id: "js",
    label: "JS",
    icon: "JS",
    color: "#facc15",
    position: { bottom: "22%", left: "10%" },
    delay: 1,
  },
];

function FloatingLanguageBadge({ badge }: { badge: LanguageBadge }) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 1, 0],
      }}
      transition={{
        duration: 4.2,
        delay: badge.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        width: 84,
        borderRadius: 14,
        border: `1px solid ${badge.color}55`,
        background: "rgba(16,16,16,0.82)",
        backdropFilter: "blur(10px)",
        boxShadow: `0 12px 28px rgba(0,0,0,0.55), 0 0 18px ${badge.color}22`,
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        zIndex: 6,
        ...badge.position,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${badge.color}20`,
          border: `1px solid ${badge.color}55`,
          color: badge.color,
          fontSize: 10,
          fontWeight: 800,
          fontFamily: "var(--font-fira), monospace",
        }}
      >
        {badge.icon}
      </div>
      <span
        style={{
          color: "#f8fafc",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      >
        {badge.label}
      </span>
    </motion.div>
  );
}

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
        animate={{ opacity: [0.32, 0.56, 0.32], scale: [1, 1.04, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 560,
          height: 380,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 72%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", width: "100%", minHeight: 700, zIndex: 2 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <HeroPanel />
        </div>

        {languageBadges.map((badge) => (
          <FloatingLanguageBadge key={badge.id} badge={badge} />
        ))}
      </div>

      <style>{`
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
