"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  FileText,
  Mic,
  TrendingUp,
  Bot,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const slideLeft = {
  initial: { opacity: 0, x: -32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const slideRight = {
  initial: { opacity: 0, x: 32 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

export default function GamificationSection() {
  return (
    <section
      id="interview"
      className="bg-zinc-950 border-y border-zinc-800/60 py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            {...slideLeft}
            className="order-2 lg:order-1 flex flex-col items-center justify-center gap-8 p-8 sm:p-10 rounded-2xl border border-zinc-800 bg-zinc-900/40"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full bg-orange-500/5 animate-ping animation-duration-[2.5s]" />
              <div className="absolute w-20 h-20 rounded-full bg-orange-500/8 animate-ping animation-duration-[2s] animation-delay-300" />
              <div className="relative w-16 h-16 rounded-full bg-zinc-800 border-2 border-orange-500/40 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <Bot className="w-7 h-7 text-orange-400" />
              </div>
            </div>
            <p className="text-zinc-400 text-sm font-medium -mt-2">
              AI Interviewer
            </p>

            <div className="flex items-end gap-1.5 h-10">
              {[
                "wave-1",
                "wave-2",
                "wave-3",
                "wave-4",
                "wave-5",
                "wave-3",
                "wave-1",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full bg-orange-500 ${cls}`}
                  style={{ minHeight: 4 }}
                />
              ))}
            </div>

            <Badge className="bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-medium px-3 py-1.5 gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot" />
              Recording...
            </Badge>

            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-zinc-400 text-xs font-mono mb-3 uppercase tracking-wider">
                Previous session
              </p>
              {[
                { label: "Technical Depth", score: 82 },
                { label: "Clarity", score: 76 },
                { label: "Confidence", score: 90 },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 mb-2.5 last:mb-0"
                >
                  <span className="text-zinc-500 text-xs w-32 shrink-0">
                    {s.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.score}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3 + i * 0.15,
                        ease: "easeOut",
                      }}
                      className="h-full bg-orange-500 rounded-full"
                    />
                  </div>
                  <span className="text-orange-400 text-xs font-mono w-8 text-right">
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...slideRight}
            className="order-1 lg:order-2 flex flex-col gap-5"
          >
            <Badge
              variant="outline"
              className="border-orange-500/40 text-orange-400 bg-orange-500/10"
            >
              Mock Interviews
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
              Practice like it's{" "}
              <span className="text-zinc-500">the real thing</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Powered by Gemini with Sarvam TTS voice output - our AI
              interviewer listens, adapts follow-ups to your answer, and
              delivers a structured report on confidence, depth, and technical
              accuracy.
            </p>

            {[
              [Mic, "Voice-first, hands-free sessions"],
              [BrainCircuit, "Gemini-powered adaptive questioning"],
              [FileText, "Detailed post-session feedback report"],
              [TrendingUp, "Track score improvements over time"],
            ].map(([Icon, label]) => (
              <div
                key={label as string}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                </div>
                {label as string}
              </div>
            ))}

            <div className="flex flex-wrap gap-2 mt-1">
              {["DSA", "System Design", "Technical", "HR", "Behavioral"].map(
                (mode) => (
                  <Badge
                    key={mode}
                    variant="secondary"
                    className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs hover:border-orange-500/30 hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    {mode}
                  </Badge>
                ),
              )}
            </div>

            <Button
              asChild
              className="group gap-2 w-fit bg-white text-zinc-950 hover:bg-zinc-100 font-semibold mt-2"
            >
              <Link
                href="/interview"
                className="inline-flex items-center gap-1.5"
              >
                Start a Mock Interview{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
