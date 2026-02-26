"use client";

import React from "react";
import { mockProblem, mockUserProgress, mockUserAccount } from "./mock-data";
import { useXPAnimation } from "./hooks/use-xp-animation";
import { useDraft } from "./hooks/use-draft";
import { XPPopup } from "./components/xp-popup";
import { ProblemHeader } from "./components/problem-header";
import { ProblemContent } from "./components/problem-content";
import { ProgressTracker } from "./components/progress-tracker";
import { AIMentorPanel } from "./components/ai-mentor-panel";
import { BottomSection } from "./components/bottom-section";

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function ProblemPage() {
  const problem = mockProblem;
  const account = mockUserAccount;
  const isPremium = account.plan === "plus";

  // Hooks
  const { localXP, xpPop, solveFlash, triggerXPGain } = useXPAnimation(
    account.xp,
  );
  const {
    draft,
    saved,
    saving,
    isDirty,
    handleSave,
    handleMarkSolved,
    toggleBookmark,
    setConfidence,
    setNotes,
  } = useDraft(mockUserProgress, problem, triggerXPGain);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        @keyframes solve-pulse {
          0%,100% { box-shadow: none; }
          40%      { box-shadow: 0 0 0 16px rgba(249,115,22,0.15), 0 0 40px rgba(249,115,22,0.1); }
        }
        .solve-pulse { animation: solve-pulse 0.8s ease-out; }

        .bc-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);
          background-size: 40px 40px;
        }
        .og-glow  { box-shadow: 0 0 60px -15px rgba(249,115,22,0.18); }
        .og-hover { transition: border-color 0.25s, box-shadow 0.25s; }
        .og-hover:hover {
          border-color: rgba(249,115,22,0.35) !important;
          box-shadow: 0 0 0 1px rgba(249,115,22,0.08), 0 0 36px rgba(249,115,22,0.07);
        }
        .btn-lc {
          background: #ffa116;
          color: #000;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 28px -5px rgba(255,161,22,0.5);
        }
        .btn-lc:hover { transform: translateY(-1px); box-shadow: 0 0 40px -5px rgba(255,161,22,0.7); }
        .btn-lc:active { transform: translateY(0); }
        .btn-orange {
          background: linear-gradient(135deg,#f97316,#ea580c);
          color: #000; font-weight: 900;
          box-shadow: 0 0 18px rgba(249,115,22,0.3);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .btn-orange:hover  { box-shadow: 0 0 32px rgba(249,115,22,0.55); transform: translateY(-1px); }
        .btn-orange:active { transform: translateY(0); }
        .mono { font-family:'DM Mono','Fira Mono',monospace; }
        .sans { font-family:'DM Sans',sans-serif; }
      `}</style>

      <XPPopup amount={problem.xpReward} visible={xpPop} />

      <div className="min-h-screen bg-[#060608] text-zinc-300 sans">
        <div className="fixed inset-0 bc-grid pointer-events-none" />
        {/* Ambient top glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(249,115,22,0.055), transparent 65%)",
          }}
        />

        {/* HEADER */}
        <ProblemHeader
          problem={problem}
          draft={draft}
          saving={saving}
          isDirty={isDirty}
          localXP={localXP}
          isPremium={isPremium}
          onSave={handleSave}
          onToggleBookmark={toggleBookmark}
        />

        {/* MAIN LAYOUT */}
        <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          {/* LEFT: Problem content */}
          <ProblemContent problem={problem} />

          {/* RIGHT: Progress + AI Mentor */}
          <div className="lg:col-span-5">
            <div className="sticky top-[6.25rem] space-y-5">
              <ProgressTracker
                problem={problem}
                draft={draft}
                saved={saved}
                saving={saving}
                isDirty={isDirty}
                solveFlash={solveFlash}
                onSave={handleSave}
                onMarkSolved={handleMarkSolved}
                onSetConfidence={setConfidence}
                onSetNotes={setNotes}
              />

              <AIMentorPanel
                isPremium={isPremium}
                problem={problem}
                account={account}
              />
            </div>
          </div>
        </main>

        {/* BOTTOM — Discussion & Editorial */}
        <BottomSection isPremium={isPremium} problem={problem} />
      </div>
    </>
  );
}
