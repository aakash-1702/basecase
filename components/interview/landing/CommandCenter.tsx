"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { toast } from "sonner";
import Container from "@/components/shared/Container";
import EmptyState from "@/components/shared/EmptyState";
import StatTile from "@/components/shared/StatTile";
import type { InterviewListItem } from "@/types/interview";
import { StartInterviewModal } from "../StartInterviewModal";
import { CompletedInterviewCard } from "./CompletedInterviewCard";
import { CreditsBanner } from "./CreditsBanner";
import { DeleteInterviewDialog } from "./DeleteInterviewDialog";
import { InterviewHero } from "./InterviewHero";
import { InterviewListSection } from "./InterviewListSection";
import { InterviewListSkeleton } from "./InterviewListSkeleton";
import { InterviewPromo } from "./InterviewPromo";
import { PendingInterviewCard } from "./PendingInterviewCard";
import { ProcessingInterviewCard } from "./ProcessingInterviewCard";
import { formatRenewalDate } from "./utils";

const POLL_INTERVAL_MS = 15_000;
const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3";

interface InterviewLandingProps {
  isPremium?: boolean;
  initialCredits?: number;
  expiresAt?: string | null;
}

export function InterviewLanding({
  isPremium = false,
  initialCredits = 0,
  expiresAt = null,
}: InterviewLandingProps) {
  const [showModal, setShowModal] = useState(false);
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showPromo = !isPremium && initialCredits === 0;
  const hasCredits = initialCredits > 0;

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await fetch("/api/interview");
      const json = await res.json();
      if (json.success && json.data) setInterviews(json.data);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load (skipped for the promo page, which never renders the list).
  useEffect(() => {
    if (showPromo) return;
    fetchInterviews();
  }, [showPromo, fetchInterviews]);

  // ── Derived lists (one pass, memoised) ──
  const { pending, processing, past, avgScore } = useMemo(() => {
    const pending: InterviewListItem[] = [];
    const processing: InterviewListItem[] = [];
    const past: InterviewListItem[] = [];
    for (const i of interviews) {
      if (i.status === "notStarted") pending.push(i);
      else if (i.status === "processing") processing.push(i);
      else past.push(i);
    }
    const scored = past.filter((i) => i.feedback?.overallScore != null);
    const avgScore =
      scored.length > 0
        ? scored.reduce((acc, i) => acc + (i.feedback?.overallScore ?? 0), 0) / scored.length
        : 0;
    return { pending, processing, past, avgScore };
  }, [interviews]);

  // ── Poll while reports are generating; paused when the tab is hidden ──
  const hasProcessing = processing.length > 0;
  useEffect(() => {
    if (!hasProcessing) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer === null) timer = setInterval(fetchInterviews, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchInterviews(); // catch up immediately, then resume polling
        start();
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "visible") start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hasProcessing, fetchInterviews]);

  // ── Delete flow ──
  const requestDelete = useCallback((id: string) => setDeleteTargetId(id), []);
  const cancelDelete = useCallback(() => setDeleteTargetId(null), []);
  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    const toastId = toast.loading("Deleting interview...");
    try {
      const res = await fetch(`/api/interview/${deleteTargetId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Interview deleted", { id: toastId });
        setInterviews((prev) => prev.filter((i) => i.id !== deleteTargetId));
      } else {
        toast.error(data.message || "Failed to delete interview", { id: toastId });
      }
    } catch {
      toast.error("An error occurred while deleting", { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  }, [deleteTargetId]);

  // ── PROMO PAGE: not premium AND zero credits ──
  if (showPromo) return <InterviewPromo />;

  // ── MAIN DASHBOARD: premium OR has credits ──
  return (
    <div className="relative">
      <Container size="lg" className="pb-10 pt-16 md:pt-20">
        <InterviewHero />

        <div className="mt-8 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <CreditsBanner premium={isPremium} credits={initialCredits} expiresAt={expiresAt} />
        </div>

        <div
          className="mt-10 flex animate-fade-up flex-col gap-6 sm:flex-row sm:items-center"
          style={{ animationDelay: "180ms" }}
        >
          {hasCredits && (
            <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary">
              + Start new session
            </button>
          )}

          {isPremium && !hasCredits && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="card-base flex max-w-sm items-start gap-3 border-danger/20 p-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-danger/20 bg-danger/10 text-danger">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">Monthly interviews exhausted</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                    Your 10 credits reset on{" "}
                    <span className="text-fg">
                      {expiresAt ? formatRenewalDate(expiresAt) : "your next renewal"}
                    </span>
                    . Need more now?
                  </p>
                  <Link
                    href="/subscription"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                  >
                    View higher plans <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <button type="button" disabled className="btn btn-secondary">
                + Start new session
              </button>
            </div>
          )}

          <div className="flex gap-8 sm:ml-auto">
            <StatTile value={avgScore > 0 ? avgScore.toFixed(1) : "—"} label="Avg score" />
            <div className="w-px bg-line" />
            <StatTile value={interviews.length} label="Sessions" />
          </div>
        </div>
      </Container>

      <Container size="lg" className="pb-24">
        {(isLoading || pending.length > 0) && (
          <InterviewListSection
            title="Pending interviews"
            live
            meta={isLoading ? "…" : `${pending.length} waiting`}
          >
            {isLoading ? (
              <InterviewListSkeleton count={2} />
            ) : (
              <div className={GRID}>
                {pending.map((interview, idx) => (
                  <PendingInterviewCard
                    key={interview.id}
                    interview={interview}
                    index={idx}
                    onDelete={requestDelete}
                  />
                ))}
              </div>
            )}
          </InterviewListSection>
        )}

        {hasProcessing && (
          <InterviewListSection
            title="Processing"
            live
            meta={`${processing.length} generating report${processing.length > 1 ? "s" : ""}`}
          >
            <div className={GRID}>
              {processing.map((interview, idx) => (
                <ProcessingInterviewCard key={interview.id} interview={interview} index={idx} />
              ))}
            </div>
          </InterviewListSection>
        )}

        <InterviewListSection
          title="Past sessions"
          meta={isLoading ? "…" : `${past.length} total`}
          className="pb-0"
        >
          {isLoading ? (
            <InterviewListSkeleton count={3} />
          ) : past.length > 0 ? (
            <div className={GRID}>
              {past.map((interview, idx) => (
                <CompletedInterviewCard
                  key={interview.id}
                  interview={interview}
                  index={idx}
                  onDelete={requestDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No completed sessions yet"
              description="Start your first mock interview above."
            />
          )}
        </InterviewListSection>
      </Container>

      <DeleteInterviewDialog
        open={deleteTargetId !== null}
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {showModal && <StartInterviewModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
