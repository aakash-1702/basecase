// components/problems/ProblemsTable.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  UpdateProgressDialog,
  ConfidenceLevel,
} from "@/components/problems/UpdateProgressDialog";

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  link: string;
  userProgress?: {
    solved: boolean;
    confidence: ConfidenceLevel;
    notes?: string;
  } | null;
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
  onSaveChanges?: (
    problemId: string,
    confidence: ConfidenceLevel,
    notes: string,
    solved: boolean,
  ) => Promise<void>; // ✅ must return a Promise
}

export default function ProblemsTable({
  problems,
  onSaveChanges,
}: ProblemsTableProps) {

  const [localSolved, setLocalSolved] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    problems.forEach((p) => (initial[p.id] = p.userProgress?.solved ?? false));
    return initial;
  });

  const [localConfidence, setLocalConfidence] = useState<Record<string, ConfidenceLevel>>(() => {
    const initial: Record<string, ConfidenceLevel> = {};
    problems.forEach((p) => {
      initial[p.id] = p.userProgress?.confidence ?? "not_attempted";
    });
    return initial;
  });

  const [notesMap, setNotesMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    problems.forEach((p) => {
      initial[p.id] = p.userProgress?.notes ?? "";
    });
    return initial;
  });

  useEffect(() => {
    setLocalSolved(() => {
      const next: Record<string, boolean> = {};
      problems.forEach((p) => (next[p.id] = p.userProgress?.solved ?? false));
      return next;
    });

    setLocalConfidence(() => {
      const next: Record<string, ConfidenceLevel> = {};
      problems.forEach((p) => {
        next[p.id] = p.userProgress?.confidence ?? "not_attempted";
      });
      return next;
    });

    setNotesMap((prev) => {
      const next: Record<string, string> = {};
      problems.forEach((p) => {
        next[p.id] = prev[p.id] !== undefined ? prev[p.id] : (p.userProgress?.notes ?? "");
      });
      return next;
    });
  }, [problems]);

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

  const handleSave = async (confidence: ConfidenceLevel, notes: string) => {
    if (!currentProblem) return;
    const problemId = currentProblem.id;

    const shouldBeSolved =
      confidence === "confident" || confidence === "needs_revision";

    // Close dialog immediately for snappy UX
    setCurrentProblem(null);
    setShowDialog(false);

    const toastId = toast.loading("Saving your progress...");

    try {
      await onSaveChanges?.(problemId, confidence, notes, shouldBeSolved);

      // ✅ Only update local state AFTER server confirms
      setLocalConfidence((prev) => ({ ...prev, [problemId]: confidence }));
      setLocalSolved((prev) => ({ ...prev, [problemId]: shouldBeSolved }));
      setNotesMap((prev) => ({ ...prev, [problemId]: notes }));

      toast.success("Progress saved! Keep grinding 🔥", { id: toastId });
    } catch {
      // ✅ Local state stays untouched — UI reverts naturally
      toast.error("Failed to save. Please try again.", { id: toastId });
    }
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
            <th className="w-28 py-4 px-3 font-medium text-center">Difficulty</th>
            <th className="py-4 px-3 font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {problems.map((problem) => {
            const isSolved = localSolved[problem.id] ?? false;
            const confidence = localConfidence[problem.id] ?? "not_attempted";
            const notes = notesMap[problem.id] ?? "";

            return (
              <tr
                key={problem.id}
                className={cn(
                  "group border-b border-neutral-800/60 transition-all duration-300 ease-out",
                  "hover:bg-neutral-900/70 hover:shadow-[inset_0_1px_0_0_rgba(245,158,11,0.08)]",
                  "hover:-translate-y-px",
                )}
              >
                {/* Done column */}
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
                    href={`/problems/${problem.slug}`}
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
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </td>

                {/* Status + notes preview */}
                <td className="py-4 px-3">
                  <div className="flex flex-col gap-1 text-sm">
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        confidence === "confident" && "text-emerald-400",
                        confidence === "needs_revision" && "text-amber-400",
                        confidence === "failed" && "text-rose-400",
                        (confidence === "not_attempted" || confidence === "skipped") && "text-neutral-500",
                      )}
                    >
                      {confidenceLabels[confidence]}
                    </span>

                    {notes && (
                      <span
                        title={notes}
                        className="flex items-center gap-1 text-xs text-neutral-400 italic truncate max-w-[220px]"
                      >
                        <Pencil className="h-3 w-3 text-amber-400/70 shrink-0" />
                        {notes}
                      </span>
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

      {currentProblem && (
        <UpdateProgressDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
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