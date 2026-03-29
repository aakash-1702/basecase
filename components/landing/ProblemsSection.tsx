"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  LayoutGrid,
  Map,
  Mic,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const features = [
  {
    icon: LayoutGrid,
    title: "Structured DSA Sheets",
    description:
      "Blind 75, NeetCode 150, Striver's SDE Sheet - topic-ordered, difficulty-ramped, and cross-linked. Never wonder what to study next.",
  },
  {
    icon: BrainCircuit,
    title: "SM-2 Spaced Repetition",
    description:
      "The same algorithm behind Anki. BaseCase rates your confidence after every problem and schedules the next review at the exact right moment.",
  },
  {
    icon: Mic,
    title: "AI Voice Mock Interviews",
    description:
      "Voice-first sessions powered by Gemini with Sarvam TTS. Adaptive follow-ups, real-time responses, and a structured report every time.",
  },
  {
    icon: BarChart3,
    title: "Radar Analytics",
    description:
      "See your topic-wise strengths and blind spots on one chart. Pinpoint exactly what to fix before your next round - not after.",
  },
  {
    icon: Map,
    title: "AI-Generated Roadmaps",
    description:
      "Tell BaseCase your target company and timeline. It generates a personalized roadmap with real problem checkpoints - powered by OpenAI Agents.",
  },
  {
    icon: Bot,
    title: "Gemini-Powered Mentor",
    description:
      "Per-problem AI hints, complexity coaching, and debug help - with Redis-backed conversation history so context is never lost between sessions.",
  },
];

export default function ProblemsSection() {
  return (
    <section id="problems" className="py-20 md:py-28 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center" {...fadeUp}>
          <Badge
            variant="outline"
            className="border-orange-500/30 text-orange-400 bg-orange-500/5 mb-4"
          >
            Platform Features
          </Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
            Everything you need to{" "}
            <span className="text-zinc-400">crack the interview</span>
          </h2>
          <p className="mt-4 text-zinc-500 text-base">
            No more switching between 5 tabs. BaseCase has it all in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-14 sm:mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              whileHover={{
                y: -3,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              className="group"
            >
              <Card className="glow-hover bg-zinc-950 border-zinc-800 p-5 sm:p-6 cursor-default h-full flex flex-col">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center mb-5 shrink-0">
                    <feature.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold text-base sm:text-lg tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-orange-400/0 group-hover:text-orange-400/80 transition-colors text-xs font-medium">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
