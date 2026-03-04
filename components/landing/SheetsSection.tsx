"use client";

import { useEffect, useState } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import Link from "next/link";

interface Sheet {
  id: string;
  title: string;
  problemsCount: number;
  progress: number; // Completion percentage
  learners: number;
  icon: string; // Emoji icon
  createdAt: string; // Date of creation
}

// Demo sheets for display
const DEMO_SHEETS: Sheet[] = [
  {
    id: "1",
    title: "Blind 75",
    problemsCount: 75,
    progress: 0,
    learners: 12500,
    icon: "🎯",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "NeetCode 150",
    problemsCount: 150,
    progress: 0,
    learners: 9800,
    icon: "🚀",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    title: "Striver's SDE Sheet",
    problemsCount: 191,
    progress: 0,
    learners: 15200,
    icon: "⚡",
    createdAt: "2023-08-10",
  },
  {
    id: "4",
    title: "Top Interview 150",
    problemsCount: 150,
    progress: 0,
    learners: 8500,
    icon: "💼",
    createdAt: "2025-01-01",
  },
];

export default function SheetsSection() {
  const [sheets, setSheets] = useState<Sheet[]>(DEMO_SHEETS);
  const ref = useScrollReveal();

  useEffect(() => {
    async function fetchSheets() {
      try {
        const response = await fetch("/api/sheets");
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        if (data && data.length > 0) {
          setSheets(data.slice(0, 4));
        }
      } catch (error) {
        // Use demo sheets as fallback
        console.log("Using demo sheets");
      }
    }

    fetchSheets();
  }, []);

  // Determine popular and new sheets
  const mostLearnersSheet =
    sheets.length > 0
      ? sheets.reduce(
          (prev, current) =>
            current.learners > prev.learners ? current : prev,
          sheets[0],
        )
      : null;
  const newestSheet =
    sheets.length > 0
      ? sheets.reduce(
          (prev, current) =>
            new Date(current.createdAt) > new Date(prev.createdAt)
              ? current
              : prev,
          sheets[0],
        )
      : null;

  return (
    <section className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Tag */}
        <p className="text-amber-500 font-[JetBrains Mono] uppercase text-xs tracking-widest mb-4">
          // Curated Sheets
        </p>

        {/* Heading */}
        <h2 className="font-[Syne] font-extrabold text-3xl mb-8">
          Stop Grinding Randomly. Follow a Proven Path.
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-8">
          Every sheet is a complete learning track — ordered by concept,
          difficulty-ramped, and built around how interviews actually test you.
        </p>

        {/* Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sheets.map((sheet) => (
            <Link
              href={`/sheets/${sheet.id}`}
              key={sheet.id}
              className="group relative bg-[#0c0c0f] border border-white/[0.06] rounded-2xl p-7 hover:border-[#f97316]/30 hover:shadow-[0_0_40px_rgba(249,115,22,0.05)] transition-all duration-300 cursor-pointer hover:scale-[1.01]"
            >
              {/* Badge */}
              {sheet.id === mostLearnersSheet?.id && (
                <span className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
              {sheet.id === newestSheet?.id &&
                sheet.id !== mostLearnersSheet?.id && (
                  <span className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}

              {/* Icon */}
              <div className="w-11 h-11 bg-[#f97316]/10 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">
                {sheet.icon}
              </div>

              {/* Title */}
              <h3 className="font-[Syne] font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                {sheet.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <p className="text-zinc-500 text-sm">
                  {sheet.problemsCount} problems •{" "}
                  {sheet.learners.toLocaleString()} learners
                </p>
                <span className="text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Sheets Section */}
        <div className="mt-16">
          <p className="text-amber-500 font-[JetBrains Mono] uppercase text-xs tracking-widest mb-6">
            // Most Popular Tracks
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Arrays Sheet */}
            <Link
              href="/sheets/arrays"
              className="group relative bg-gradient-to-br from-blue-950/40 to-neutral-900/40 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Essential
                </span>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-2xl">
                📊
              </div>
              <h3 className="font-[Syne] font-bold text-white text-lg mb-2">
                Arrays & Hashing
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                Master the foundation. Two pointers, sliding window, prefix
                sums, and more.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">45 problems</span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </Link>

            {/* Dynamic Programming Sheet */}
            <Link
              href="/sheets/dp"
              className="group relative bg-gradient-to-br from-purple-950/40 to-neutral-900/40 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Interview Favorite
                </span>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🧠
              </div>
              <h3 className="font-[Syne] font-bold text-white text-lg mb-2">
                Dynamic Programming
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                From 1D to 2D DP. Memoization, tabulation, state machines
                explained.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">52 problems</span>
                <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </Link>

            {/* Graphs Sheet */}
            <Link
              href="/sheets/graphs"
              className="group relative bg-gradient-to-br from-emerald-950/40 to-neutral-900/40 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Advanced
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🕸️
              </div>
              <h3 className="font-[Syne] font-bold text-white text-lg mb-2">
                Graphs & Trees
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                BFS, DFS, Dijkstra, Union Find. Everything you need for graph
                mastery.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">48 problems</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <Link
            href="/sheets"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-400 font-medium text-sm hover:bg-amber-600/20 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            View all 40+ sheets
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
