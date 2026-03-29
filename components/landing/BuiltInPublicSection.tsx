"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, GitCommit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const commits = [
  { type: "feat", msg: "add SM-2 spaced repetition", time: "2 days ago" },
  { type: "fix", msg: "voice interview race condition", time: "4 days ago" },
  { type: "feat", msg: "roadmap generator v1", time: "1 week ago" },
];

export default function BuiltInPublicSection() {
  return (
    <section className="py-12 sm:py-14 border-y border-zinc-800/60 bg-zinc-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center" {...fadeUp}>
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-400 bg-zinc-900"
          >
            Built In Public
          </Badge>

          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            BaseCase is being built in public. Follow the journey
            <ArrowRight className="inline-block w-3.5 h-3.5 ml-1" />
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-mono text-xs border-zinc-600 bg-zinc-900/60 text-white hover:bg-zinc-800 hover:border-zinc-500 transition-all"
            >
              <Link
                href="https://github.com/aakash-1702/basecase"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="mt-7 mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden"
        >
          {commits.map((item, index) => (
            <div
              key={item.msg}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors ${
                index > 0 ? "border-t border-zinc-800/40" : ""
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    item.type === "feat"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {item.type}
                </span>
                <span className="font-mono text-xs sm:text-sm text-zinc-300 truncate">
                  {item.msg}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-zinc-600 font-mono shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
