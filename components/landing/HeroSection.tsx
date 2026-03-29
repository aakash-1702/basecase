"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Map,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const scaleUp = {
  initial: { opacity: 0, scale: 0.88 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: {
    duration: 0.45,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const rows = [
  {
    title: "Sort 0s, 1s & 2s",
    difficulty: "Easy",
    confidence: "Confident",
    dot: "bg-emerald-500",
  },
  {
    title: "Stock Buy & Sell",
    difficulty: "Easy",
    confidence: "Confident",
    dot: "bg-emerald-500",
  },
  {
    title: "Next Permutation",
    difficulty: "Medium",
    confidence: "Shaky",
    dot: "bg-amber-500",
  },
  {
    title: "Kadane's Algorithm",
    difficulty: "Medium",
    confidence: "Shaky",
    dot: "bg-amber-500",
  },
  {
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    confidence: "-",
    dot: "bg-zinc-500",
    status: "unsolved",
  },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  if (difficulty === "Easy")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
        Easy
      </Badge>
    );
  if (difficulty === "Medium")
    return (
      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30">
      Hard
    </Badge>
  );
}

export default function HeroSection() {
  const lines = [
    "Master DSA with structured sheets and spaced repetition.",
    "Practice voice mock interviews powered by Gemini AI.",
    "Generate a personalized roadmap to your target company.",
  ];

  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = lines[lineIndex];
    const speed = isDeleting ? 24 : 48;

    const timer = setTimeout(() => {
      if (!isDeleting && typedText.length < currentLine.length) {
        setTypedText(currentLine.slice(0, typedText.length + 1));
        return;
      }

      if (!isDeleting && typedText.length === currentLine.length) {
        setTimeout(() => setIsDeleting(true), 2500);
        return;
      }

      if (isDeleting && typedText.length > 0) {
        setTypedText(currentLine.slice(0, typedText.length - 1));
        return;
      }

      if (isDeleting && typedText.length === 0) {
        setIsDeleting(false);
        setLineIndex((prev) => (prev + 1) % lines.length);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, lineIndex, lines]);

  return (
    <section
      id="home"
      className="relative min-h-[94vh] hero-grid flex flex-col items-center justify-center overflow-hidden py-16 md:py-24 lg:py-32"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-50 bg-orange-500/8 blur-[80px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/90 -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center z-10">
          <motion.div {...scaleUp}>
            <Badge
              variant="outline"
              className="border-orange-500/35 text-orange-400 bg-orange-500/5 text-xs font-medium px-3 py-1.5 gap-2 cursor-default hover:bg-orange-500/10 transition-colors"
            >
              <span>🔥</span>
              <span>Trusted by 1,000+ developers</span>
              <span className="text-orange-500/50 mx-1">·</span>
              <span className="underline underline-offset-2">
                See what's inside
              </span>
              <ChevronRight className="w-3 h-3" />
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tight text-white"
          >
            Stop grinding randomly.
          </motion.h1>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tight text-white text-center"
          >
            Start learning with{" "}
            <span className="relative inline-block">
              <span className="text-gradient-orange">structure</span>
              <svg
                className="absolute -bottom-1 sm:-bottom-2 left-0 w-full overflow-visible"
                height="8"
                viewBox="0 0 220 8"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 5 C40 1, 80 7, 120 4 C160 1, 200 6, 218 3"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.26 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto text-center mt-4 leading-relaxed"
          >
            <span className="cursor-blink">{typedText}</span>
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.34 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto group gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_30px_rgba(255,255,255,0.18)] transition-all duration-300"
            >
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-zinc-600 bg-zinc-900/65 text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-300"
            >
              <Link href="/sheets">Browse DSA Sheets</Link>
            </Button>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
          >
            <div className="flex -space-x-2.5">
              {[
                ["RK", "bg-zinc-600"],
                ["PV", "bg-zinc-700"],
                ["AS", "bg-zinc-600"],
                ["MJ", "bg-zinc-800"],
                ["TA", "bg-zinc-700"],
              ].map(([name, bg]) => (
                <div
                  key={name}
                  className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${bg} text-zinc-300`}
                >
                  {name}
                </div>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Join{" "}
              <span className="text-white font-medium">1,000+ engineers</span>{" "}
              already on BaseCase
            </span>
          </motion.div>
        </div>

        <motion.div
          {...fadeIn}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-12 sm:mt-16 md:mt-20 w-full max-w-full sm:max-w-170 mx-auto px-2 sm:px-4 md:px-0 animate-float overflow-hidden"
        >
          <Card className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_0_80px_rgba(249,115,22,0.12),0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="flex-1 text-center font-mono text-xs text-zinc-500">
                  BaseCase - Striver's SDE Sheet
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    live
                  </span>
                </div>
              </div>

              <div className="flex">
                <div className="hidden sm:flex flex-col gap-3 p-3 bg-zinc-900/60 border-r border-zinc-800 w-12">
                  {[LayoutGrid, BarChart3, Map, Settings].map((Icon, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        i === 0
                          ? "bg-orange-500/15 text-orange-400"
                          : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>

                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Arrays - Step 1
                      </p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">
                        42 / 191 solved
                      </p>
                    </div>
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs w-fit">
                      22% complete
                    </Badge>
                  </div>

                  <Progress value={22} className="h-1.5 mb-5 bg-zinc-800" />

                  {rows.map((row) => (
                    <div
                      key={row.title}
                      className="flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`}
                      />
                      <span
                        className={`flex-1 text-xs sm:text-sm font-medium truncate ${row.confidence === "-" ? "text-zinc-500" : "text-zinc-200"}`}
                      >
                        {row.title}
                      </span>
                      <DifficultyBadge difficulty={row.difficulty} />
                      {row.confidence !== "-" && (
                        <span
                          className={`hidden sm:block text-[10px] px-2 py-0.5 rounded font-medium ${
                            row.confidence === "Confident"
                              ? "bg-green-400/8 text-green-500"
                              : "bg-yellow-400/8 text-yellow-500"
                          }`}
                        >
                          {row.confidence}
                        </span>
                      )}
                      <ExternalLink className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  ))}

                  <div className="mt-3 h-px shimmer-line rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
