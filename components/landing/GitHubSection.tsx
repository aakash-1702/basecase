"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/landing-animations";
import { useGithubStars } from "@/hooks/useGithubStars";
import { Bug, Lightbulb, Wrench, Star } from "lucide-react";

const actionCards = [
  {
    icon: Bug,
    title: "Report a Bug",
    desc: "Flag blockers and broken flows so fixes ship faster.",
    href: "https://github.com/aakash-1702/basecase/issues/new",
    tint: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.28)",
    iconColor: "#ef4444",
  },
  {
    icon: Lightbulb,
    title: "Suggest an Idea",
    desc: "Propose features, UX improvements, and roadmap wins.",
    href: "https://github.com/aakash-1702/basecase/discussions",
    tint: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.28)",
    iconColor: "#f59e0b",
  },
  {
    icon: Wrench,
    title: "Contribute Code",
    desc: "Pick an issue and help ship interview-prep infra in public.",
    href: "https://github.com/aakash-1702/basecase/blob/main/CONTRIBUTING.md",
    tint: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.28)",
    iconColor: "#22c55e",
  },
];

export default function GitHubSection() {
  const { stars, loading } = useGithubStars();

  return (
    <section
      className="py-30"
      style={{ background: "#0A0A0A", borderTop: "1px solid #1E1E1E" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[40px] sm:text-[48px] md:text-[56px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Built in Public.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-base max-w-[60ch] mx-auto"
            style={{ color: "#A0A0A0" }}
          >
            BaseCase ships in the open with visible iteration, user feedback
            loops, and fast community-driven improvements.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: "#111111", border: "1px solid #1E1E1E" }}
          >
            <span
              className="text-[11px]"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              feat(interview): improve repo-context prompt grounding + retry
              safety
            </span>
          </motion.div>

          {!loading && (
            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm"
              style={{ color: "#A0A0A0" }}
            >
              Currently at <span style={{ color: "#E8490F" }}>★ {stars}</span> -
              growing daily
            </motion.p>
          )}

          <motion.a
            variants={fadeUp}
            href="https://github.com/aakash-1702/basecase"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg mt-7 text-sm font-medium"
            style={{
              color: "#fff",
              border: "1px solid rgba(232,73,15,0.35)",
              background: "rgba(232,73,15,0.08)",
            }}
          >
            <Star className="w-4 h-4" style={{ color: "#E8490F" }} />
            Star on GitHub
          </motion.a>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
        >
          {actionCards.map((card) => (
            <motion.a
              key={card.title}
              variants={fadeUp}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-7 rounded-xl feature-card-hover"
              style={{ background: "#111111", border: "1px solid #1E1E1E" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: card.tint,
                  border: `1px solid ${card.border}`,
                }}
              >
                <card.icon
                  className="w-5 h-5"
                  style={{ color: card.iconColor }}
                />
              </div>
              <h3
                className="text-white text-lg font-semibold mt-4"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm mt-2 leading-[1.65]"
                style={{ color: "#A0A0A0" }}
              >
                {card.desc}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
