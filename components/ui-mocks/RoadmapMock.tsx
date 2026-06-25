"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROADMAP_STEPS } from "@/lib/constants";

export default function RoadmapMock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Card
      ref={ref}
      style={{
        background: "var(--card, #1e2736)",
        border: "1px solid var(--border, #2d3748)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "none",
      }}
    >
      <CardContent style={{ padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border, #2d3748)" }}>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: 13, color: "var(--text-muted, #94a3b8)" }}>
            My Roadmap {"\u2014"} Backend SDE @ Flipkart
          </span>
        </div>

        <div style={{ padding: 18 }}>
          {ROADMAP_STEPS.map((step, i) => (
            <div key={step.topic} style={{ marginBottom: i < ROADMAP_STEPS.length - 1 ? 18 : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text, #e2e8f0)" }}>
                  {step.topic}
                </span>
                <span style={{ fontFamily: "Fira Code, monospace", fontWeight: 600, fontSize: 13, color: step.color }}>
                  {step.percent}%
                </span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bg2, #161b22)", borderRadius: 3, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${step.percent}%` } : { width: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                  style={{ height: "100%", background: step.color, borderRadius: 3 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border, #2d3748)" }}>
          <span style={{ fontFamily: "Fira Code, monospace", fontSize: 12, color: "var(--text-dim, #64748b)" }}>
            4 topics {"\u00B7"} ~12 weeks {"\u00B7"}{" "}
            <span style={{ color: "var(--orange, #f97316)" }}>View roadmap {"\u2192"}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
