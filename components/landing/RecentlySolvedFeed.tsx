"use client";

import { useEffect, useMemo, useState } from "react";

const feed = [
  { initials: "AK", problem: "Two Sum", difficulty: "Easy" },
  {
    initials: "PS",
    problem: "Longest Substring Without Repeating",
    difficulty: "Medium",
  },
  { initials: "RM", problem: "Merge Intervals", difficulty: "Medium" },
  { initials: "DV", problem: "Valid Parentheses", difficulty: "Easy" },
  { initials: "SK", problem: "Number of Islands", difficulty: "Hard" },
];

export default function RecentlySolvedFeed() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const initialTimer = setTimeout(() => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setIndex((prev) => (prev + 1) % feed.length);
      }, 5000);
    }, 3000);

    const cycleTimer = setInterval(() => {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        setIndex((prev) => (prev + 1) % feed.length);
      }, 5000);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const item = useMemo(() => feed[index], [index]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden sm:flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300 flex items-center justify-center">
        {item.initials}
      </div>
      <p className="font-mono text-xs text-zinc-400">
        <span className="text-zinc-200">just solved</span> {item.problem} ·{" "}
        {item.difficulty}
      </p>
    </div>
  );
}
