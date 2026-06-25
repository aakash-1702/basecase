"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import OrangeButton from "@/components/shared/OrangeButton";
import GhostButton from "@/components/shared/GhostButton";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";
import {
  fadeIn,
  fadeUp,
  HERO_AVATARS,
  scaleIn,
  SHEET_PROBLEMS,
  staggerContainer,
} from "@/lib/constants";

export default function HeroSection() {
  return (
    <section
      style={{
        background: "var(--bg, #0f1117)",
        position: "relative",
        overflow: "hidden",
        padding: "80px 24px 60px",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
        className="bc-hero-grid"
      >
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeIn} style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg3, #1c2333)",
                border: "1px solid var(--border, #2d3748)",
                borderRadius: 100,
                padding: "6px 16px",
              }}
            >
              <span
                className="bc-pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--orange, #f97316)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--text-muted, #94a3b8)",
                }}
              >
                Trusted by 1,000+ developers {"\u00B7"} See what&apos;s inside
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h1
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: "clamp(40px, 7vw, 80px)",
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: 1.05,
                color: "var(--text, #e2e8f0)",
                marginBottom: 20,
              }}
            >
              Stop grinding randomly.
            </h1>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h1
              style={{
                fontFamily: "Nunito, sans-serif",
                fontSize: "clamp(40px, 7vw, 80px)",
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: 1.05,
                color: "var(--text, #e2e8f0)",
                marginBottom: 24,
              }}
            >
              Start learning with{" "}
              <em style={{ color: "var(--orange, #f97316)", fontStyle: "normal" }}>structure</em>
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 17,
              color: "var(--text-muted, #94a3b8)",
              maxWidth: 620,
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            BaseCase gives you curated DSA sheets, spaced repetition, AI mock interviews,
            and personal roadmaps {"\u2014"} in one focused platform.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            <OrangeButton href="#">Start Learning Free</OrangeButton>
            <GhostButton href="#">Browse DSA Sheets</GhostButton>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <AvatarGroup>
              {HERO_AVATARS.map((a) => (
                <motion.div key={a.initials} variants={scaleIn}>
                  <Avatar
                    style={{
                      width: 36,
                      height: 36,
                      border: "2px solid var(--bg, #0f1117)",
                    }}
                  >
                    <AvatarFallback
                      style={{
                        background: a.bg,
                        color: "#fff",
                        fontFamily: "Nunito, sans-serif",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
            </AvatarGroup>
            <span
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--text-dim, #64748b)",
              }}
            >
              Join 1,000+ engineers already on BaseCase
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="bc-hero-card"
        >
          <Card
            style={{
              background: "var(--card, #1e2736)",
              border: "1px solid var(--border, #2d3748)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <CardContent style={{ padding: 0 }}>
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border, #2d3748)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Fira Code, monospace",
                    fontSize: 12,
                    color: "var(--text-dim, #64748b)",
                  }}
                >
                  BaseCase - Striver&apos;s SDE Sheet {"\u00B7"} live
                </span>
              </div>

              <div style={{ padding: "12px 18px" }}>
                <div
                  style={{
                    fontFamily: "Fira Code, monospace",
                    fontSize: 12,
                    color: "var(--text-muted, #94a3b8)",
                    marginBottom: 8,
                  }}
                >
                  42 / 191 solved {"\u00B7"} 22% complete
                </div>
                <Progress
                  value={22}
                  style={{ height: 6, background: "var(--bg2, #161b22)" }}
                  className="[&_[data-slot=progress-indicator]]:bg-[var(--orange, #f97316)]"
                />
              </div>

              <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                {SHEET_PROBLEMS.slice(0, 5).map((p) => (
                  <motion.div
                    key={p.name}
                    variants={fadeUp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 18px",
                      borderBottom: "1px solid var(--border, #2d3748)",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      {p.solved ? (
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
                          <rect width="18" height="18" rx="4" fill="rgba(34,197,94,0.2)" />
                          <path d="M5 9l3 3 5-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 3,
                            border: "1.5px solid var(--border, #2d3748)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          color: p.solved ? "var(--text-dim, #64748b)" : "var(--text, #e2e8f0)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <DifficultyBadge difficulty={p.difficulty} />
                      <ConfidenceBadge confidence={p.confidence} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
