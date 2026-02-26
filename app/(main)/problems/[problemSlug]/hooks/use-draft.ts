"use client";

import { useState, useCallback } from "react";
import type { UserProgress, Problem } from "../types";

/**
 * Manages the draft / saved progress state and the save handler.
 * Returns everything the progress tracker and header need.
 */
export function useDraft(
  initialProgress: UserProgress,
  problem: Problem,
  onXPGain: (amount: number) => void,
) {
  const [draft, setDraft] = useState<UserProgress>(initialProgress);
  const [saved, setSaved] = useState<UserProgress>(initialProgress);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = useCallback(async () => {
    if (JSON.stringify(draft) === JSON.stringify(saved) || saving) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      // Real: await fetch(`/api/progress/${problem.slug}`, { method:"PATCH", body: JSON.stringify(draft) })
      setSaved({ ...draft });
    } finally {
      setSaving(false);
    }
  }, [draft, saved, saving, problem.slug]);

  const handleMarkSolved = useCallback(() => {
    if (draft.solved) return;
    setDraft((d) => ({
      ...d,
      solved: true,
      solvedAt: new Date().toISOString(),
    }));
    onXPGain(problem.xpReward);
  }, [draft.solved, problem.xpReward, onXPGain]);

  const toggleBookmark = useCallback(() => {
    setDraft((d) => ({ ...d, bookmarked: !d.bookmarked }));
  }, []);

  const setConfidence = useCallback(
    (level: UserProgress["confidence"]) => {
      setDraft((d) => ({ ...d, confidence: level }));
    },
    [],
  );

  const setNotes = useCallback((notes: string) => {
    setDraft((d) => ({ ...d, notes }));
  }, []);

  return {
    draft,
    saved,
    saving,
    isDirty,
    handleSave,
    handleMarkSolved,
    toggleBookmark,
    setConfidence,
    setNotes,
  } as const;
}
