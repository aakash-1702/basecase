"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, LayoutGrid, Mic } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const steps = [
  {
    icon: LayoutGrid,
    title: "Pick a Sheet",
    description:
      "Choose Blind 75, Striver's SDE Sheet, NeetCode 150, or build a custom list with the Sheet Builder. Everything is organized by topic and difficulty.",
  },
  {
    icon: CheckCircle,
    title: "Track Your Confidence",
    description:
      "Mark problems solved and rate your confidence - Confident, Shaky, or Forgot. The SM-2 engine silently builds your optimal review schedule.",
  },
  {
    icon: Mic,
    title: "Run an AI Mock Interview",
    description:
      "When you feel ready, start a voice session. DSA, System Design, HR, or Behavioral. Gemini asks, listens, adapts - then scores you on depth, clarity, and accuracy.",
  },
];

export default function SheetsSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-zinc-950/60 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center" {...fadeUp}>
          <Badge
            variant="outline"
            className="border-orange-500/40 text-orange-400 bg-orange-500/10"
          >
            Get Started
          </Badge>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
            From zero to offer in 3 steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mt-14 relative">
          <div className="hidden md:block absolute top-13 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] border-t-2 border-dashed border-zinc-800 z-0" />
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.12 }}
              className="relative flex flex-col gap-4 z-10"
            >
              <div className="absolute -top-4 -left-2 font-mono font-bold text-7xl sm:text-8xl text-orange-500/8 select-none leading-none z-0">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.08)]">
                <step.icon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-white font-semibold text-lg sm:text-xl tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
