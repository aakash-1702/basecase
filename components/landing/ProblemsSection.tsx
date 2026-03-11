"use client";

import { useEffect, useState } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import Link from "next/link";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

// Famous demo problems for display
const DEMO_PROBLEMS: Problem[] = [
  {
    id: "1",
    title: "Two Sum",
    description:
      "Given an array of integers, return indices of two numbers that add up to a target.",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
  },
  {
    id: "2",
    title: "Valid Parentheses",
    description:
      "Determine if an input string has valid open and close bracket pairs.",
    difficulty: "Easy",
    tags: ["Stack", "String"],
  },
  {
    id: "3",
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists into one sorted linked list.",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
  },
  {
    id: "4",
    title: "Longest Substring Without Repeating",
    description:
      "Find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    tags: ["Sliding Window", "Hash Table"],
  },
  {
    id: "5",
    title: "3Sum",
    description: "Find all unique triplets in the array that sum to zero.",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
  },
  {
    id: "6",
    title: "Trapping Rain Water",
    description:
      "Compute how much water can be trapped after raining given elevation map.",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Stack"],
  },
];

export default function ProblemsSection() {
  const [problems, setProblems] = useState<Problem[]>(DEMO_PROBLEMS);
  const ref = useScrollReveal();

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch("/api/problems");
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        if (data && data.length > 0) {
          setProblems(data.slice(0, 6));
        }
      } catch (error) {
        // Use demo problems as fallback
      }
    }

    fetchProblems();
  }, []);

  return (
    <section ref={ref} className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Tag */}
        <p className="text-amber-500 font-[JetBrains Mono] uppercase text-xs tracking-widest mb-4">
          // Problem Library
        </p>

        {/* Heading */}
        <h2 className="font-[Syne] font-extrabold text-3xl mb-8">
          Every Pattern. Explained Through Practice.
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-8">
          Not just a list of problems. A library built around how patterns
          actually appear in interviews — so practicing one problem teaches you
          to solve ten.
        </p>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/[0.06] rounded-2xl overflow-hidden">
          {problems.map((problem) => (
            <Link
              href={`/problems/${problem.id}`}
              key={problem.id}
              className="relative bg-[#0c0c0f] hover:bg-[#12151a] p-5 group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Top Border Line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#f97316] to-[#fbbf24] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

              {/* Difficulty Badge */}
              <span
                className={`inline-block mb-2 px-2 py-0.5 rounded text-[10px] font-[JetBrains Mono] font-medium ${
                  problem.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-400"
                    : problem.difficulty === "Medium"
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {problem.difficulty}
              </span>

              {/* Problem Title */}
              <h3 className="font-[Syne] font-bold text-white mb-2">
                {problem.title}
              </h3>

              {/* Problem Description */}
              <p className="text-zinc-500 text-sm mb-4">
                {problem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#1a1f2e] text-zinc-500 font-[JetBrains Mono] text-[11px] rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <span className="text-amber-500 text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-400 font-medium text-sm hover:bg-amber-600/20 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Browse all 500+ problems
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
