"use client";

import React, { useState, useMemo, useRef } from "react";
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
  CheckSquare,
  ExternalLink,
  Trophy,
  Target,
  Flame,
  BookOpen,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SheetDetailPage({ data }: { data: SheetData }) {
  const sheet = data;
  const sectionsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const totalProblems = useMemo(
    () => sheet.sections.reduce((sum, sec) => sum + sec.problems.length, 0),
    [sheet],
  );

  const easyCnt = useMemo(
    () =>
      sheet.sections
        .flatMap((s) => s.problems)
        .filter((p) => p.problem.difficulty === "easy").length,
    [sheet],
  );
  const medCnt = useMemo(
    () =>
      sheet.sections
        .flatMap((s) => s.problems)
        .filter((p) => p.problem.difficulty === "medium").length,
    [sheet],
  );
  const hardCnt = useMemo(
    () =>
      sheet.sections
        .flatMap((s) => s.problems)
        .filter((p) => p.problem.difficulty === "hard").length,
    [sheet],
  );

  const [openSections, setOpenSections] = useState<string[]>([]);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});

  const toggleSolved = (problemId: string) => {
    setSolvedMap((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
  };

  const totalSolvedLive = Object.values(solvedMap).filter(Boolean).length;
  const overallPctLive = totalProblems
    ? Math.round((totalSolvedLive / totalProblems) * 100)
    : 0;

  const handleDifficultyClick = (difficulty: "easy" | "medium" | "hard" | "all") => {
    if (difficulty === "all") {
      setOpenSections(sheet.sections.map((s) => s.id));
      setTimeout(() => {
        sectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }

    const matchingSections = sheet.sections.filter((s) =>
      s.problems.some((p) => p.problem.difficulty === difficulty),
    );
    if (matchingSections.length === 0) return;

    setOpenSections((prev) => Array.from(new Set([...prev, ...matchingSections.map((s) => s.id)])));

    setTimeout(() => {
      sectionRefs.current[matchingSections[0].id]?.scrollIntoView({
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
      {/* Ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-amber-950/5 to-neutral-950 pointer-events-none" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-1/3 w-[400px] h-[400px] bg-orange-600/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <section className="relative pt-12 pb-8 md:pt-16 md:pb-10 border-b border-neutral-800/50">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-amber-950/30 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5 animate-fade-in-up">
            <Star className="w-3 h-3" />
            Curated Problem Sheet
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-in-up animation-delay-100">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {sheet.title}
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            {sheet.description ||
              "Master every pattern, ace every interview. Work through carefully selected problems ordered by concept — from fundamentals to tricky edge cases."}
          </p>

          {/* Clickable stat cards */}
          <p className="mt-6 text-xs text-neutral-600 uppercase tracking-widest animate-fade-in-up animation-delay-200">
            Click a card to jump to that difficulty ↓
          </p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
            {statCards.map(({ icon: Icon, label, value, color, hoverCls, action }) => (
              <button
                key={label}
                onClick={action}
                className={cn(
                  "cursor-pointer flex flex-col items-center gap-2 px-6 py-4 rounded-xl",
                  "border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-md",
                  "transition-all duration-300 ease-out",
                  "hover:scale-[1.05] hover:shadow-lg active:scale-[0.97]",
                  hoverCls,
                )}
              >
                <Icon className={cn("w-5 h-5", color)} />
                <span className={cn("text-2xl font-bold", color)}>{value}</span>
                <span className="text-xs text-neutral-500 uppercase tracking-widest">{label}</span>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-6 max-w-xl mx-auto animate-fade-in-up animation-delay-400">
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
                  <span className="ml-1 text-amber-700/70">— click a card to jump in!</span>
                )}
              </span>
              <button
                onClick={() =>
                  sectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="cursor-pointer text-amber-600 hover:text-amber-400 transition-colors duration-300 ease-out text-xs underline underline-offset-2"
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
          <div className="text-center mb-7 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-100">Problem Sections</h2>
            <p className="mt-1.5 text-neutral-500 text-sm max-w-xl mx-auto">
              Tackle them in order or click a difficulty card above to jump straight to your weak
              spots.
            </p>
          </div>

          <div className="space-y-4">
            {sheet.sections
              .sort((a, b) => a.order - b.order)
              .map((section, idx) => {
                const total = section.problems.length;
                const solved = section.problems.filter((p) => solvedMap[p.problem.id]).length;
                const pct = total ? Math.round((solved / total) * 100) : 0;

                return (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionRefs.current[section.id] = el;
                    }}
                    className={cn(
                      "border border-neutral-800/60 rounded-xl overflow-hidden",
                      "bg-neutral-900/40 backdrop-blur-md",
                      "transition-all duration-300 ease-out",
                      "hover:border-amber-700/40 hover:shadow-lg hover:shadow-amber-900/15 hover:-translate-y-0.5",
                      "animate-fade-in-up",
                    )}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      value={openSections.includes(section.id) ? section.id : ""}
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
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
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
                                <h3 className="text-lg font-semibold text-amber-200 group-hover:text-amber-100 transition-colors duration-300 ease-out">
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
                              {total} problems · click checkbox to mark solved
                            </p>
                            <div className="border border-neutral-800/40 rounded-lg overflow-hidden bg-neutral-950/50">
                              <Table>
                                <TableHeader className="bg-neutral-900/70">
                                  <TableRow className="border-neutral-800/50 hover:bg-transparent">
                                    <TableHead className="w-12 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      Done
                                    </TableHead>
                                    <TableHead className="text-neutral-400 text-xs uppercase tracking-wide">
                                      Problem
                                    </TableHead>
                                    <TableHead className="w-28 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      Difficulty
                                    </TableHead>
                                    <TableHead className="w-28 text-center text-neutral-400 text-xs uppercase tracking-wide">
                                      Solve
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {section.problems.map((item) => {
                                    const p = item.problem;
                                    const isSolved = !!solvedMap[p.id];
                                    return (
                                      <TableRow
                                        key={item.id}
                                        className={cn(
                                          "border-neutral-800/40 transition-all duration-300 ease-out",
                                          isSolved
                                            ? "bg-amber-950/10 hover:bg-amber-950/20"
                                            : "hover:bg-neutral-800/30",
                                        )}
                                      >
                                        <TableCell className="text-center">
                                          <button
                                            onClick={() => toggleSolved(p.id)}
                                            className="cursor-pointer transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                                            aria-label={isSolved ? "Mark unsolved" : "Mark solved"}
                                          >
                                            <CheckSquare
                                              className={cn(
                                                "h-5 w-5 mx-auto transition-colors duration-300 ease-out",
                                                isSolved
                                                  ? "text-amber-400"
                                                  : "text-neutral-700 hover:text-neutral-500",
                                              )}
                                            />
                                          </button>
                                        </TableCell>
                                        <TableCell>
                                          <span
                                            className={cn(
                                              "font-medium text-sm transition-colors duration-300 ease-out",
                                              isSolved
                                                ? "text-neutral-500 line-through"
                                                : "text-neutral-200",
                                            )}
                                          >
                                            {p.title}
                                          </span>
                                        </TableCell>
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
                                            {p.difficulty.charAt(0).toUpperCase() +
                                              p.difficulty.slice(1)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer text-amber-500 hover:text-amber-300 hover:bg-amber-950/30 text-xs h-7 px-3 transition-all duration-300 ease-out"
                                            asChild
                                          >
                                            <a
                                              href={p.link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              Solve
                                              <ExternalLink className="ml-1 h-3 w-3" />
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

      {/* ── CTA Section ── */}
      <section className="py-14 md:py-20 border-t border-neutral-800/50 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-amber-500/6 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center animate-fade-in-up">
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

          <p className="mt-5 text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            One problem a day keeps the rejection email away. Stick to the sheet, track your
            streaks, and watch patterns click into place. Your dream offer is on the other side of
            consistent practice.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
            {[
              { icon: Trophy, text: `${totalProblems} problems to master` },
              { icon: Target, text: "Difficulty progression built-in" },
              { icon: TrendingUp, text: "Track progress in real-time" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-amber-600" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className={cn(
                "cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 font-bold px-8 py-6 text-base rounded-xl",
                "hover:from-amber-400 hover:to-orange-400 hover:scale-[1.03]",
                "shadow-lg shadow-amber-700/30 transition-all duration-300 ease-out",
                "active:scale-[0.98]",
              )}
              onClick={() => handleDifficultyClick("all")}
            >
              Expand All Sections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "cursor-pointer border border-neutral-700 text-neutral-300 hover:text-amber-300 hover:border-amber-700/50 hover:bg-amber-950/20",
                "px-8 py-6 text-base rounded-xl font-medium",
                "transition-all duration-300 ease-out hover:scale-[1.02]",
              )}
              onClick={() => setSolvedMap({})}
            >
              Reset Progress
            </Button>
          </div>

          <p className="mt-6 text-xs text-neutral-700">
            Progress is saved locally in this session — come back anytime.
          </p>
        </div>
      </section>
    </div>
  );
}