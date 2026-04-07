"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FinalCtaSection() {
  return (
    <section
      style={{
        padding: "120px 48px",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Subtle wavey mesh gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />
      {/* Bottom glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 350,
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            color: "#f97316",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          CTA
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            fontSize: "clamp(32px, 4.5vw, 48px)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.15,
            margin: "0 0 20px",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          Start Practicing Free
          <br />
          <span style={{ color: "#9ca3af", fontWeight: 600 }}>It&apos;s completely free to get started.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#6b7280",
            fontSize: 16,
            lineHeight: 1.7,
            margin: "0 0 40px",
          }}
        >
          Start your free and join thousands of engineers who are already practicing
          smarter with BaseCase.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/auth/sign-up"
            id="final-cta-button"
            style={{
              display: "inline-block",
              background: "#f97316",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              padding: "16px 44px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: "0.2px",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 40px rgba(249,115,22,0.55), 0 0 12px rgba(249,115,22,0.3)";
              e.currentTarget.style.background = "#ea6c0a";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#f97316";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Start Practicing Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
