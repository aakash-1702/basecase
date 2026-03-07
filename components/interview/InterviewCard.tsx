"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Interview } from "@/lib/mockData";

const scoreStyle = (score: number) => {
  if (score >= 8) return { color: "text-emerald-400", bar: "bg-emerald-500" };
  if (score >= 6) return { color: "text-amber-400", bar: "bg-amber-500" };
  return { color: "text-red-400", bar: "bg-red-500" };
};

export default function InterviewCard({ interview }: { interview: Interview }) {
  const { color, bar } = scoreStyle(interview.score);
  const scorePercent = (interview.score / 10) * 100;

  return (
    <Link href={`/interview/${interview.id}`}>
      <div className="group relative p-5 rounded-xl border border-[#1F1F2A] bg-[#111117] hover:border-amber-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/8 transition-all duration-300 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7]">
              {interview.company}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              {interview.type} · {interview.difficulty}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#1F1F2A] group-hover:text-amber-500 transition-colors duration-200" />
        </div>

        {/* Score bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-[#A1A1AA]">Score</span>
            <span className={`font-medium ${color}`}>{interview.score}/10</span>
          </div>
          <div className="h-[3px] w-full bg-[#1F1F2A] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${bar} transition-all duration-700`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
          <span>{interview.date}</span>
          <span>{interview.duration}</span>
        </div>

        {/* Topics */}
        {interview.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {interview.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-md text-[10px] bg-[#1A1A22] text-[#A1A1AA]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
