"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SHEET_PROBLEMS, fadeUp, staggerContainer } from "@/lib/constants";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import ConfidenceBadge from "@/components/shared/ConfidenceBadge";

export default function DsaSheetMock() {
  return (
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border, #2d3748)",
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#eab308" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: 12, color: "var(--text-dim, #64748b)" }}>
            Striver&apos;s SDE Sheet
          </span>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: 11, color: "var(--text-dim, #64748b)" }}>
            191 problems {"\u00B7"} 42 solved
          </span>
        </div>

        <div style={{ padding: "12px 18px" }}>
          <div style={{ fontFamily: "Fira Code, monospace", fontSize: 12, color: "var(--text-muted, #94a3b8)", marginBottom: 8 }}>
            42 / 191 solved {"\u00B7"} 22% complete
          </div>
          <Progress
            value={22}
            style={{ height: 6, background: "var(--bg2, #161b22)" }}
            className="[&_[data-slot=progress-indicator]]:bg-[var(--orange, #f97316)]"
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {SHEET_PROBLEMS.map((problem) => (
            <motion.div
              key={problem.name}
              variants={fadeUp}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid var(--border, #2d3748)",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                {problem.solved ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <rect width="18" height="18" rx="4" fill="rgba(34,197,94,0.2)" />
                    <path d="M5 9l3 3 5-6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: "1.5px solid var(--border, #2d3748)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: problem.solved ? "var(--text-muted, #94a3b8)" : "var(--text, #e2e8f0)",
                    textDecoration: problem.solved ? "line-through" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {problem.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <DifficultyBadge difficulty={problem.difficulty} />
                <ConfidenceBadge confidence={problem.confidence} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
