"use client";

import { motion } from "framer-motion";
import { STEPS, fadeUp, staggerContainer, slideInLeft } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bc-bg)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--bc-text)",
            letterSpacing: "-1.5px",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          From zero to offer in 3 steps
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="bc-steps-grid"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={slideInLeft}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bc-card)",
                border: "1px solid var(--bc-border)",
                borderRadius: 12,
                padding: 32,
              }}
            >
              {/* Ghost number */}
              <div
                style={{
                  fontFamily: "var(--font-fira), monospace",
                  fontSize: 56,
                  fontWeight: 900,
                  WebkitTextStroke: "1px var(--bc-orange)",
                  color: "transparent",
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "var(--bc-text)",
                  marginBottom: 10,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--bc-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
