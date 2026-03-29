"use client";

import { useEffect, useMemo, useState } from "react";

const feed = [
  { initials: "AK", problem: "Two Sum", difficulty: "Easy", color: "text-emerald-400" },
  { initials: "PS", problem: "Longest Substring Without Repeating", difficulty: "Medium", color: "text-amber-400" },
  { initials: "RM", problem: "Merge Intervals", difficulty: "Medium", color: "text-amber-400" },
  { initials: "DV", problem: "Valid Parentheses", difficulty: "Easy", color: "text-emerald-400" },
  { initials: "SK", problem: "Number of Islands", difficulty: "Hard", color: "text-rose-400" },
];

export default function RecentlySolvedFeed() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % feed.length);
        }, 400); // wait for exit animation
      }, 5000);
    };

    const initialTimer = setTimeout(show, 3000);
    const cycleTimer = setInterval(show, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const item = useMemo(() => feed[index], [index]);

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 hidden sm:flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-400 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300 flex items-center justify-center shrink-0">
        {item.initials}
      </div>
      <div className="flex flex-col">
        <p className="font-mono text-xs text-zinc-300 leading-tight">
          <span className="text-zinc-500">just solved</span>{" "}
          {item.problem}
        </p>
        <span className={`text-[10px] font-mono ${item.color}`}>
          {item.difficulty}
        </span>
      </div>
    </div>
  );
}
