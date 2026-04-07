"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn } from "@/lib/constants";
import OrangeButton from "@/components/shared/OrangeButton";
import GhostButton from "@/components/shared/GhostButton";

export default function FinalCtaSection() {
  return (
    <section style={{ background: "var(--bg, #0f1117)", position: "relative", overflow: "hidden", padding: "100px 24px" }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.25, 0.18] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: "clamp(32px, 5vw, 56px)", color: "var(--text, #e2e8f0)", letterSpacing: "-2px", marginBottom: 16 }}
        >
          Ready to stop grinding randomly?
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "Nunito, sans-serif", fontWeight: 600, fontSize: 17, color: "var(--text-muted, #94a3b8)", marginBottom: 32 }}
        >
          Join 1,000+ engineers who prep smarter with BaseCase.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <OrangeButton href="#">Start for Free</OrangeButton>
          <GhostButton href="#">Browse Sheets</GhostButton>
        </motion.div>
      </div>
    </section>
  );
}
