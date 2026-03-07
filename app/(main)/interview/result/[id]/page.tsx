import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { transcripts } from "@/lib/mockData";

const getScoreMessage = (score: number) => {
  if (score >= 9) return "Outstanding performance. You're interview-ready.";
  if (score >= 8)
    return "You explained concepts clearly. A bit more depth on edge cases and you're there.";
  if (score >= 6)
    return "Solid foundation. Keep sharpening â€” you're closer than you think.";
  return "Good start. Every session builds the muscle. Keep going.";
};

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");

  const { id } = await params;

  const result = {
    company: "Google",
    type: "Technical",
    score: 8.2,
    duration: "18 min",
    date: "7 Mar 2026",
  };

  const transcript = transcripts["1"] || [];

  const strengths = [
    "Clear, structured explanations",
    "Strong understanding of REST fundamentals",
    "Good backend conceptual depth",
  ];

  const improvements = [
    "GraphQL caching strategies",
    "API versioning approaches",
    "System design breadth",
  ];

  const scorePercent = (result.score / 10) * 100;
  const scoreColor =
    result.score >= 8
      ? "text-emerald-400"
      : result.score >= 6
        ? "text-amber-400"
        : "text-red-400";
  const scoreGlow =
    result.score >= 8
      ? "shadow-emerald-500/20"
      : result.score >= 6
        ? "shadow-amber-500/20"
        : "shadow-red-500/20";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Back */}
        <Link href="/interview">
          <button className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to dashboard
          </button>
        </Link>

        {/* Hero score */}
        <div className="p-8 rounded-2xl border border-[#1F1F2A] bg-[#111117] space-y-6">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Interview complete
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#F5F5F7]">
                {result.company} Â· {result.type}
              </h1>
              <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-md">
                {getScoreMessage(result.score)}
              </p>
            </div>
            <div
              className={`p-5 rounded-xl border border-[#1F1F2A] shadow-xl ${scoreGlow} text-center shrink-0`}
            >
              <div className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
                {result.score}
              </div>
              <div className="text-[10px] text-[#A1A1AA] mt-1 uppercase tracking-widest">
                / 10
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-[#1F1F2A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#A1A1AA]/50">
              <span>{result.duration}</span>
              <span>{result.date}</span>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-[#A1A1AA]">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                To sharpen
              </h3>
            </div>
            <ul className="space-y-2">
              {improvements.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0 mt-2" />
                  <span className="text-sm text-[#A1A1AA]">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest">
            Question Breakdown
          </h2>

          {transcript.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#1F1F2A] bg-[#111117] overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-[#1F1F2A]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest">
                    Q{index + 1}
                  </span>
                  <p className="text-sm font-medium text-[#F5F5F7]">
                    {item.question}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#1F1F2A]">
                <div className="px-5 py-4 space-y-1">
                  <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Your answer
                  </p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {item.answer}
                  </p>
                </div>

                <div className="px-5 py-4 space-y-1">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3" /> AI feedback
                  </p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {item.feedback}
                  </p>
                </div>

                {item.suggestedAnswer && (
                  <div className="px-5 py-4 space-y-1">
                    <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" /> Stronger answer
                    </p>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {item.suggestedAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1F1F2A]">
          <Link href="/interview">
            <button className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </Link>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-900/30">
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
