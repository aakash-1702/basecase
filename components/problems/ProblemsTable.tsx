// components/problems/ProblemsTable.tsx
"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ✅ Fixed: correct import path (was "UpdateProgressingDialog" with extra "ing")
import {
  UpdateProgressDialog,
  ConfidenceLevel,
} from "@/components/problems/UpdateProgressDialog";

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
  userConfidence?: ConfidenceLevel;
  link: string;
};

const difficultyColors = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  not_attempted: "Not attempted",
  confident: "Confident – nailed it!",
  needs_revision: "Needs revision – almost there",
  failed: "Unable to solve – tough one",
  skipped: "Skipped for now",
};

interface ProblemsTableProps {
  problems: Problem[];
  // onConfidenceChange?: (
  //   problemId: string,
  //   newConfidence: ConfidenceLevel,
  // ) => void;
  // onSolvedToggle?: (problemId: string, newSolved: boolean) => void;
  // onSaveNotes?: (problemId: string, notes: string) => void;

  onSaveChanges ?: (problemId : string , confidence : ConfidenceLevel, notes : string , solved : boolean) => void
}

export default function ProblemsTable({
  problems,
  // onConfidenceChange,
  // onSolvedToggle,
  // onSaveNotes,
  onSaveChanges
}: ProblemsTableProps) {
  // Local state for optimistic UI updates
  const [localSolved, setLocalSolved] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      problems.forEach((p) => (initial[p.id] = p.solved));
      return initial;
    },
  );

  const [localConfidence, setLocalConfidence] = useState<
    Record<string, ConfidenceLevel>
  >(() => {
    const initial: Record<string, ConfidenceLevel> = {};
    problems.forEach((p) => {
      if (p.userConfidence) initial[p.id] = p.userConfidence;
    });
    return initial;
  });

  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Dialog control state
  const [showDialog, setShowDialog] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<{
    id: string;
    title: string;
    initialConfidence: ConfidenceLevel;
    initialNotes: string;
  } | null>(null);

  const openDialog = (problem: Problem) => {
    setCurrentProblem({
      id: problem.id,
      title: problem.title,
      initialConfidence: localConfidence[problem.id] ?? "not_attempted",
      initialNotes: notesMap[problem.id] ?? "",
    });
    setShowDialog(true);
  };

  const handleSave = (confidence: ConfidenceLevel, notes: string) => {
    if (!currentProblem) return;
    const problemId = currentProblem.id;

    // Only confident and needs_revision count as "solved"
    // failed, skipped, not_attempted all mark it as unsolved
    const shouldBeSolved =
      confidence === "confident" || confidence === "needs_revision";

    setLocalSolved((prev) => ({ ...prev, [problemId]: shouldBeSolved }));

    setLocalConfidence((prev) => ({ ...prev, [problemId]: confidence }));

    setNotesMap((prev) => ({ ...prev, [problemId]: notes }));

    onSaveChanges?.(problemId, confidence, notes, shouldBeSolved);

    // ✅ Fixed: dialog's onSave already calls onOpenChange(false), so we only
    // need to clear currentProblem here — no double setShowDialog call needed
    setCurrentProblem(null);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setCurrentProblem(null);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
            <th className="w-12 p-4 text-center">Done</th>
            <th className="py-4 px-3 font-medium">Problem</th>
            <th className="w-28 py-4 px-3 font-medium text-center">
              Difficulty
            </th>
            <th className="w-44 py-4 px-3 font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {problems.map((problem) => {
            const isSolved = localSolved[problem.id] ?? problem.solved;
            const confidence = localConfidence[problem.id] ?? "not_attempted";
            const hasNotes = !!notesMap[problem.id];

            return (
              <tr
                key={problem.id}
                className={cn(
                  "group border-b border-neutral-800/60 transition-all duration-300 ease-out",
                  "hover:bg-neutral-900/70 hover:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.08)]",
                  "hover:-translate-y-px",
                )}
              >
                {/* Done column – opens dialog */}
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => openDialog(problem)}
                    className={cn(
                      "relative flex items-center justify-center focus:outline-none",
                      "transition-transform duration-200 hover:scale-110 active:scale-95",
                    )}
                    aria-label={isSolved ? "Update status" : "Mark as solved"}
                  >
                    {isSolved ? (
                      <>
                        <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-pulse" />
                        <CheckCircle2 className="h-7 w-7 text-emerald-500 relative z-10" />
                      </>
                    ) : (
                      <Circle className="h-7 w-7 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                    )}
                  </button>
                </td>

                {/* Problem title */}
                <td className="py-4 px-3 relative">
                  <Link
                    href={problem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-block text-neutral-100 font-medium transition-all duration-300",
                      "group-hover:text-amber-400 group-hover:translate-x-0.5",
                      "group-hover:scale-[1.015] origin-left",
                    )}
                  >
                    {problem.title}
                  </Link>

                  <span
                    className={cn(
                      "absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full",
                      "bg-gradient-to-r from-amber-500/0 via-amber-500/70 to-amber-500/0",
                      "scale-x-0 origin-center transition-transform duration-300 ease-out",
                      "group-hover:scale-x-100",
                    )}
                  />
                </td>

                {/* Difficulty */}
                <td className="py-4 px-3 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
                      difficultyColors[problem.difficulty],
                      "group-hover:scale-105 group-hover:shadow-sm group-hover:shadow-amber-500/10",
                    )}
                  >
                    {problem.difficulty.charAt(0).toUpperCase() +
                      problem.difficulty.slice(1)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        confidence === "confident" && "text-emerald-400",
                        confidence === "needs_revision" && "text-amber-400",
                        confidence === "failed" && "text-rose-400",
                        (confidence === "not_attempted" ||
                          confidence === "skipped") &&
                          "text-neutral-500",
                      )}
                    >
                      {confidenceLabels[confidence]}
                    </span>
                    {hasNotes && (
                      <Pencil className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {problems.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          No problems found. Keep pushing – your next win is waiting!
        </div>
      )}

      {/* Dialog – only mounts when a problem is selected */}
      {currentProblem && (
        <UpdateProgressDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            // If dialog is dismissed via outside click / escape, clean up
            if (!open) setCurrentProblem(null);
          }}
          initialConfidence={currentProblem.initialConfidence}
          initialNotes={currentProblem.initialNotes}
          problemTitle={currentProblem.title}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
