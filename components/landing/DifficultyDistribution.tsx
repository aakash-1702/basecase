"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const rows = [
  {
    name: "Easy",
    count: 312,
    width: "78%",
    track: "bg-zinc-800",
    fill: "bg-emerald-500",
    text: "text-emerald-400",
  },
  {
    name: "Medium",
    count: 156,
    width: "52%",
    track: "bg-zinc-800",
    fill: "bg-amber-500",
    text: "text-amber-400",
  },
  {
    name: "Hard",
    count: 32,
    width: "24%",
    track: "bg-zinc-800",
    fill: "bg-rose-500",
    text: "text-rose-400",
  },
];

export default function DifficultyDistribution() {
  return (
    <section className="py-8 md:py-10 border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="font-mono text-sm sm:text-base text-zinc-300">
            Problem Difficulty Distribution
          </h3>
          <Badge
            variant="outline"
            className="text-[10px] sm:text-xs border-orange-500/30 text-orange-400 bg-orange-500/5"
          >
            500 total
          </Badge>
        </div>

        <div className="space-y-4">
          {rows.map((row, i) => (
            <div
              key={row.name}
              className="grid grid-cols-[60px_1fr_auto] sm:grid-cols-[80px_1fr_auto] items-center gap-3 sm:gap-4"
            >
              <span className={`text-xs sm:text-sm font-mono ${row.text}`}>
                {row.name}
              </span>
              <div
                className={`h-2.5 rounded-full overflow-hidden ${row.track}`}
              >
                <motion.div
                  className={`h-full rounded-full ${row.fill}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: row.width }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-500 font-mono whitespace-nowrap">
                {row.count} problems
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
