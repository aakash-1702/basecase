"use client";

import { motion } from "framer-motion";
import { ROADMAP_BULLETS, slideInLeft, slideInRight, staggerContainer } from "@/lib/constants";
import SectionLabel from "@/components/shared/SectionLabel";
import OrangeButton from "@/components/shared/OrangeButton";
import RoadmapMock from "@/components/ui-mocks/RoadmapMock";

export default function RoadmapSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bg2, #161b22)", padding: "90px 24px" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
        className="bc-two-col"
      >
        <motion.div variants={slideInLeft}>
          <SectionLabel>LEARNING ROADMAPS</SectionLabel>
          <h2
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(26px, 3.5vw, 38px)",
              color: "var(--text, #e2e8f0)",
              letterSpacing: "-1.5px",
              marginBottom: 16,
            }}
          >
            Your personal path to the offer
          </h2>
          <p
            style={{
              fontFamily: "Nunito, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--text-muted, #94a3b8)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Describe your target role and timeline. BaseCase generates a step-by-step
            roadmap using OpenAI Agents {"\u2014"} or follow a community-built one. Every
            checkpoint links to real problems and tracks exactly where you are.
          </p>
          <div style={{ marginBottom: 28 }}>
            {ROADMAP_BULLETS.map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--text-muted, #94a3b8)",
                }}
              >
                <span style={{ color: "var(--orange, #f97316)", fontWeight: 800 }}>{"\u25B8"}</span>
                {b}
              </div>
            ))}
          </div>
          <OrangeButton href="#">Generate My Roadmap {"\u2192"}</OrangeButton>
        </motion.div>

        <motion.div variants={slideInRight}>
          <RoadmapMock />
        </motion.div>
      </div>
    </motion.section>
  );
}
