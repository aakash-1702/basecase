"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/landing-animations";

const topics = [
  { name: "Arrays", count: 45 },
  { name: "Linked List", count: 29 },
  { name: "Binary Search", count: 24 },
  { name: "Recursion", count: 20 },
  { name: "Stack & Queue", count: 31 },
  { name: "Binary Trees", count: 41 },
  { name: "BST", count: 22 },
  { name: "Heaps", count: 18 },
  { name: "Graphs", count: 37 },
  { name: "Dynamic Programming", count: 56 },
  { name: "Tries", count: 14 },
  { name: "Bit Manipulation", count: 16 },
  { name: "Sliding Window", count: 21 },
  { name: "Two Pointers", count: 28 },
  { name: "Greedy", count: 23 },
  { name: "Hashing", count: 19 },
  { name: "Sorting", count: 12 },
  { name: "Strings", count: 34 },
  { name: "Backtracking", count: 26 },
  { name: "Math", count: 17 },
];

function A2ZCard() {
  return (
    <motion.article
      variants={fadeUp}
      className="glass-card-landing feature-card-hover p-8 relative"
    >
      <h3
        className="text-xl text-white font-semibold"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        A2Z DSA Sheet
      </h3>
      <p className="mt-2 text-sm leading-[1.65]" style={{ color: "#A0A0A0" }}>
        Complete progression from fundamentals to advanced interview patterns.
      </p>
      <div
        className="mt-5 rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid #1E1E1E",
        }}
      >
        <div
          className="flex justify-between text-[11px] mb-2"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Advanced</span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full"
            style={{
              width: "74%",
              background:
                "linear-gradient(90deg, #16a34a 0%, #f59e0b 58%, #E8490F 100%)",
            }}
          />
        </div>
      </div>
      <p className="mt-3 text-[12px]" style={{ color: "#E8490F" }}>
        20+ topics • 455+ problems
      </p>
    </motion.article>
  );
}

function SDECard() {
  return (
    <motion.article
      variants={fadeUp}
      className="glass-card-landing feature-card-hover p-8 relative"
    >
      <span
        className="absolute top-6 right-6 text-[11px] px-2.5 py-1 rounded-full"
        style={{
          color: "#E8490F",
          background: "rgba(232,73,15,0.1)",
          border: "1px solid rgba(232,73,15,0.22)",
        }}
      >
        FAANG-Focused
      </span>
      <h3
        className="text-xl text-white font-semibold"
        style={{ fontFamily: "var(--font-syne), sans-serif" }}
      >
        SDE Interview Sheet
      </h3>
      <p
        className="mt-2 text-sm leading-[1.65] max-w-[42ch]"
        style={{ color: "#A0A0A0" }}
      >
        A sharp shortlist of high-frequency interview problems curated from real
        hiring rounds.
      </p>
      <p
        className="mt-6 text-[40px] leading-none font-extrabold"
        style={{ color: "#E8490F", fontFamily: "var(--font-syne), sans-serif" }}
      >
        191
      </p>
      <p
        className="text-[13px] mt-1"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        interview-critical problems
      </p>
    </motion.article>
  );
}

export default function TopicsGrid() {
  return (
    <section
      id="sheets"
      className="py-30"
      style={{ background: "#0A0A0A", borderTop: "1px solid #1E1E1E" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-12"
        >
          <h2
            className="text-[40px] sm:text-[48px] md:text-[56px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Master Every Topic.{" "}
            <span className="text-gradient-bc">Zero to Expert.</span>
          </h2>
          <p
            className="mt-4 text-base max-w-[60ch] mx-auto"
            style={{ color: "#A0A0A0" }}
          >
            Dense, scannable topic coverage inspired by catalog-style prep
            platforms.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-12"
        >
          {topics.map((topic) => (
            <motion.div
              key={topic.name}
              variants={fadeUp}
              className="group px-3 py-2 rounded-lg transition-all cursor-default"
              style={{ background: "#111111", border: "1px solid #1E1E1E" }}
            >
              <p
                className="text-[12px] truncate"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                <span className="group-hover:hidden">{topic.name}</span>
                <span className="hidden group-hover:inline">
                  {topic.name} - {topic.count} problems
                </span>
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <A2ZCard />
          <SDECard />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-end mt-6"
        >
          <a
            href="/sheets"
            className="text-sm font-medium"
            style={{ color: "#E8490F" }}
          >
            Browse All Sheets →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
