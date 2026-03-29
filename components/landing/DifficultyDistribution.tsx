"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const difficulties = [
  {
    name: "Easy",
    count: 312,
    pct: 62,
    color: "bg-emerald-500",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    text: "text-emerald-400",
    ring: "border-emerald-500/30",
    bg: "bg-emerald-500/8",
  },
  {
    name: "Medium",
    count: 156,
    pct: 31,
    color: "bg-amber-500",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    text: "text-amber-400",
    ring: "border-amber-500/30",
    bg: "bg-amber-500/8",
  },
  {
    name: "Hard",
    count: 32,
    pct: 7,
    color: "bg-rose-500",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    text: "text-rose-400",
    ring: "border-rose-500/30",
    bg: "bg-rose-500/8",
  },
];

function useCounter(target: number, inView: boolean, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, inView, duration]);

  return count;
}

export default function DifficultyDistribution() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-6 sm:py-8 border-b border-zinc-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Segmented bar — proportional, like a stacked progress bar */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-zinc-500 text-[11px] sm:text-xs font-mono uppercase tracking-wider shrink-0">
            Difficulty Split
          </span>
          <div className="flex-1 h-2 rounded-full bg-zinc-800/60 overflow-hidden flex">
            {difficulties.map((d, i) => (
              <motion.div
                key={d.name}
                className={`h-full ${d.color} ${i === 0 ? "rounded-l-full" : ""} ${i === difficulties.length - 1 ? "rounded-r-full" : ""}`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${d.pct}%` } : { width: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>
          <span className="text-zinc-600 text-[11px] sm:text-xs font-mono shrink-0">
            500
          </span>
        </div>

        {/* Stat chips */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          {difficulties.map((d, i) => (
            <DifficultyChip
              key={d.name}
              difficulty={d}
              inView={inView}
              delay={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DifficultyChip({
  difficulty,
  inView,
  delay,
}: {
  difficulty: (typeof difficulties)[number];
  inView: boolean;
  delay: number;
}) {
  const count = useCounter(difficulty.count, inView, 1000 + delay * 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.45,
        delay: 0.3 + delay * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border ${difficulty.ring} ${difficulty.bg} transition-colors`}
    >
      <div
        className={`w-2 h-2 rounded-full ${difficulty.color} ${difficulty.glow}`}
      />
      <span
        className={`text-xs sm:text-sm font-semibold ${difficulty.text} tabular-nums`}
      >
        {count}
      </span>
      <span className="text-zinc-500 text-[11px] sm:text-xs">
        {difficulty.name}
      </span>
    </motion.div>
  );
}
