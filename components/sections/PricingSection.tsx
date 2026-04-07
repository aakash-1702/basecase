"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING, fadeUp, staggerContainer } from "@/lib/constants";
import OrangeButton from "@/components/shared/OrangeButton";
import GhostButton from "@/components/shared/GhostButton";

export default function PricingSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bg, #0f1117)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 42px)",
            color: "var(--text, #e2e8f0)",
            letterSpacing: "-1.5px",
            marginBottom: 8,
          }}
        >
          Simple, honest pricing
        </motion.h2>
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "Nunito, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            color: "var(--text-muted, #94a3b8)",
            marginBottom: 48,
          }}
        >
          Start free. Upgrade when you&apos;re ready.
        </motion.p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="bc-pricing-grid">
          <motion.div variants={fadeUp}>
            <Card
              style={{
                background: "var(--card, #1e2736)",
                border: "1px solid var(--border, #2d3748)",
                borderRadius: 12,
                textAlign: "left",
                boxShadow: "none",
              }}
            >
              <CardContent style={{ padding: 32 }}>
                <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text, #e2e8f0)", marginBottom: 4 }}>
                  Free
                </h3>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 40, color: "var(--text, #e2e8f0)", marginBottom: 4 }}>
                  {PRICING.free.price}
                </div>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--text-dim, #64748b)", marginBottom: 24 }}>
                  {PRICING.free.label}
                </div>
                <div style={{ marginBottom: 24 }}>
                  {PRICING.free.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-muted, #94a3b8)" }}>
                      <span style={{ color: "var(--green, #22c55e)" }}>{"\u2713"}</span>
                      {f}
                    </div>
                  ))}
                </div>
                <GhostButton href="#" style={{ width: "100%", padding: "12px 24px", textAlign: "center", justifyContent: "center" }}>
                  Get Started Free
                </GhostButton>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeUp}
            animate={{
              boxShadow: [
                "0 0 40px rgba(249,115,22,0.15)",
                "0 0 60px rgba(249,115,22,0.25)",
                "0 0 40px rgba(249,115,22,0.15)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              style={{
                background: "var(--card, #1e2736)",
                border: "1px solid var(--orange, #f97316)",
                borderRadius: 12,
                textAlign: "left",
                position: "relative",
                boxShadow: "none",
              }}
            >
              <CardContent style={{ padding: 32 }}>
                <Badge
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--orange, #f97316)",
                    color: "#fff",
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 800,
                    fontSize: 11,
                    padding: "4px 14px",
                    borderRadius: 100,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    border: "none",
                  }}
                >
                  Most Popular
                </Badge>
                <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text, #e2e8f0)", marginBottom: 4 }}>
                  Pro
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 40, color: "var(--text, #e2e8f0)" }}>{PRICING.pro.price}</span>
                  <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 600, fontSize: 16, color: "var(--text-dim, #64748b)", textDecoration: "line-through" }}>
                    {PRICING.pro.originalPrice}
                  </span>
                </div>
                <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--orange, #f97316)", marginBottom: 24 }}>
                  {PRICING.pro.discount}
                </div>
                <div style={{ marginBottom: 24 }}>
                  {PRICING.pro.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text-muted, #94a3b8)" }}>
                      <span style={{ color: "var(--green, #22c55e)" }}>{"\u2713"}</span>
                      {f}
                    </div>
                  ))}
                </div>
                <OrangeButton href="#" style={{ width: "100%", padding: "12px 24px", textAlign: "center", justifyContent: "center" }}>
                  Upgrade to Pro
                </OrangeButton>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
