"use client";

import { motion } from "framer-motion";

const cards = [
  {
    num: "1",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Solve DSA",
    desc: "Curated DSA solutions with guided step-by-step approaches and personalized roadmaps to track your progress.",
  },
  {
    num: "2",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Mock Interview",
    desc: "Simulate real test interviews assisted by AI, instantly analyze performance, and overcome any tricky problem.",
  },
  {
    num: "3",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Improve",
    desc: "Get a clear path to improve and stay consistent. Real feedback helps you innovate and master every difficult concept.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="features"
      style={{
        padding: "100px 48px",
        background: "#0a0a0a",
        position: "relative",
        overflow: "hidden",
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

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: 60 }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              fontFamily: "var(--font-nunito), sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            How It Works
          </h2>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="bc-how-grid"
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.1,
              }}
            >
              <div
                style={{
                  background: "#161616",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: 32,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(249,115,22,0.25)";
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Big background number */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: -20,
                    right: 10,
                    fontSize: "clamp(120px, 14vw, 180px)",
                    fontWeight: 900,
                    color: "rgba(249,115,22,0.12)",
                    lineHeight: 1,
                    userSelect: "none",
                    pointerEvents: "none",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                >
                  {card.num}
                </div>

                {/* Icon */}
                <div
                  style={{
                    color: "#9ca3af",
                    marginBottom: 20,
                    display: "inline-block",
                  }}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#ffffff",
                    margin: "0 0 12px",
                    fontFamily: "var(--font-nunito), sans-serif",
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: 14,
                    lineHeight: 1.7,
                    margin: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bc-how-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          #features { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}
