"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Circle, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

const rows = [
  {
    status: "solved",
    title: "Sort 0s, 1s & 2s",
    difficulty: "Easy",
    confidence: "Confident",
  },
  {
    status: "solved",
    title: "Stock Buy & Sell",
    difficulty: "Easy",
    confidence: "Confident",
  },
  {
    status: "solved",
    title: "Next Permutation",
    difficulty: "Medium",
    confidence: "Shaky",
  },
  {
    status: "attempted",
    title: "Kadane's Algorithm",
    difficulty: "Medium",
    confidence: "Shaky",
  },
  {
    status: "unsolved",
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    confidence: "-",
  },
];

export default function EditorSection() {
  return (
    <section id="sheets" className="py-20 md:py-28 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div {...slideLeft} className="flex flex-col gap-5">
            <Badge
              variant="outline"
              className="border-orange-500/40 text-orange-400 bg-orange-500/10"
            >
              Live Preview
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white leading-tight">
              A smarter way to track{" "}
              <span className="text-zinc-500">your DSA progress</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every problem has a status, difficulty, confidence level, and
              personal notes. The SM-2 algorithm surfaces what to review next -
              so the patterns actually stick.
            </p>

            <ul className="flex flex-col gap-3 mt-1">
              {[
                "500+ hand-curated problems across sheets",
                "Confidence-rated spaced repetition scheduling",
                "Topic-wise, difficulty, and status filtering",
                "Persistent revision notes per problem",
              ].map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-start gap-3 text-sm sm:text-base text-zinc-300"
                >
                  <span className="text-orange-500 mt-0.5 font-bold shrink-0">
                    ✓
                  </span>
                  {point}
                </motion.li>
              ))}
            </ul>

            <Button
              asChild
              className="group gap-2 w-fit mt-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold"
            >
              <Link href="/sheets" className="inline-flex items-center gap-1.5">
                Open a Sheet{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div {...slideRight}>
            <Card className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] glow-hover">
              <CardContent className="p-0">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Striver's SDE Sheet
                      </p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">
                        191 problems · 42 solved
                      </p>
                    </div>
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">
                      22%
                    </Badge>
                  </div>
                  <Progress value={22} className="mt-3 h-1.5 bg-zinc-800" />
                </div>

                <div className="px-4 py-2.5 border-b border-zinc-800/60">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">
                    Arrays - Step 1
                  </p>
                </div>

                {rows.map((row) => (
                  <div
                    key={row.title}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/60 transition-colors cursor-pointer group border-b border-zinc-800/40 last:border-0"
                  >
                    {row.status === "solved" ? (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : row.status === "attempted" ? (
                      <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}

                    <span
                      className={`flex-1 text-xs sm:text-sm truncate font-medium ${
                        row.status === "unsolved"
                          ? "text-zinc-500"
                          : "text-zinc-200"
                      }`}
                    >
                      {row.title}
                    </span>

                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 hidden sm:flex ${
                        row.difficulty === "Easy"
                          ? "border-green-500/20 text-green-400 bg-green-400/5"
                          : row.difficulty === "Medium"
                            ? "border-yellow-500/20 text-yellow-400 bg-yellow-400/5"
                            : "border-red-500/20 text-red-400 bg-red-400/5"
                      }`}
                    >
                      {row.difficulty}
                    </Badge>

                    {row.confidence !== "-" && (
                      <span
                        className={`text-[10px] hidden md:block px-2 py-0.5 rounded ${
                          row.confidence === "Confident"
                            ? "text-green-500 bg-green-500/8"
                            : "text-yellow-500 bg-yellow-500/8"
                        }`}
                      >
                        {row.confidence}
                      </span>
                    )}

                    <FileText className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
