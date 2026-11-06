"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import SheetHeader from "@/components/sheets/SheetHeader";
import SectionAccordion from "@/components/sheets/SectionAccordion";
import SheetCta from "@/components/sheets/SheetCta";
import SolveTooltip, { type TooltipState } from "@/components/sheets/SolveTooltip";
import type { SheetCounts } from "@/components/sheets/SheetStats";
import type { ConfidenceV2, SheetData } from "@/components/sheets/types";
import { normalizeDifficulty, type Difficulty } from "@/lib/difficulty";

interface Props {
  data: SheetData;
  initialSolvedIds: string[];
  initialConfidenceMap: Record<string, string | null>;
}

export default function SheetDetailPage({
  data: sheet,
  initialSolvedIds,
  initialConfidenceMap,
}: Props) {
  const router = useRouter();
  const sectionsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());

  // ── Solved / confidence state (derived from server props) ────────────────
  // "Reset progress" only clears the local view; it remembers which props it
  // applied to, so the next server refresh (new props) restores real data —
  // same semantics as the old prop-sync effect, without the extra render.
  const [resetFor, setResetFor] = useState<string[] | null>(null);
  const solvedSet = useMemo<ReadonlySet<string>>(
    () => new Set(resetFor === initialSolvedIds ? [] : initialSolvedIds),
    [initialSolvedIds, resetFor],
  );
  const confidenceMap = initialConfidenceMap as Record<string, ConfidenceV2>;

  // Refresh data when returning to the tab (after solving problems elsewhere)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [router]);

  // ── Open sections ────────────────────────────────────────────────────────
  const [openSections, setOpenSections] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const registerSection = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) sectionRefs.current.set(id, el);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  // ── Tooltip for unsolved circle button (no toggle, just guidance) ────────
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback((id: string, el: HTMLElement) => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    const rect = el.getBoundingClientRect();
    setTooltip({ id, x: rect.right, y: rect.top, h: rect.height });
    tooltipTimeout.current = setTimeout(() => setTooltip(null), 3000);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltip(null);
  }, []);

  useEffect(
    () => () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    },
    [],
  );

  // ── Derived counts ───────────────────────────────────────────────────────
  const sections = useMemo(
    () => [...sheet.sections].sort((a, b) => a.order - b.order),
    [sheet.sections],
  );
  const allProblems = useMemo(
    () => sections.flatMap((s) => s.problems),
    [sections],
  );
  const counts = useMemo<SheetCounts>(() => {
    const c = { total: allProblems.length, easy: 0, medium: 0, hard: 0 };
    for (const p of allProblems) c[normalizeDifficulty(p.problem.difficulty)] += 1;
    return c;
  }, [allProblems]);
  const uniqueProblemIds = useMemo(
    () => Array.from(new Set(allProblems.map((p) => p.problem.id))),
    [allProblems],
  );
  const totalSolved = useMemo(
    () => uniqueProblemIds.reduce((n, id) => n + (solvedSet.has(id) ? 1 : 0), 0),
    [uniqueProblemIds, solvedSet],
  );
  const overallPct = counts.total
    ? Math.round((totalSolved / counts.total) * 100)
    : 0;

  // ── Jump helpers ─────────────────────────────────────────────────────────
  const scrollToSections = useCallback(() => {
    sectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDifficultyClick = useCallback(
    (difficulty: Difficulty | "all") => {
      if (difficulty === "all") {
        setOpenSections(new Set(sections.map((s) => s.id)));
        setTimeout(scrollToSections, 50);
        return;
      }
      const matching = sections.filter((s) =>
        s.problems.some((p) => p.problem.difficulty === difficulty),
      );
      if (matching.length === 0) return;
      setOpenSections((prev) => {
        const next = new Set(prev);
        for (const s of matching) next.add(s.id);
        return next;
      });
      setTimeout(() => {
        sectionRefs.current
          .get(matching[0].id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    },
    [sections, scrollToSections],
  );

  const expandAll = useCallback(
    () => handleDifficultyClick("all"),
    [handleDifficultyClick],
  );
  const resetProgress = useCallback(
    () => setResetFor(initialSolvedIds),
    [initialSolvedIds],
  );

  return (
    <div>
      <SheetHeader
        title={sheet.title}
        description={sheet.description}
        counts={counts}
        totalSolved={totalSolved}
        pct={overallPct}
        onSelectDifficulty={handleDifficultyClick}
        onJump={scrollToSections}
      />

      {/* ── Sections ── */}
      <section ref={sectionsRef} className="scroll-mt-16 py-12 md:py-16">
        <Container size="lg">
          <SectionHeader
            align="center"
            eyebrow="Sections"
            title="Problem sections"
            description="Click on any problem to start practising. Your progress syncs automatically."
          />

          <div className="mt-10 flex flex-col gap-4">
            {sections.map((section) => (
              <SectionAccordion
                key={section.id}
                section={section}
                open={openSections.has(section.id)}
                solvedSet={solvedSet}
                confidenceMap={confidenceMap}
                onToggle={toggleSection}
                registerRef={registerSection}
                onShowTooltip={showTooltip}
                onHideTooltip={hideTooltip}
              />
            ))}
          </div>
        </Container>
      </section>

      <SheetCta onExpandAll={expandAll} onReset={resetProgress} />

      <SolveTooltip tooltip={tooltip} />
    </div>
  );
}
