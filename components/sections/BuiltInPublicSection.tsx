"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { COMMITS, fadeUp, staggerContainer } from "@/lib/constants";
import GhostButton from "@/components/shared/GhostButton";

export default function BuiltInPublicSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{
        background: "var(--bg, #0f1117)",
        borderTop: "1px solid var(--border, #2d3748)",
        borderBottom: "1px solid var(--border, #2d3748)",
        padding: "90px 24px",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--text, #e2e8f0)",
            letterSpacing: "-1.5px",
            marginBottom: 20,
          }}
        >
          BaseCase is being built in public. Follow the journey
        </motion.h2>

        <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
          <GhostButton href="#">{"\u2B50"} Star on GitHub</GhostButton>
        </motion.div>

        <div style={{ textAlign: "left" }}>
          {COMMITS.map((c, i) => (
            <motion.div
              key={`${c.type}-${c.message}`}
              variants={fadeUp}
              transition={{ delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--border, #2d3748)",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge
                  style={{
                    fontFamily: "Fira Code, monospace",
                    fontWeight: 600,
                    fontSize: 12,
                    borderRadius: 999,
                    padding: "3px 10px",
                    background:
                      c.type === "feat" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: c.type === "feat" ? "var(--green, #22c55e)" : "var(--red, #ef4444)",
                    border: `1px solid ${
                      c.type === "feat"
                        ? "rgba(34,197,94,0.3)"
                        : "rgba(239,68,68,0.3)"
                    }`,
                  }}
                >
                  {c.type}
                </Badge>
                <span
                  style={{
                    fontFamily: "Fira Code, monospace",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--text, #e2e8f0)",
                  }}
                >
                  {c.message}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Fira Code, monospace",
                  fontSize: 12,
                  color: "var(--text-dim, #64748b)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {c.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
