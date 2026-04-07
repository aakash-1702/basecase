"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTERVIEW_SCORES, INTERVIEW_TYPES, scaleIn, staggerContainer } from "@/lib/constants";

function AnimatedScore({ value, inView }: { value: number; inView: boolean }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, mv, value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function InterviewMock() {
  const ref = useRef<HTMLDivElement | null>(null);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border, #2d3748)",
          }}
        >
          <span
            className="bc-pulse-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--red, #ef4444)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "Fira Code, monospace",
              fontSize: 13,
              color: "var(--red, #ef4444)",
              fontWeight: 500,
            }}
          >
            Recording...
          </span>
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              background: "var(--bg3, #1c2333)",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text, #e2e8f0)",
                lineHeight: 1.55,
              }}
            >
              Great explanation. Now, can you walk me through the time complexity of your
              approach and whether there&apos;s a more optimal solution?
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}
          >
            {INTERVIEW_SCORES.map((s) => (
              <motion.div
                key={s.label}
                variants={scaleIn}
                style={{
                  background: "var(--bg2, #161b22)",
                  borderRadius: 8,
                  padding: "14px 12px",
                  textAlign: "center",
                  border: "1px solid var(--border, #2d3748)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Fira Code, monospace",
                    fontSize: 32,
                    fontWeight: 600,
                    color: "var(--orange, #f97316)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  <AnimatedScore value={s.value} inView={inView} />
                </div>
                <div
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-dim, #64748b)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <Tabs defaultValue={INTERVIEW_TYPES[0]}>
            <TabsList
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                background: "transparent",
                width: "100%",
                height: "auto",
                justifyContent: "flex-start",
                padding: 0,
              }}
            >
              {INTERVIEW_TYPES.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="bc-interview-tab"
                  style={{
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 800,
                    fontSize: 12,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "var(--bg3, #1c2333)",
                    color: "var(--text-muted, #94a3b8)",
                    border: "1px solid var(--border, #2d3748)",
                  }}
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
