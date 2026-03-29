"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

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

const milestones = [
  { title: "Arrays Fundamentals", pct: 100, state: "done" },
  { title: "Binary Search", pct: 60, state: "partial" },
  { title: "Dynamic Programming", pct: 0, state: "todo" },
  { title: "Graph Theory", pct: 0, state: "todo" },
] as const;

export default function ActivitySection() {
  return (
    <section id="roadmap" className="py-20 md:py-28 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...slideLeft} className="flex flex-col gap-5">
            <Badge
              variant="outline"
              className="border-orange-500/40 text-orange-400 bg-orange-500/10"
            >
              Learning Roadmaps
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
              Your personal path to the offer
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Describe your target role and timeline. BaseCase generates a
              step-by-step roadmap using OpenAI Agents - or follow a
              community-built one. Every checkpoint links to real problems and
              tracks exactly where you are.
            </p>

            <ul className="mt-1 space-y-3 text-sm sm:text-base text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 text-orange-500">✓</span>Public and
                private roadmaps
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 text-orange-500">✓</span>AI-generated via
                OpenAI Agents + credit system
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 text-orange-500">✓</span>Every step links
                directly to real problems
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 text-orange-500">✓</span>Visual progress
                per roadmap checkpoint
              </li>
            </ul>

            <Button
              asChild
              className="group gap-2 w-fit mt-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold"
            >
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-1.5"
              >
                Generate My Roadmap{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div {...slideRight}>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-6">
                My Roadmap - Backend SDE @ Flipkart
              </p>

              <div className="relative flex flex-col gap-0 pl-6">
                <motion.div
                  className="absolute left-2.25 top-2 bottom-2 w-px bg-linear-to-b from-orange-500 via-orange-500/40 to-zinc-700"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ transformOrigin: "top" }}
                />

                {milestones.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative flex items-start gap-4 pb-7 last:pb-0"
                  >
                    <div
                      className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                        item.state === "done"
                          ? "bg-orange-500 border-orange-500"
                          : item.state === "partial"
                            ? "bg-orange-500/30 border-orange-500"
                            : "bg-zinc-900 border-zinc-600"
                      }`}
                    >
                      {item.state === "done" && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm font-medium ${
                            item.state === "todo"
                              ? "text-zinc-500"
                              : "text-zinc-200"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span
                          className={`text-xs font-mono shrink-0 ${
                            item.pct === 100
                              ? "text-orange-400"
                              : item.pct > 0
                                ? "text-yellow-500"
                                : "text-zinc-600"
                          }`}
                        >
                          {item.pct}%
                        </span>
                      </div>

                      {(item.state === "done" || item.state === "partial") && (
                        <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.7,
                              delay: 0.3 + i * 0.15,
                            }}
                            className="h-full bg-orange-500 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">
                  4 topics · ~12 weeks
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-300 bg-orange-500/10 hover:text-orange-200 hover:bg-orange-500/20 border border-orange-500/25 text-xs gap-1.5 group"
                >
                  View roadmap
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
