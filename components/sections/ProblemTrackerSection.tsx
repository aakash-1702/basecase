"use client";

import { motion } from "framer-motion";
import { fadeUp, PROBLEM_TRACKER_POINTS, slideInLeft, slideInRight, staggerContainer } from "@/lib/constants";
import SectionLabel from "@/components/shared/SectionLabel";
import DsaSheetMock from "@/components/ui-mocks/DsaSheetMock";
import { Card, CardContent } from "@/components/ui/card";

export default function ProblemTrackerSection() {
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
          <SectionLabel>PROBLEM TRACKER</SectionLabel>
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
            A smarter way to track your DSA progress
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
            Mark problems solved, rate your confidence, and let the SM-2 algorithm handle
            your revision schedule. Focus on learning instead of spreadsheet management.
          </p>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {PROBLEM_TRACKER_POINTS.map((p) => (
              <motion.div key={p.title} variants={fadeUp}>
                <Card
                  style={{
                    border: "1px solid var(--border, #2d3748)",
                    background: "var(--card, #1e2736)",
                    borderRadius: 8,
                    boxShadow: "none",
                    marginBottom: 8,
                  }}
                >
                  <CardContent style={{ padding: "12px 14px", display: "flex", gap: 10 }}>
                    <span
                      style={{
                        color: "var(--green, #22c55e)",
                        fontWeight: 800,
                        fontSize: 15,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {p.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--text, #e2e8f0)",
                          marginBottom: 4,
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "var(--text-dim, #64748b)",
                          lineHeight: 1.5,
                        }}
                      >
                        {p.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={slideInRight}>
          <DsaSheetMock />
        </motion.div>
      </div>
    </motion.section>
  );
}
