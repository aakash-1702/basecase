"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SpatialHeroVisual from "@/components/landing/SpatialHeroVisual";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const, delay },
  }),
};

export default function HeroSection() {
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        /* Single unified background — no separation between left & right */
        background: "#0a0a0a",
        paddingTop: 80,
      }}
    >
      {/* Subtle uniform mesh grid — covers the FULL section */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Soft center glow that bleeds across both columns */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "40%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Cross-column blend layer so both sides read as one continuous canvas */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 68% 45%, rgba(249,115,22,0.09) 0%, transparent 46%), radial-gradient(circle at 32% 58%, rgba(249,115,22,0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Grid: left (text) + right (visual) */}
      <div
        className="bc-hero-layout"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
          width: "100%",
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          minHeight: "100vh",
          gap: 0,
        }}
      >
        {/* ── LEFT: Copy ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 32,
            paddingTop: 80, /* compensate for nav */
            paddingBottom: 40,
          }}
        >
          {/* Learner badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(124,45,18,0.7)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 999,
              padding: "5px 14px",
              marginBottom: 28,
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 14 }}>🔖</span>
            <span style={{ color: "#fb923c", fontSize: 13, fontWeight: 700 }}>
              15,000+ Learners
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.08}
            variants={fadeUp}
            style={{
              fontSize: "clamp(40px, 5vw, 60px)",
              fontWeight: 900,
              lineHeight: 1.06,
              color: "#ffffff",
              margin: "0 0 22px",
              fontFamily: "var(--font-nunito), sans-serif",
              letterSpacing: "-1px",
            }}
          >
            ONE STOP{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Learning
            </span>
            <br />
            Platform For{" "}
            <span style={{ color: "#ffffff" }}>TECH</span>
            <br />
            Interviews
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.18}
            variants={fadeUp}
            style={{
              color: "#9ca3af",
              fontSize: 15,
              lineHeight: 1.75,
              marginBottom: 36,
              maxWidth: 460,
            }}
          >
            Master Data Structures, Algorithms, System Design, and Core CS
            Subjects. Get personalized roadmaps, expert videos, and AI-driven
            practice to ace your interviews.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.28}
            variants={fadeUp}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}
          >
            <Link
              href="/auth/sign-up"
              id="hero-cta-start-practicing"
              style={{
                background: "#f97316",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 32px",
                borderRadius: 10,
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                boxShadow: "0 0 0 0 rgba(249,115,22,0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ea6c0a";
                e.currentTarget.style.boxShadow = "0 0 32px rgba(249,115,22,0.55)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f97316";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Start Practicing
            </Link>

            <Link
              href="/interview"
              id="hero-cta-interview"
              style={{
                background: "transparent",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                padding: "14px 32px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.45)";
                e.currentTarget.style.background = "rgba(249,115,22,0.06)";
                e.currentTarget.style.color = "#fb923c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#fff";
              }}
            >
              Try Interview →
            </Link>
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.38}
            variants={fadeUp}
            style={{ display: "flex", flexDirection: "column", gap: 9 }}
          >
            {[
              { emoji: "📋", text: "Curated DSA Sheets with step-by-step guidance." },
              { emoji: "🤖", text: "AI Voice Interviews with real-time feedback." },
              { emoji: "🧠", text: "AI Mentor for instant doubt resolution." },
              { emoji: "🔥", text: "Streaks, leaderboards & SM-2 spaced repetition." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: "#9ca3af",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Visual (no background — same as section) ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          style={{
            position: "relative",
            /* No background here — fully inherits #0a0a0a */
            overflow: "visible",
            minHeight: 780,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingBottom: 40,
          }}
        >
          <SpatialHeroVisual />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .bc-hero-layout {
            grid-template-columns: 1fr !important;
            padding: 60px 32px !important;
          }
          .bc-hero-layout > div:last-child {
            min-height: 620px !important;
          }
        }
        @media (max-width: 640px) {
          .bc-hero-layout {
            padding: 40px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
