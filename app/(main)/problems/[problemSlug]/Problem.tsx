"use client";

import { useCallback, useMemo, useState } from "react";
import { Bot, Cloud, Lightbulb, Loader2, StickyNote, Terminal } from "lucide-react";
import { toast } from "sonner";
import ProblemTopbar from "@/components/problems/ProblemTopbar";
import ProblemSectionNav from "@/components/problems/ProblemSectionNav";
import ProblemDescription from "@/components/problems/ProblemDescription";
import EditorPanel, { type AcceptedSummary } from "@/components/problems/EditorPanel";
import ConfidenceRow from "@/components/problems/ConfidenceRow";
import CollapsibleSection from "@/components/problems/CollapsibleSection";
import { EditorialContent, HintsList } from "@/components/problems/EditorialContent";
import NotesEditor from "@/components/problems/NotesEditor";
import AiMentorPanel from "@/components/problems/AiMentorPanel";
import SolveDialog from "@/components/problems/SolveDialog";
import {
  asStringArray,
  parseEditorial,
  parseInputFormat,
  parseLines,
  toProgressState,
} from "@/components/problems/problem-utils";
import type {
  ConfidenceV2,
  ProblemData,
  ProgressState,
  SectionId,
  SolveDialogData,
  TestCase,
  UserProblemData,
} from "@/components/problems/types";

const EMPTY_TESTCASES: TestCase[] = [];
const INITIAL_SECTIONS: Record<SectionId, boolean> = {
  editorial: false,
  hints: false,
  notes: false,
  "ai-mentor": false,
};

// Stable elements so memoised children don't see new props every render.
const ICON_EDITORIAL = <Terminal size={15} />;
const ICON_HINTS = <Lightbulb size={15} />;
const ICON_NOTES = <StickyNote size={15} />;
const ICON_MENTOR = <Bot size={15} />;
const MENTOR_ONLINE = (
  <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
);
const MENTOR_PLUS = <span className="chip chip-accent font-mono uppercase">Plus</span>;

interface ProblemPageProps {
  problem: ProblemData;
  userProblem?: UserProblemData | null;
  isPremium?: boolean;
  inputFormat?: string;
}

export default function ProblemPage({
  problem: p,
  userProblem,
  isPremium = false,
  inputFormat,
}: ProblemPageProps) {
  // ── derived problem content (memoised: parsed once per problem) ──
  const editorial = useMemo(() => parseEditorial(p.editorial), [p.editorial]);
  const hints = useMemo(() => parseLines(p.aiHints), [p.aiHints]);
  const examples = useMemo(() => asStringArray(p.examples), [p.examples]);
  const companies = useMemo(() => asStringArray(p.companies), [p.companies]);
  const tags = useMemo(() => asStringArray(p.tags).slice(0, 3), [p.tags]);
  const testCases = p.testCases ?? EMPTY_TESTCASES;
  const inputFormatItems = useMemo(
    () => (testCases.length ? parseInputFormat(testCases[0]) : []),
    [testCases],
  );

  // ── progress ──
  const [progress, setProgress] = useState<ProgressState>(() =>
    toProgressState(userProblem),
  );
  const [committed, setCommitted] = useState<ProgressState>(() =>
    toProgressState(userProblem),
  );
  const [saving, setSaving] = useState(false);

  // Re-sync when the server hands us a fresh userProblem (navigation/refresh).
  const [syncedUserProblem, setSyncedUserProblem] = useState(userProblem);
  if (userProblem !== syncedUserProblem) {
    setSyncedUserProblem(userProblem);
    const next = toProgressState(userProblem);
    setProgress(next);
    setCommitted(next);
  }

  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [solveDialog, setSolveDialog] = useState<AcceptedSummary | null>(null);

  const toastId = `save-progress-${p.slug}`;

  const patchProgress = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/problems/${p.slug}/problem`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Save failed");
      return (json?.data ?? undefined) as UserProblemData | undefined;
    },
    [p.slug],
  );

  const handleSaveNotes = useCallback(async () => {
    if (saving) return;
    const snapshot = progress;
    setSaving(true);
    toast.loading("Saving progress…", { id: toastId });
    try {
      const up = await patchProgress({
        solved: snapshot.solved,
        confidenceV2: snapshot.confidenceV2,
        notes: snapshot.notes,
        bookmark: snapshot.bookmark,
      });
      const persisted = up ? toProgressState(up) : snapshot;
      setProgress(persisted);
      setCommitted(persisted);
      toast.success("Progress saved", { id: toastId });
    } catch (err) {
      setProgress(committed);
      toast.error(
        err instanceof Error ? err.message : "Save failed — changes rolled back",
        { id: toastId },
      );
    } finally {
      setSaving(false);
    }
  }, [saving, progress, committed, patchProgress, toastId]);

  const handleToggleBookmark = useCallback(async () => {
    if (saving) return;
    const next = !progress.bookmark;
    setProgress((prev) => ({ ...prev, bookmark: next }));
    try {
      await patchProgress({ bookmark: next });
      setCommitted((prev) => ({ ...prev, bookmark: next }));
    } catch (err) {
      console.error("Failed to save bookmark:", err);
      setProgress((prev) => ({ ...prev, bookmark: !next }));
      toast.error("Could not update bookmark");
    }
  }, [saving, progress.bookmark, patchProgress]);

  const handleConfidenceChange = useCallback(
    async (level: ConfidenceV2) => {
      if (saving) return;
      const previous = committed.confidenceV2;
      setProgress((prev) => ({ ...prev, confidenceV2: level }));
      try {
        await patchProgress({ confidenceV2: level });
        setCommitted((prev) => ({ ...prev, confidenceV2: level }));
      } catch (err) {
        console.error("Failed to save confidence:", err);
        setProgress((prev) => ({ ...prev, confidenceV2: previous }));
        toast.error("Could not update confidence");
      }
    },
    [saving, committed.confidenceV2, patchProgress],
  );

  const handleSolveDialogSave = useCallback(
    async (data: SolveDialogData) => {
      try {
        await patchProgress({
          solved: true,
          confidenceV2: data.confidence,
          perceivedDifficulty: data.difficulty,
          keyInsight: data.insight,
          enableReview: data.enableReview,
        });
        const confidence = data.confidence as ConfidenceV2;
        setProgress((prev) => ({ ...prev, solved: true, confidenceV2: confidence }));
        setCommitted((prev) => ({ ...prev, solved: true, confidenceV2: confidence }));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save progress");
        throw err; // dialog reverts to its form
      }
    },
    [patchProgress],
  );

  const handleAccepted = useCallback(
    (summary: AcceptedSummary) => setSolveDialog(summary),
    [],
  );
  const closeSolveDialog = useCallback(() => setSolveDialog(null), []);

  const handleNotesChange = useCallback(
    (html: string) => setProgress((prev) => ({ ...prev, notes: html })),
    [],
  );

  // ── sections ──
  const openSection = useCallback((id: SectionId) => {
    setSections((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const toggleSection = useCallback((id: string) => {
    const key = id as SectionId;
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const notesDirty = progress.notes !== committed.notes;

  return (
    <>
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden text-fg-secondary animate-fade-in">
        <ProblemTopbar
          title={p.title}
          difficulty={p.difficulty}
          tags={tags}
          bookmark={progress.bookmark}
          solved={progress.solved}
          disabled={saving}
          onToggleBookmark={handleToggleBookmark}
        />

        <ProblemSectionNav
          open={sections}
          isPremium={isPremium}
          onOpen={openSection}
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Workspace: description | editor */}
          <div className="card-base relative mx-7 my-5 grid h-[calc(100%-2.5rem)] grid-cols-[40%_1fr] grid-rows-[minmax(0,1fr)] overflow-hidden bg-surface shadow-soft">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[10%] top-0 z-10 h-px bg-linear-to-r from-transparent via-accent/30 to-transparent"
            />
            <ProblemDescription
              description={p.description}
              companies={companies}
              examples={examples}
              inputFormatItems={inputFormatItems}
              inputFormat={inputFormat}
            />
            <EditorPanel
              slug={p.slug}
              testCases={testCases}
              onAccepted={handleAccepted}
            />
          </div>

          {/* Bottom sections */}
          <div className="flex flex-col gap-3.5 px-7 pb-10">
            <ConfidenceRow
              value={progress.confidenceV2}
              solved={progress.solved}
              disabled={saving}
              onChange={handleConfidenceChange}
            />

            <CollapsibleSection
              id="editorial"
              icon={ICON_EDITORIAL}
              title="Editorial & Approach"
              isOpen={sections.editorial}
              onToggle={toggleSection}
            >
              <EditorialContent insight={editorial.insight} points={editorial.points} />
            </CollapsibleSection>

            <CollapsibleSection
              id="hints"
              icon={ICON_HINTS}
              title="Hints"
              isOpen={sections.hints}
              onToggle={toggleSection}
            >
              <HintsList hints={hints} />
            </CollapsibleSection>

            <CollapsibleSection
              id="notes"
              icon={ICON_NOTES}
              title="Notes"
              isOpen={sections.notes}
              onToggle={toggleSection}
              lazy
            >
              <NotesEditor
                value={progress.notes}
                disabled={saving}
                onChange={handleNotesChange}
              />
              {notesDirty && (
                <div className="mt-4 flex justify-end border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="btn btn-sm btn-outline-accent font-mono text-[11px]"
                  >
                    {saving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Cloud size={12} />
                    )}
                    {saving ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              )}
            </CollapsibleSection>

            <CollapsibleSection
              id="ai-mentor"
              icon={ICON_MENTOR}
              title="AI Mentor"
              isOpen={sections["ai-mentor"]}
              onToggle={toggleSection}
              rightExtra={isPremium ? MENTOR_ONLINE : MENTOR_PLUS}
              lazy
            >
              <AiMentorPanel problemId={p.id} isPremium={isPremium} />
            </CollapsibleSection>

            <p className="py-[18px] text-center font-mono text-[11px] italic text-fg-muted/70">
              Discussion — Coming Soon
            </p>
          </div>
        </div>
      </div>

      {solveDialog && (
        <SolveDialog
          problemTitle={p.title}
          passed={solveDialog.passed}
          total={solveDialog.total}
          onClose={closeSolveDialog}
          onSave={handleSolveDialogSave}
        />
      )}
    </>
  );
}
