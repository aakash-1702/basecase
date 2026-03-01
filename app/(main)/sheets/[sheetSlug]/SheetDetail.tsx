"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
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
  Trophy,
  Target,
  Flame,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ConfidenceV2 = "LOW" | "MEDIUM" | "HIGH" | null;

const confidenceConfig: Record<
  NonNullable<ConfidenceV2> | "unattempted",
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  unattempted: {
    label: "Not started",
    color: "text-neutral-400",
    bg: "bg-neutral-800/30",
    border: "border-neutral-700/40",
    icon: "○",
  },
  LOW: {
    label: "Low",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/40",
    icon: "◔",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/40",
    icon: "◑",
  },
  HIGH: {
    label: "High",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-800/40",
    icon: "●",
  },
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
  const router = useRouter();
  const sectionsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Solved state seeded from server on first load ────────────────────────────────
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialSolvedIds.map((id) => [id, true])),
  );

  // ── Confidence / attempted state ─────────────────────────────────────────
  const [confidenceMap, setConfidenceMap] = useState<
    Record<string, ConfidenceV2>
  >(initialConfidenceMap as Record<string, ConfidenceV2>);

  useEffect(() => {
    setSolvedMap(Object.fromEntries(initialSolvedIds.map((id) => [id, true])));
    setConfidenceMap(initialConfidenceMap as Record<string, ConfidenceV2>);
  }, [initialSolvedIds, initialConfidenceMap]); // eslint-disable-line

  // Refresh data when returning to the page (after solving problems elsewhere)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  // ── Tooltip for unsolved circle button (no-toggle, just redirects user) ──────
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    h: number;
  } | null>(null);
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
      {/* Enhanced background gradients for better depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 pointer-events-none" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-0 top-1/3 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* ── Hero ── */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-14 border-b border-neutral-800/30">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-600/50 bg-gradient-to-r from-amber-950/50 to-orange-950/50 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-amber-900/20">
            <Zap className="w-3.5 h-3.5" />
            Curated Problem Sheet
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
              {sheet.title}
            </span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            {sheet.description || "Master every pattern, ace every interview."}
          </p>

          <p className="mt-8 text-xs text-neutral-500 uppercase tracking-widest font-medium">
            Select a category to jump
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {statCards.map(
              ({ icon: Icon, label, value, color, hoverCls, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className={cn(
                    "cursor-pointer flex flex-col items-center gap-3 px-6 py-5 rounded-2xl",
                    "border border-neutral-800/70 bg-neutral-900/60 backdrop-blur-xl",
                    "transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-xl active:scale-[0.97]",
                    "group relative overflow-hidden",
                    hoverCls,
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-transform group-hover:scale-110",
                      color,
                    )}
                  />
                  <span
                    className={cn("text-3xl font-black tabular-nums", color)}
                  >
                    {value}
                  </span>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">
                    {label}
                  </span>
                </button>
              ),
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="p-5 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-semibold flex items-center gap-2 text-neutral-200">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Your Progress
                </span>
                <span className="text-amber-400 font-black text-xl tabular-nums">
                  {overallPctLive}%
                </span>
              </div>
              <div className="h-3 bg-neutral-800/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full shadow-lg shadow-amber-500/40 transition-all duration-500 ease-out"
                  style={{ width: `${overallPctLive}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-neutral-400 font-medium">
                  <span className="text-amber-400">{totalSolvedLive}</span> of{" "}
                  {totalProblems} problems solved
                  {totalSolvedLive === 0 && (
                    <span className="ml-2 text-neutral-500">
                      — let&apos;s get started!
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
                  className="cursor-pointer text-amber-500 hover:text-amber-300 transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  Jump to problems
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sections ── */}
      <section className="py-12 md:py-16" ref={sectionsRef}>
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-neutral-100">
              Problem Sections
            </h2>
            <p className="mt-3 text-neutral-400 text-base max-w-xl mx-auto">
              Click on any problem to start practicing. Your progress syncs
              automatically.
            </p>
          </div>

          <div className="space-y-5">
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
                      "border border-neutral-800/50 rounded-2xl overflow-hidden",
                      "bg-gradient-to-br from-neutral-900/70 to-neutral-950/70 backdrop-blur-xl transition-all duration-300 ease-out",
                      "hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-900/10",
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
                          className="px-6 py-5 hover:no-underline group cursor-pointer"
                          onClick={() =>
                            setOpenSections((prev) =>
                              prev.includes(section.id)
                                ? prev.filter((id) => id !== section.id)
                                : [...prev, section.id],
                            )
                          }
                        >
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                              {/* Circular progress ring */}
                              <div className="relative w-14 h-14 shrink-0">
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
                                    strokeWidth="2.5"
                                    className="text-neutral-800/60"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="2.5"
                                    strokeDasharray={`${(pct / 100) * 100} 100`}
                                    strokeLinecap="round"
                                    className="transition-all duration-500 ease-out"
                                  />
                                  <defs>
                                    <linearGradient
                                      id="progressGradient"
                                      x1="0%"
                                      y1="0%"
                                      x2="100%"
                                      y2="0%"
                                    >
                                      <stop offset="0%" stopColor="#f59e0b" />
                                      <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-amber-400">
                                  {pct}%
                                </span>
                              </div>
                              <div className="text-left">
                                <h3 className="text-xl font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                                  {section.title}
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1">
                                  {section.description ||
                                    `${total} problems to master`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 shrink-0">
                              <div className="hidden sm:flex flex-col items-end gap-1">
                                <span className="text-base font-bold text-neutral-300 tabular-nums">
                                  {solved}
                                  <span className="text-neutral-600">
                                    /{total}
                                  </span>
                                </span>
                                <span className="text-xs text-neutral-500">
                                  completed
                                </span>
                              </div>
                              <div className="w-32 md:w-40 hidden md:block">
                                <div className="h-2 bg-neutral-800/60 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-amber-500/30"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="overflow-hidden transition-all duration-300 ease-out">
                          <div className="px-6 pb-6 pt-4 border-t border-neutral-800/30">
                            <div className="flex items-center justify-between mb-5">
                              <p className="text-sm text-neutral-400 font-medium">
                                <span className="text-amber-400 font-bold">
                                  {total}
                                </span>{" "}
                                problems in this section
                              </p>
                              <p className="text-xs text-neutral-500">
                                Click a problem to start practicing
                              </p>
                            </div>
                            <div className="border border-neutral-800/30 rounded-xl overflow-hidden bg-neutral-950/40">
                              <Table>
                                <TableHeader className="bg-neutral-900/60">
                                  <TableRow className="border-neutral-800/40 hover:bg-transparent">
                                    <TableHead className="w-16 text-center text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                                      Status
                                    </TableHead>
                                    <TableHead className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                                      Problem
                                    </TableHead>
                                    <TableHead className="w-28 text-center text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                                      Difficulty
                                    </TableHead>
                                    <TableHead className="w-32 text-center text-neutral-500 text-xs uppercase tracking-wider font-semibold">
                                      Confidence
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {section.problems.map((item) => {
                                    const p = item.problem;
                                    const isSolved = !!solvedMap[p.id];
                                    const confidence =
                                      confidenceMap[p.id] ?? null;
                                    const confKey =
                                      (confidence as NonNullable<ConfidenceV2> | null) ??
                                      "unattempted";
                                    const confCfg = confidenceConfig[confKey];

                                    return (
                                      <TableRow
                                        key={item.id}
                                        className={cn(
                                          "border-neutral-800/30 transition-all duration-200 ease-out group cursor-pointer",
                                          isSolved
                                            ? "bg-emerald-950/15 hover:bg-emerald-950/25"
                                            : "hover:bg-amber-950/10",
                                        )}
                                      >
                                        {/* Solved circle (read-only; tooltip on unsolved) */}
                                        <TableCell className="text-center py-4">
                                          <div className="flex items-center justify-center">
                                            {isSolved ? (
                                              <div className="relative">
                                                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-sm" />
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400 relative z-10" />
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                className="relative cursor-pointer focus:outline-none"
                                                onClick={(e) =>
                                                  showTooltip(
                                                    p.id,
                                                    e.currentTarget,
                                                  )
                                                }
                                                onMouseEnter={(e) =>
                                                  showTooltip(
                                                    p.id,
                                                    e.currentTarget,
                                                  )
                                                }
                                                onMouseLeave={hideTooltip}
                                              >
                                                <Circle className="h-5 w-5 text-neutral-600 group-hover:text-amber-500/60 transition-colors" />
                                              </button>
                                            )}
                                          </div>
                                        </TableCell>

                                        {/* Title → internal problem page */}
                                        <TableCell className="py-4">
                                          <Link
                                            href={`/problems/${p.slug}`}
                                            className={cn(
                                              "flex items-center gap-2 font-medium text-sm transition-all duration-200",
                                              isSolved
                                                ? "text-neutral-500 hover:text-neutral-300"
                                                : "text-neutral-100 group-hover:text-amber-400",
                                            )}
                                          >
                                            <span
                                              className={
                                                isSolved ? "line-through" : ""
                                              }
                                            >
                                              {p.title}
                                            </span>
                                            <ChevronRight
                                              className={cn(
                                                "w-4 h-4 opacity-0 -translate-x-1 transition-all duration-200",
                                                "group-hover:opacity-100 group-hover:translate-x-0 text-amber-500",
                                              )}
                                            />
                                          </Link>
                                        </TableCell>

                                        {/* Difficulty */}
                                        <TableCell className="text-center py-4">
                                          <Badge
                                            className={cn(
                                              "text-xs px-3 py-1 rounded-full border font-semibold",
                                              p.difficulty === "easy" &&
                                                "bg-emerald-950/50 text-emerald-400 border-emerald-800/50",
                                              p.difficulty === "medium" &&
                                                "bg-amber-950/50 text-amber-400 border-amber-800/50",
                                              p.difficulty === "hard" &&
                                                "bg-rose-950/50 text-rose-400 border-rose-800/50",
                                            )}
                                          >
                                            {p.difficulty
                                              .charAt(0)
                                              .toUpperCase() +
                                              p.difficulty.slice(1)}
                                          </Badge>
                                        </TableCell>

                                        {/* Confidence badge */}
                                        <TableCell className="text-center py-4">
                                          <span
                                            className={cn(
                                              "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                                              confCfg.bg,
                                              confCfg.border,
                                              confCfg.color,
                                            )}
                                          >
                                            <span className="text-[10px]">
                                              {confCfg.icon}
                                            </span>
                                            {confCfg.label}
                                          </span>
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
