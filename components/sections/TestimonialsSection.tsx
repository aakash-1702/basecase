"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { TESTIMONIALS, scaleIn, staggerContainer } from "@/lib/constants";
import SectionLabel from "@/components/shared/SectionLabel";

export default function TestimonialsSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      style={{ background: "var(--bg2, #161b22)", padding: "90px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>WHAT ENGINEERS SAY</SectionLabel>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
          className="bc-testimonials-grid"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={scaleIn}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card
                style={{
                  background: "var(--card, #1e2736)",
                  border: "1px solid var(--border, #2d3748)",
                  borderRadius: 12,
                  boxShadow: "none",
                }}
              >
                <CardContent style={{ padding: 28 }}>
                  <div
                    style={{
                      color: "var(--orange, #f97316)",
                      fontWeight: 800,
                      fontSize: 16,
                      marginBottom: 14,
                      letterSpacing: 2,
                    }}
                  >
                    {"\u2605\u2605\u2605\u2605\u2605"}
                  </div>
                  <h4
                    style={{
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--text, #e2e8f0)",
                      marginBottom: 10,
                    }}
                  >
                    {t.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--text-muted, #94a3b8)",
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}
                  >
                    {t.body}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar style={{ width: 36, height: 36 }}>
                      <AvatarFallback
                        style={{
                          background: t.color,
                          color: "#fff",
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        style={{
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--text, #e2e8f0)",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 600,
                          fontSize: 12,
                          color: "var(--text-dim, #64748b)",
                        }}
                      >
                        {t.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
