"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Bot, Code, Gauge } from "lucide-react";

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

const statItems = [
  { icon: Users, target: 500, suffix: "+", label: "Engineers Learning" },
  { icon: Bot, target: 30, suffix: "+", label: "AI Interviews Daily" },
  {
    icon: Code,
    target: 200,
    prefix: "<",
    suffix: "ms",
    label: "Avg. Execution",
  },
  { icon: Gauge, target: 500, suffix: "+", label: "Curated Problems" },
];

export default function TickerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      ref={ref}
      className="w-full py-4 md:py-5"
      style={{
        background: "#101010",
        borderTop: "1px solid #1E1E1E",
        borderBottom: "1px solid #1E1E1E",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-1">
          {statItems.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              target={stat.target}
              prefix={stat.prefix}
              suffix={stat.suffix}
              label={stat.label}
              inView={inView}
              index={index}
              isLast={index === statItems.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  target,
  prefix,
  suffix,
  label,
  inView,
  index,
  isLast,
}: {
  icon: React.ElementType;
  target: number;
  prefix?: string;
  suffix: string;
  label: string;
  inView: boolean;
  index: number;
  isLast: boolean;
}) {
  const value = useCounter(target, inView, 1200 + index * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col items-center justify-center py-3 px-3 text-center relative"
    >
      {!isLast && (
        <div
          className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12"
          style={{ background: "#1E1E1E" }}
        />
      )}

      <Icon
        className="w-4 h-4 mb-1.5"
        style={{ color: "rgba(255,255,255,0.35)" }}
      />
      <p
        className="text-2xl sm:text-3xl md:text-[38px] font-bold tabular-nums tracking-tight"
        style={{
          fontFamily: "var(--font-syne), sans-serif",
          color: "#E8490F",
        }}
      >
        {prefix}
        {value.toLocaleString()}
        {suffix && <span style={{ color: "#E8490F" }}>{suffix}</span>}
      </p>
      <p
        className="text-[11px] sm:text-xs mt-0.5"
        style={{
          color: "#A0A0A0",
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}
      >
        {label}
      </p>
    </motion.div>
  );
}
