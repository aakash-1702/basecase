"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/landing-animations";

const ringData = [
  { label: "DP", pct: 35, color: "#E8490F" },
  { label: "Graphs", pct: 20, color: "#f59e0b" },
];

const dots = [
  "solved",
  "solved",
  "revisited",
  "untouched",
  "solved",
  "revisited",
  "solved",
  "untouched",
  "revisited",
  "solved",
  "untouched",
  "solved",
  "revisited",
  "untouched",
  "solved",
  "solved",
  "revisited",
  "untouched",
  "solved",
  "revisited",
  "solved",
  "untouched",
  "solved",
  "untouched",
  "revisited",
  "solved",
  "solved",
  "revisited",
];

function dotColor(state: string) {
  if (state === "solved") return "#22c55e";
  if (state === "revisited") return "#E8490F";
  return "#2f2f2f";
}

function Ring({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid #1E1E1E",
      }}
    >
      <div className="flex items-center justify-center">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />
          <motion.circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform="rotate(-90 44 44)"
            whileInView={{ strokeDashoffset: targetOffset }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>
      <p className="text-center text-sm mt-2 text-white font-medium">{label}</p>
      <p className="text-center text-[12px]" style={{ color }}>
        {pct}%
      </p>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section
      className="py-30 relative overflow-hidden"
      style={{
        background: "#101010",
        borderTop: "1px solid #1E1E1E",
        borderBottom: "1px solid #1E1E1E",
      }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-155 h-55 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(232,73,15,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            Your Progress.{" "}
            <span className="text-gradient-bc">Surfaced Intelligently.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-8"
          style={{
            background: "#111111",
            border: "1px solid #1E1E1E",
            boxShadow: "0 18px 56px rgba(0,0,0,0.45)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <span
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{
                color: "#E8490F",
                background: "rgba(232,73,15,0.1)",
                border: "1px solid rgba(232,73,15,0.2)",
              }}
            >
              Weakest Sheets
            </span>
            <span className="text-sm" style={{ color: "#f97316" }}>
              🔥 12-day streak
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {ringData.map((ring) => (
              <Ring
                key={ring.label}
                label={ring.label}
                pct={ring.pct}
                color={ring.color}
              />
            ))}
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1E1E1E",
            }}
          >
            <p
              className="text-xs mb-3"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Activity Map
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dots.map((state, index) => (
                <span
                  key={`${state}-${index}`}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: dotColor(state) }}
                />
              ))}
            </div>
            <div
              className="flex items-center gap-4 mt-4 text-[11px]"
              style={{ color: "#A0A0A0" }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#22c55e" }}
                />
                Solved
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#E8490F" }}
                />
                Revisited
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#2f2f2f" }}
                />
                Untouched
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
