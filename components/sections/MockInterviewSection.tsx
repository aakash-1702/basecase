"use client";

import { motion } from "framer-motion";
import {
  MOCK_INTERVIEW_BULLETS,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from "@/lib/constants";
import SectionLabel from "@/components/shared/SectionLabel";
import OrangeButton from "@/components/shared/OrangeButton";
import InterviewMock from "@/components/ui-mocks/InterviewMock";

export default function MockInterviewSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bg, #0f1117)", padding: "90px 24px" }}
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
          <InterviewMock />
        </motion.div>

        <motion.div variants={slideInRight}>
          <SectionLabel>AI MOCK INTERVIEWS</SectionLabel>
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
            Practice like it&apos;s the real thing
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
            Powered by Gemini with Sarvam TTS voice output {"\u2014"} our AI interviewer
            listens, adapts follow-ups to your answer, and delivers a structured report
            on confidence, depth, and technical accuracy.
          </p>

          <div style={{ marginBottom: 28 }}>
            {MOCK_INTERVIEW_BULLETS.map((b) => (
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

          <OrangeButton href="#">Start a Mock Interview {"\u2192"}</OrangeButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
