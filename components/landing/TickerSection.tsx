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

  return (
    <motion.div
      {...staggerChild}
      transition={{ ...staggerChild.transition, delay: index * 0.1 }}
      className="flex flex-col items-center justify-center py-8 px-4 text-center border-r border-b md:border-b-0 border-zinc-800/60 odd:border-r last:border-r-0 md:last:border-r-0"
    >
      <p className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums tracking-tight">
        {value.toLocaleString()}
        <span className="text-orange-500">{suffix}</span>
      </p>
      <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 font-medium">
        {label}
      </p>
    </motion.div>
  );
}
