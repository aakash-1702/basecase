"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Cloud,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONFIDENCE_MAP } from "../constants";
import type { Problem, UserProgress, ConfidenceLevel } from "../types";
import { RichNotesEditor } from "./rich-note-editor";

interface ProgressTrackerProps {
  problem: Problem;
  draft: UserProgress;
  saved: UserProgress;
  saving: boolean;
  isDirty: boolean;
  solveFlash: boolean;
  onSave: () => void;
  onMarkSolved: () => void;
  onSetConfidence: (level: ConfidenceLevel) => void;
  onSetNotes: (notes: string) => void;
}

export const ProgressTracker = React.memo(function ProgressTracker({
  problem,
  draft,
  saved,
  saving,
  isDirty,
  solveFlash,
  onSave,
  onMarkSolved,
  onSetConfidence,
  onSetNotes,
}: ProgressTrackerProps) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-3xl overflow-hidden og-hover",
        solveFlash && "solve-pulse",
      )}
      style={{
        background: "rgba(10,10,14,0.98)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)",
        }}
      />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
            Your Progress
          </span>
          {problem.acceptanceRate && (
            <span className="mono text-[9px] text-zinc-600">
              {problem.acceptanceRate}% acceptance rate
            </span>
          )}
        </div>

        {/* Solve row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="sans text-sm font-bold text-zinc-200">Status</p>
            {draft.solved && draft.solvedAt && (
              <p className="mono text-[9px] text-zinc-600 mt-0.5">
                {new Date(draft.solvedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          {draft.solved ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 fill-emerald-500 text-emerald-500" />
              <span
                className="mono text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg"
                style={{
                  color: "#34d399",
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.18)",
                }}
              >
                Solved
              </span>
            </div>
          ) : (
            <button
              onClick={onMarkSolved}
              className="btn-orange mono text-[9px] uppercase tracking-[0.2em] px-4 py-2 rounded-xl"
            >
              Mark Solved · +{problem.xpReward} XP
            </button>
          )}
        </div>

        {/* Interview frequency */}
        {problem.frequency !== undefined && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Interview Frequency
              </span>
              <span
                className="mono text-[9px] font-black"
                style={{ color: "#f97316" }}
              >
                {problem.frequency}%
              </span>
            </div>
            <div
              className="w-full h-[3px] rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${problem.frequency}%`,
                  background: "linear-gradient(90deg,#f97316,#fbbf24)",
                }}
              />
            </div>
          </div>
        )}

        <div
          className="h-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        {/* Confidence */}
        <div>
          <span className="mono text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block mb-2.5">
            Confidence
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(["low", "medium", "high"] as const).map((level) => {
              const cfg = CONFIDENCE_MAP[level];
              const active = draft.confidence === level;
              return (
                <button
                  key={level}
                  onClick={() => onSetConfidence(level)}
                  className="mono text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: active ? cfg.bg : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.07)"}`,
                    color: active ? cfg.color : "#52525b",
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="h-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        {/* Notes toggle */}
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setNotesOpen((v) => !v)}
        >
          <span className="sans text-sm font-semibold text-zinc-300">
            Notes
          </span>
          <div className="flex items-center gap-2">
            {draft.notes && draft.notes === saved.notes && (
              <span
                className="mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(52,211,153,0.08)",
                  color: "#34d399",
                  border: "1px solid rgba(52,211,153,0.18)",
                }}
              >
                saved
              </span>
            )}
            {draft.notes && draft.notes !== saved.notes && (
              <span
                className="mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                unsaved
              </span>
            )}
            {notesOpen ? (
              <ChevronUp className="h-4 w-4 text-zinc-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-600" />
            )}
          </div>
        </button>

        {/* Collapsed preview */}
        {!notesOpen && draft.notes && (
          <p
            className="sans text-xs text-zinc-600 -mt-3 truncate"
            dangerouslySetInnerHTML={{ __html: draft.notes }}
          />
        )}

        {/* Rich editor */}
        {notesOpen && (
          <RichNotesEditor
            initialValue={draft.notes ?? ""}
            onChange={onSetNotes}
          />
        )}

        {/* Single save button — handles everything */}
        {isDirty && (
          <button
            onClick={onSave}
            disabled={saving}
            className="btn-orange w-full mono text-[9px] uppercase tracking-[0.2em] py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Cloud className="h-3.5 w-3.5" /> Save Progress
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
