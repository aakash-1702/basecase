"use client";

import { motion, useMotionValue, useTransform, useInView, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { STATS, scaleIn, staggerContainer } from "@/lib/constants";

function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 1.2, ease: "easeOut" });
    }
  }, [inView, count, value]);

  return <motion.span>{rounded}</motion.span>;
}

function parseStatNumber(str: string): { num: number; suffix: string } {
  const match = str.match(/^([\d,]+)(.*)$/);
  if (!match) return { num: 0, suffix: str };
  return { num: parseInt(match[1].replace(/,/g, ""), 10), suffix: match[2] };
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{
        background: "var(--bc-border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
        }}
        className="bc-stats-grid"
      >
        {STATS.map((stat) => {
          const { num, suffix } = parseStatNumber(stat.number);
          return (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              style={{
                background: "var(--bc-bg2)",
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 40,
                  fontWeight: 900,
                  color: "var(--bc-text)",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                <AnimatedNumber value={num} inView={inView} />
                <span style={{ color: "var(--bc-orange)" }}>{suffix}</span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "var(--bc-text-dim)",
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
