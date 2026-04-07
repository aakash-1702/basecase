"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function StopRandomSection() {
  return (
    <section
      style={{
        padding: "100px 48px",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Mesh grid */}
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

      {/* Central glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            margin: "0 0 20px",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          Stop Preparing Randomly.
          <br />
          Start Preparing Smart.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#9ca3af",
            fontSize: 18,
            lineHeight: 1.6,
            margin: "0 0 48px",
          }}
        >
          Get structured roadmaps and expert guidance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/auth/sign-up"
            id="cta-stop-random"
            style={{
              display: "inline-block",
              background: "#f97316",
              color: "#fff",
              fontWeight: 800,
              fontSize: 18,
              padding: "18px 56px",
              borderRadius: 12,
              textDecoration: "none",
              letterSpacing: "0.2px",
              transition: "all 0.25s ease",
              boxShadow: "0 0 0 0 rgba(249,115,22,0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 48px rgba(249,115,22,0.6), 0 0 16px rgba(249,115,22,0.3)";
              e.currentTarget.style.background = "#ea6c0a";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 0 rgba(249,115,22,0)";
              e.currentTarget.style.background = "#f97316";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Start Practicing Free
          </Link>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          #cta-stop-random section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}
