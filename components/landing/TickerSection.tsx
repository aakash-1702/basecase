"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

function useCounter(target: number, inView: boolean, duration = 1600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const increment = target / (duration / 12);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 12);

    return () => clearInterval(timer);
  }, [target, inView, duration]);

  return count;
}

export default function TickerSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const stats = useMemo(
    () => [
      { target: 500, label: "Problems", suffix: "+" },
      { target: 1000, label: "Active Users", suffix: "+" },
      { target: 20, label: "Mock Interviews Conducted", suffix: "+" },
      { target: 10, label: "Curated DSA Sheets", suffix: "+" },
    ],
    [],
  );

  return (
    <section
      id="stats"
      ref={ref}
      className="bg-zinc-950 border-y border-zinc-800/60 py-10 md:py-14"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="grid grid-cols-2 md:grid-cols-4" {...fadeUp}>
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              target={stat.target}
              label={stat.label}
              suffix={stat.suffix}
              inView={inView}
              duration={1600 + index * 120}
              index={index}
            />
          ))}
        </motion.div>

        {/* Difficulty split — stacked bar + legend */}
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          className="mt-6 pt-6 border-t border-zinc-800/40"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-zinc-600 text-[11px] font-mono uppercase tracking-widest shrink-0">
              Difficulty
            </span>

            {/* Stacked bar */}
            <div className="w-full sm:flex-1 max-w-xs h-1.5 rounded-full bg-zinc-800/60 overflow-hidden flex">
              {[
                { pct: 62, color: "bg-emerald-500" },
                { pct: 31, color: "bg-amber-500" },
                { pct: 7, color: "bg-rose-500" },
              ].map((seg, i) => (
                <motion.div
                  key={i}
                  className={`h-full ${seg.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${seg.pct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: 0.4 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </div>

            {/* Legend chips */}
            <div className="flex items-center gap-4 sm:gap-5 shrink-0">
              {[
                { label: "Easy", count: 312, color: "bg-emerald-500", text: "text-emerald-400" },
                { label: "Medium", count: 156, color: "bg-amber-500", text: "text-amber-400" },
                { label: "Hard", count: 32, color: "bg-rose-500", text: "text-rose-400" },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${d.color}`} />
                  <span className={`text-[11px] sm:text-xs font-mono font-medium ${d.text}`}>
                    {d.count}
                  </span>
                  <span className="text-zinc-600 text-[11px] sm:text-xs">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatItem({
  target,
  label,
  suffix,
  inView,
  duration,
  index,
}: {
  target: number;
  label: string;
  suffix: string;
  inView: boolean;
  duration: number;
  index: number;
}) {
  const value = useCounter(target, inView, duration);

  // Mobile 2×2 grid: remove right border on 2nd/4th items, remove bottom border on 3rd/4th
  const borderClasses = [
    "border-r border-b md:border-b-0 md:border-r",          // 1st: right + bottom on mobile
    "border-b md:border-b-0 md:border-r",                   // 2nd: no right on mobile
    "border-r md:border-r",                                  // 3rd: right, no bottom
    "",                                                       // 4th: no borders
  ][index] ?? "";

  return (
    <motion.div
      {...staggerChild}
      transition={{ ...staggerChild.transition, delay: index * 0.1 }}
      className={`flex flex-col items-center justify-center py-6 sm:py-8 px-3 sm:px-4 text-center border-zinc-800/60 ${borderClasses}`}
    >
      <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono text-white tabular-nums tracking-tight">
        {value.toLocaleString()}
        <span className="text-orange-500">{suffix}</span>
      </p>
      <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 mt-1.5 font-medium">
        {label}
      </p>
    </motion.div>
  );
}
