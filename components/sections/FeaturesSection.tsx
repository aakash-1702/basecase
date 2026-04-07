"use client";

import { motion } from "framer-motion";
import { FEATURES, fadeUp, staggerContainer } from "@/lib/constants";
import SectionLabel from "@/components/shared/SectionLabel";
import FeatureCard from "@/components/shared/FeatureCard";

export default function FeaturesSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bc-bg2)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div variants={fadeUp}>
          <SectionLabel>PLATFORM FEATURES</SectionLabel>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--bc-text)",
            letterSpacing: "-1.5px",
            marginBottom: 8,
          }}
        >
          Everything you need to crack the interview
        </motion.h2>
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: "var(--bc-text-muted)",
            marginBottom: 48,
            maxWidth: 560,
          }}
        >
          No more switching between 5 tabs. BaseCase has it all in one place.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            border: "1px solid var(--bc-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
          className="bc-features-grid"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              style={{
                borderRight: (i + 1) % 3 !== 0 ? "1px solid var(--bc-border)" : "none",
                borderBottom: i < 3 ? "1px solid var(--bc-border)" : "none",
              }}
            >
              <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
