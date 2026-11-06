"use client";

import { memo, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProgressBar from "@/components/shared/ProgressBar";
import ProgressRing from "@/components/dashboard/ProgressRing";
import SheetProblemRow from "./SheetProblemRow";
import type { ConfidenceV2, SheetSection } from "./types";

interface Props {
  section: SheetSection;
  open: boolean;
  solvedSet: ReadonlySet<string>;
  confidenceMap: Record<string, ConfidenceV2>;
  onToggle: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onShowTooltip: (id: string, el: HTMLElement) => void;
  onHideTooltip: () => void;
}

const HEADERS = ["Status", "Problem", "Difficulty", "Confidence"] as const;

/** One collapsible sheet section. Memoised so tooltip state changes in the
 *  parent don't re-render every section/row. */
function SectionAccordion({
  section,
  open,
  solvedSet,
  confidenceMap,
  onToggle,
  registerRef,
  onShowTooltip,
  onHideTooltip,
}: Props) {
  const total = section.problems.length;
  let solved = 0;
  for (const p of section.problems) {
    if (solvedSet.has(p.problem.id)) solved += 1;
  }
  const pct = total ? Math.round((solved / total) * 100) : 0;

  const setRef = useCallback(
    (el: HTMLDivElement | null) => registerRef(section.id, el),
    [registerRef, section.id],
  );
  const handleValueChange = useCallback(
    () => onToggle(section.id),
    [onToggle, section.id],
  );

  return (
    <div
      ref={setRef}
      className="card-base card-glow-top scroll-mt-20 overflow-hidden transition-colors hover:border-accent/30"
    >
      <Accordion
        type="single"
        collapsible
        value={open ? section.id : ""}
        onValueChange={handleValueChange}
      >
        <AccordionItem value={section.id} className="border-none">
          <AccordionTrigger className="group cursor-pointer items-center px-5 py-4 hover:no-underline sm:px-6">
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <ProgressRing value={pct} size={52} stroke={3} />
                <div className="min-w-0 text-left">
                  <h3 className="truncate font-display text-lg text-fg transition-colors group-hover:text-accent-hover">
                    {section.title}
                  </h3>
                  <p className="mt-0.5 truncate text-sm font-normal text-fg-muted">
                    {section.description || `${total} problems to master`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-5">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="font-mono text-sm tabular-nums text-fg">
                    {solved}
                    <span className="text-fg-dim">/{total}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
                    completed
                  </span>
                </div>
                <ProgressBar value={pct} className="hidden w-32 md:block" />
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="border-t border-line px-5 pb-5 pt-4 sm:px-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-fg-secondary">
                  <span className="font-semibold text-accent">{total}</span>{" "}
                  problems in this section
                </p>
                <p className="hidden text-xs text-fg-muted sm:block">
                  Click a problem to start practising
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                      {HEADERS.map((h, i) => (
                        <th
                          key={h}
                          className={
                            i === 1
                              ? "px-3 py-3 text-left font-medium"
                              : "px-3 py-3 text-center font-medium"
                          }
                          style={i === 0 ? { width: "4rem" } : i === 1 ? undefined : { width: "9rem" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.problems.map((item) => (
                      <SheetProblemRow
                        key={item.id}
                        item={item}
                        isSolved={solvedSet.has(item.problem.id)}
                        confidence={confidenceMap[item.problem.id] ?? null}
                        onShowTooltip={onShowTooltip}
                        onHideTooltip={onHideTooltip}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default memo(SectionAccordion);
