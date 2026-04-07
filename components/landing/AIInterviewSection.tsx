"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/landing-animations";

const modes = [
  { id: "dsa", label: "DSA" },
  { id: "system", label: "System Design" },
  { id: "project", label: "Project-Based" },
  { id: "resume", label: "Job+Resume" },
];

const questionsByMode: Record<string, string[]> = {
  dsa: [
    "In your Two Sum implementation, what tradeoff did you accept to hit O(n)?",
    "How would you adapt your stack-based approach for streaming input?",
    "Where does your current DP template break under memory constraints?",
  ],
  system: [
    "How would you redesign your queue worker to support region failover?",
    "What consistency model do you choose for interview session state, and why?",
    "Where would you place caching in your problem-fetch path to cut tail latency?",
  ],
  project: [
    "Why did you choose BullMQ for background analysis over simpler task schedulers?",
    "Walk through the retry + idempotency flow in your analysis worker pipeline.",
    "What is the fallback behavior when semantic indexing fails for a repo file?",
  ],
  resume: [
    "You mention AI interview orchestration on your resume. What was hardest to ship?",
    "Describe one architecture decision you would reverse today and why.",
    "How did you measure user outcome improvements after launching spaced repetition?",
  ],
};

export default function AIInterviewSection() {
  const [activeMode, setActiveMode] = useState("dsa");
  const [questionIndex, setQuestionIndex] = useState(0);

  const activeQuestions = useMemo(
    () => questionsByMode[activeMode],
    [activeMode],
  );

  useEffect(() => {
    setQuestionIndex(0);
  }, [activeMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % activeQuestions.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [activeQuestions]);

  return (
    <section
      id="interviews"
      className="py-30"
      style={{ background: "#0A0A0A", borderTop: "1px solid #1E1E1E" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-14"
        >
          <h2
            className="text-[40px] sm:text-[48px] md:text-[56px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            The Interview Room.{" "}
            <span className="text-gradient-bc">Rebuilt.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-xl p-5 sm:p-6 mb-8"
          style={{
            background: "rgba(232,73,15,0.07)",
            border: "1px solid rgba(232,73,15,0.24)",
            borderLeft: "4px solid #E8490F",
          }}
        >
          <p
            className="text-[16px] leading-[1.65]"
            style={{ color: "rgba(255,255,255,0.86)" }}
          >
            BaseCase reads your GitHub repo - AST-parsed, semantically indexed -
            and interviews you on YOUR code.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
              {modes.map((mode) => {
                const active = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className="text-sm px-4 py-2 rounded-full transition-all"
                    style={{
                      background: active ? "#E8490F" : "transparent",
                      color: active ? "#fff" : "rgba(255,255,255,0.65)",
                      border: active
                        ? "1px solid #E8490F"
                        : "1px solid #2A2A2A",
                    }}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-base leading-[1.7] max-w-[60ch]"
              style={{ color: "#A0A0A0" }}
            >
              Switch interview modes based on your target. Each round adapts
              follow-up depth based on your responses and explanations.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#111111",
                border: "1px solid #1E1E1E",
                boxShadow: "0 20px 48px rgba(0,0,0,0.45)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid #1E1E1E" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#ef4444",
                      animation: "pulse-dot 1.2s ease-in-out infinite",
                    }}
                  />
                  <span className="text-xs text-white">
                    AI Interview -{" "}
                    {modes.find((m) => m.id === activeMode)?.label}
                  </span>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  ● Recording
                </span>
              </div>

              <div className="p-5 space-y-3" style={{ minHeight: 220 }}>
                <div
                  className="text-[11px]"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  repo-context: aakash-1702/basecase
                </div>
                <motion.div
                  key={`${activeMode}-${questionIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid #1E1E1E",
                  }}
                >
                  <p
                    className="text-[14px] leading-[1.7]"
                    style={{ color: "rgba(255,255,255,0.86)" }}
                  >
                    {activeQuestions[questionIndex]}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
