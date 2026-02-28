"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Circle,
  CheckCircle2,
  ExternalLink,
  Trophy,
  Target,
  Flame,
  BookOpen,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH" | null;

const confidenceConfig: Record<
  NonNullable<ConfidenceV2> | "unattempted",
  { label: string; color: string }
> = {
  unattempted: { label: "Unattempted", color: "text-neutral-500" },
  LOW: { label: "Low confidence", color: "text-rose-400" },
  MEDIUM: { label: "Med confidence", color: "text-amber-400" },
  HIGH: { label: "High confidence", color: "text-emerald-400" },
};

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  tags?: string[];
  companies?: string[];
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  problems: {
    id: string;
    order: number;
    problem: Problem;
  }[];
}

interface SheetData {
  id: string;
  title: string;
  description: string;
  slug: string;
  sections: Section[];
}

export default function SheetDetailPage({
  data,
  initialSolvedIds = [],
  initialConfidenceMap = {},
}: {
  data: SheetData;
  initialSolvedIds?: string[];
  initialConfidenceMap?: Record<string, string | null>;
}) {
  const sheet = data;
  const sectionsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Solved state seeded from server on first load ────────────────────────────────
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialSolvedIds.map((id) => [id, true])),
  );

  // ── Confidence / attempted state ─────────────────────────────────────────
  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceV2>>(initialConfidenceMap as Record<string, ConfidenceV2>);

  useEffect(() => {
    setSolvedMap(Object.fromEntries(initialSolvedIds.map((id) => [id, true])));
    setConfidenceMap(initialConfidenceMap as Record<string, ConfidenceV2>);
  }, [initialSolvedIds, initialConfidenceMap]); // eslint-disable-line

  // ── Tooltip for unsolved circle button (no-toggle, just redirects user) ──────
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; h: number } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback((id: string, el: HTMLElement) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = el.getBoundingClientRect();
    setTooltipPos({ x: rect.right, y: rect.top, h: rect.height });
    setTooltipId(id);
    tooltipTimeout.current = setTimeout(() => setTooltipId(null), 3000);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltipId(null);
  }, []);

  const [openSections, setOpenSections] = useState<string[]>([]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const allProblems = useMemo(
    () => sheet.sections.flatMap((s) => s.problems),
    [sheet],
  );
  const totalProblems = allProblems.length;
  const easyCnt = useMemo(
    () => allProblems.filter((p) => p.problem.difficulty === "easy").length,
    [allProblems],
  );
  const medCnt = useMemo(
    () => allProblems.filter((p) => p.problem.difficulty === "medium").length,
    [allProblems],
  );
  const hardCnt = useMemo(
    () => allProblems.filter((p) => p.problem.difficulty === "hard").length,
    [allProblems],
  );

  const totalSolvedLive = Object.values(solvedMap).filter(Boolean).length;
  const overallPctLive = totalProblems
    ? Math.round((totalSolvedLive / totalProblems) * 100)
    : 0;

  // Solved is read-only; progress syncs automatically when user solves on the problem page.

  // ── Jump helpers ───────────────────────────────────────────────────────────
  const handleDifficultyClick = (
    difficulty: "easy" | "medium" | "hard" | "all",
  ) => {
    if (difficulty === "all") {
      setOpenSections(sheet.sections.map((s) => s.id));
      setTimeout(
        () =>
          sectionsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50,
      );
      return;
    }
    const matching = sheet.sections.filter((s) =>
      s.problems.some((p) => p.problem.difficulty === difficulty),
    );
    if (!matching.length) return;
    setOpenSections((prev) =>
      Array.from(new Set([...prev, ...matching.map((s) => s.id)])),
    );
    setTimeout(() => {
      sectionRefs.current[matching[0].id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const statCards = [
    {
      icon: BookOpen,
      label: "All Problems",
      value: totalProblems,
      color: "text-amber-400",
      hoverCls: "hover:border-amber-600/50 hover:bg-amber-950/20",
      action: () => handleDifficultyClick("all"),
    },
    {
      icon: TrendingUp,
      label: "Easy",
      value: easyCnt,
      color: "text-green-400",
      hoverCls: "hover:border-green-700/50 hover:bg-green-950/20",
      action: () => handleDifficultyClick("easy"),
    },
    {
      icon: Flame,
      label: "Medium",
      value: medCnt,
      color: "text-amber-400",
      hoverCls: "hover:border-amber-600/50 hover:bg-amber-950/20",
      action: () => handleDifficultyClick("medium"),
    },
    {
      icon: Target,
      label: "Hard",
      value: hardCnt,
      color: "text-red-400",
      hoverCls: "hover:border-red-800/50 hover:bg-red-950/20",
      action: () => handleDifficultyClick("hard"),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-amber-950/5 to-neutral-950 pointer-events-none" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <section className="relative pt-12 pb-8 md:pt-16 md:pb-10 border-b border-neutral-800/50">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-amber-950/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
            <Star className="w-3 h-3" />
            Curated Problem Sheet
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {sheet.title}
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            {sheet.description || "Master every pattern, ace every interview."}
          </p>

          <p className="mt-6 text-xs text-neutral-600 uppercase tracking-widest">
            Click a card to jump to that difficulty ↓
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {statCards.map(
              ({ icon: Icon, label, value, color, hoverCls, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className={cn(
                    "cursor-pointer flex flex-col items-center gap-2 px-6 py-4 rounded-xl",
                    "border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-md",
                    "transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-lg active:scale-[0.97]",
                    hoverCls,
                  )}
                >
                  <Icon className={cn("w-5 h-5", color)} />
                  <span className={cn("text-2xl font-bold", color)}>
                    {value}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">
                    {label}
                  </span>
                </button>
              ),
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-sm mb-2 text-neutral-300">
              <span className="font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Your Progress
              </span>
              <span className="text-amber-400 font-bold text-base tabular-nums">
                {overallPctLive}%
              </span>
            </div>
            <div className="h-2.5 bg-neutral-800/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md shadow-amber-500/30 transition-all duration-300 ease-out"
                style={{ width: `${overallPctLive}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-neutral-500">
              <span>
                {totalSolvedLive} of {totalProblems} solved
                {totalSolvedLive === 0 && (
                  <span className="ml-1 text-amber-700/70">
                    — click a card to jump in!
                  </span>
                )}
              </span>
              <button
                onClick={() =>
                  sectionsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="cursor-pointer text-amber-600 hover:text-amber-400 transition-colors text-xs underline underline-offset-2"
              >
                Jump to problems ↓
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sections ── */}
      <section className="py-8 md:py-10" ref={sectionsRef}>
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-7">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-100">
              Problem Sections
            </h2>
            <p className="mt-1.5 text-neutral-500 text-sm max-w-xl mx-auto">
              Tackle them in order or jump straight to your weak spots.
            </p>
          </div>

          <div className="space-y-4">
            {sheet.sections
              .sort((a, b) => a.order - b.order)
              .map((section, idx) => {
                const total = section.problems.length;
                const solved = section.problems.filter(
                  (p) => solvedMap[p.problem.id],
                ).length;
                const pct = total ? Math.round((solved / total) * 100) : 0;

                return (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionRefs.current[section.id] = el;
                    }}
                    className={cn(
                      "border border-neutral-800/60 rounded-xl overflow-hidden",
                      "bg-neutral-900/40 backdrop-blur-md transition-all duration-300 ease-out",
                      "hover:border-amber-700/40 hover:shadow-lg hover:shadow-amber-900/15 hover:-translate-y-0.5",
                    )}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      value={
                        openSections.includes(section.id) ? section.id : ""
                      }
                    >
                      <AccordionItem value={section.id} className="border-none">
                        <AccordionTrigger
                          className="px-6 py-4 hover:no-underline group cursor-pointer"
                          onClick={() =>
                            setOpenSections((prev) =>
                              prev.includes(section.id)
                                ? prev.filter((id) => id !== section.id)
                                : [...prev, section.id],
                            )
                          }
                        >
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {/* Circular progress ring */}
                              <div className="relative w-10 h-10 shrink-0">
                                <svg
                                  className="w-full h-full -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-neutral-800"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${(pct / 100) * 100} 100`}
                                    strokeLinecap="round"
                                    className="text-amber-500 transition-all duration-300 ease-out"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-amber-300">
                                  {pct}%
                                </span>
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                                  {section.title}
                                </h3>
                                <p className="text-sm text-neutral-600 mt-0.5">
                                  {section.description || `${total} problems`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-sm text-neutral-500 tabular-nums hidden sm:block">
                                {solved}/{total}
                              </span>
                              <div className="w-28 md:w-36 hidden sm:block">
                                <div className="h-1.5 bg-neutral-800/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="overflow-hidden transition-all duration-300 ease-out">
                          <div className="px-6 pb-6 pt-2 border-t border-neutral-800/40">
                            <p className="text-xs text-neutral-600 uppercase tracking-widest mb-4 font-medium">
                              {total} problems · visit a problem to mark it solved
                            </p>
                            <div className="border border-neutral-800/40 rounded-lg overflow-hidden bg-neutral-950/50">
                              <Table>
                                <TableHeader className="bg-neutral-900/70">
                                  <TableRow className="border-neutral-800/50 hover:bg-transparent">
                                    <TableHead className="w-12 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      Solved
                                    </TableHead>
                                    <TableHead className="text-neutral-400 text-xs uppercase tracking-wide">
                                      Problem
                                    </TableHead>
                                    <TableHead className="w-28 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      Difficulty
                                    </TableHead>
                                    <TableHead className="w-36 text-neutral-400 text-xs uppercase tracking-wide">
                                      Confidence
                                    </TableHead>
                                    <TableHead className="w-24 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      LeetCode
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {section.problems.map((item) => {
                                    const p = item.problem;
                                    const isSolved = !!solvedMap[p.id];
                                    const confidence = confidenceMap[p.id] ?? null;
                                    const confKey = (confidence as NonNullable<ConfidenceV2> | null) ?? "unattempted";
                                    const confCfg = confidenceConfig[confKey];

                                    return (
                                      <TableRow
                                        key={item.id}
                                        className={cn(
                                          "border-neutral-800/40 transition-all duration-300 ease-out group",
                                          isSolved
                                            ? "bg-emerald-950/10 hover:bg-emerald-950/15"
                                            : "hover:bg-neutral-800/30 hover:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.06)]",
                                        )}
                                      >
                                        {/* Solved circle (read-only; tooltip on unsolved) */}
                                        <TableCell className="text-center p-4">
                                          <div className="flex items-center justify-center">
                                            {isSolved ? (
                                              <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-pulse" />
                                                <CheckCircle2 className="h-6 w-6 text-emerald-500 relative z-10" />
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                className="relative cursor-pointer focus:outline-none"
                                                onClick={(e) => showTooltip(p.id, e.currentTarget)}
                                                onMouseEnter={(e) => showTooltip(p.id, e.currentTarget)}
                                                onMouseLeave={hideTooltip}
                                              >
                                                <Circle className="h-6 w-6 text-neutral-600 hover:text-rose-400 transition-colors rounded-full" />
                                              </button>
                                            )}
                                          </div>
                                        </TableCell>

                                        {/* Title → internal problem page */}
                                        <TableCell>
                                          <Link
                                            href={`/problems/${p.slug}`}
                                            className={cn(
                                              "inline-block font-medium text-sm transition-all duration-300",
                                              isSolved
                                                ? "text-neutral-500 line-through hover:text-neutral-400"
                                                : "text-neutral-200 group-hover:text-amber-400 group-hover:translate-x-0.5",
                                            )}
                                          >
                                            {p.title}
                                          </Link>
                                        </TableCell>

                                        {/* Difficulty */}
                                        <TableCell className="text-center">
                                          <Badge
                                            className={cn(
                                              "text-xs px-2.5 py-0.5 rounded-full border font-medium",
                                              p.difficulty === "easy" &&
                                                "bg-green-950/50 text-green-400 border-green-800/40",
                                              p.difficulty === "medium" &&
                                                "bg-amber-950/50 text-amber-400 border-amber-800/40",
                                              p.difficulty === "hard" &&
                                                "bg-red-950/50 text-red-400 border-red-800/40",
                                            )}
                                          >
                                            {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                                          </Badge>
                                        </TableCell>

                                        {/* Confidence / Attempted */}
                                        <TableCell>
                                          <span className={cn("text-sm font-medium", confCfg.color)}>
                                            {confCfg.label}
                                          </span>
                                        </TableCell>

                                        {/* LeetCode external link */}
                                        <TableCell className="text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer text-amber-500/70 hover:text-amber-300 hover:bg-amber-950/30 text-xs h-7 px-3 transition-all duration-300"
                                            asChild
                                          >
                                            <a href={p.link} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 md:py-20 border-t border-neutral-800/50 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-amber-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-800/40 bg-amber-950/20 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-6">
            <Flame className="w-3 h-3" />
            Keep the momentum going
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-amber-100 leading-tight">
            Consistency beats
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              talent, every time.
            </span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className={cn(
                "cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold px-8 py-6 text-base rounded-xl",
                "hover:from-amber-400 hover:to-orange-400 hover:scale-[1.03] shadow-lg shadow-amber-700/30 transition-all duration-300 active:scale-[0.98]",
              )}
              onClick={() => handleDifficultyClick("all")}
            >
              Expand All Sections <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "cursor-pointer border border-neutral-700 text-neutral-300 hover:text-amber-300 hover:border-amber-700/50 hover:bg-amber-950/20",
                "px-8 py-6 text-base rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]",
              )}
              onClick={() => setSolvedMap({})}
            >
              Reset Progress
            </Button>
          </div>
        </div>
      </section>

      {/* Portal tooltip — renders at document.body so it's never clipped */}
      {tooltipId &&
        tooltipPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltipPos.x + 12,
              top: tooltipPos.y + tooltipPos.h / 2,
              transform: "translateY(-50%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <div
              className={cn(
                "whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold",
                "bg-rose-950 text-rose-300 border border-rose-500/40",
                "shadow-xl shadow-rose-900/30",
              )}
              style={{ animation: "tooltipFadeIn 0.15s ease-out" }}
            >
              Open the problem &amp; solve it — progress syncs automatically!
              <div
                className="absolute top-1/2 -translate-y-1/2 right-full"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderRight: "6px solid rgb(136 19 55 / 0.4)",
                }}
              />
            </div>
          </div>,
          document.body,
        )}

      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </div>
  );
}
