"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { INTERVIEW_CONFIGS, type InterviewType } from "@/lib/interviewTypes";

/* ─── Types ─────────────────────────────────────────────────── */
type InterviewMode = "dsa" | "systemdesign" | "resume" | "github";

interface ModeConfig {
  id: InterviewMode;
  name: string;
  description: string;
  whatToExpect: string;
  credits: 1 | 2 | 3;
  apiType: "DSA" | "Technical" | "HR" | "Behavioural";
}

const MODES: ModeConfig[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    description:
      "LeetCode-style coding questions, live in the browser. Difficulty scales as you answer.",
    whatToExpect:
      "Expect 4–6 algorithmic problems across arrays, graphs, DP, and trees.",
    credits: 2,
    apiType: "DSA",
  },
  {
    id: "systemdesign",
    name: "System Design",
    description:
      "Design scalable distributed systems under a senior-level interview format. No code — pure architecture.",
    whatToExpect:
      "Expect open-ended design prompts: URL shorteners, feed systems, rate limiters.",
    credits: 2,
    apiType: "Technical",
  },
  {
    id: "resume",
    name: "Resume-Based Interview",
    description:
      "Questions generated from your uploaded resume. Role-specific and experience-calibrated.",
    whatToExpect:
      "We parse your resume and generate questions around your listed projects and skills.",
    credits: 2,
    apiType: "Technical",
  },
  {
    id: "github",
    name: "Project Deep Dive (GitHub)",
    description:
      "We scrape your repo, understand the architecture, and interview you like you're defending it to a senior engineer.",
    whatToExpect:
      "Expect questions on your actual code decisions, design tradeoffs, and implementation choices.",
    credits: 3,
    apiType: "Technical",
  },
];

/* ─── Credit pill color map ─────────────────────────────────── */
function getCreditPillStyle(credits: number) {
  if (credits === 1) {
    return {
      background: "rgba(34,197,94,0.1)",
      color: "#4ade80",
    };
  }
  if (credits === 2) {
    return {
      background: "rgba(245,158,11,0.1)",
      color: "var(--amber)",
    };
  }
  // 3 credits — red
  return {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
  };
}

/* ─── Shared constants ──────────────────────────────────────── */
const SENIORITY = ["Junior", "Senior", "Staff", "Principal"];
const MONO = "var(--font-dm-mono), 'DM Mono', monospace";
const SERIF = "var(--font-dm-serif), 'DM Serif Display', serif";

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export interface StartInterviewModalProps {
  onClose: () => void;
  initialCredits?: number;
}

export function StartInterviewModal({
  onClose,
  initialCredits = 5,
}: StartInterviewModalProps) {
  const router = useRouter();

  /* ── Page state ── */
  const [page, setPage] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<InterviewMode | null>(null);

  /* ── Page 2 config state ── */
  // DSA
  const [dsaDifficulty, setDsaDifficulty] = useState<string | null>(null);
  const [dsaTopics, setDsaTopics] = useState<string[]>([]);
  const [dsaSeniority, setDsaSeniority] = useState<string | null>(null);

  // System Design
  const [sdFocus, setSdFocus] = useState<string | null>(null);
  const [sdSeniority, setSdSeniority] = useState<string | null>(null);
  const [sdCompanyStyle, setSdCompanyStyle] = useState("Generic / Any");

  // Resume-Based
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasResumeOnFile] = useState(true); // Check from profile
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [resumeTargetRole, setResumeTargetRole] = useState<string | null>(null);
  const [resumeSeniority, setResumeSeniority] = useState<string | null>(null);
  const [resumeFocusArea, setResumeFocusArea] = useState<string>("Mixed");

  // GitHub Repo
  const [repoUrl, setRepoUrl] = useState("");
  const [repoUrlError, setRepoUrlError] = useState<string | null>(null);
  const [repoRole, setRepoRole] = useState<string | null>(null);
  const [repoTargetRole, setRepoTargetRole] = useState<InterviewType | null>(
    null,
  );
  const [repoSeniority, setRepoSeniority] = useState<string | null>(null);

  /* ── Submit state ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Derived ── */
  const modeConfig = MODES.find((m) => m.id === selectedMode) ?? null;
  const creditCost = modeConfig?.credits ?? 0;
  const hasEnoughCredits = selectedMode ? initialCredits >= creditCost : true;

  /* ── GitHub URL validation (on blur only) ── */
  const validateRepoUrl = useCallback((url: string) => {
    if (!url) {
      setRepoUrlError(null);
      return;
    }
    const githubPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+/;
    if (!githubPattern.test(url)) {
      setRepoUrlError(
        "Enter a valid GitHub repository URL (https://github.com/user/repo)",
      );
    } else {
      setRepoUrlError(null);
    }
  }, []);

  /* ── Get seniority for current mode ── */
  const getCurrentSeniority = () => {
    if (!selectedMode) return null;
    if (selectedMode === "dsa") return dsaSeniority;
    if (selectedMode === "systemdesign") return sdSeniority;
    if (selectedMode === "resume") return resumeSeniority;
    if (selectedMode === "github") return repoSeniority;
    return null;
  };

  /* ── Page 2 readiness check ── */
  const isPage2Valid = useCallback(() => {
    if (!selectedMode) return false;

    if (selectedMode === "dsa") {
      return !!dsaDifficulty && !!dsaSeniority;
    }
    if (selectedMode === "systemdesign") {
      return !!sdFocus && !!sdSeniority;
    }
    if (selectedMode === "resume") {
      if (!hasResumeOnFile && !useExistingResume && !resumeFile) return false;
      return !!resumeTargetRole && !!resumeSeniority;
    }
    if (selectedMode === "github") {
      const githubPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+/;
      return (
        repoUrl.trim().length > 0 &&
        githubPattern.test(repoUrl) &&
        !repoUrlError &&
        !!repoRole &&
        !!repoTargetRole &&
        !!repoSeniority
      );
    }
    return false;
  }, [
    selectedMode,
    dsaDifficulty,
    dsaSeniority,
    sdFocus,
    sdSeniority,
    hasResumeOnFile,
    useExistingResume,
    resumeFile,
    resumeTargetRole,
    resumeSeniority,
    repoUrl,
    repoUrlError,
    repoRole,
    repoTargetRole,
    repoSeniority,
  ]);

  /* ── Submit handler ── */
  const handleStart = async () => {
    if (!modeConfig || isSubmitting || !isPage2Valid()) return;

    const seniority = getCurrentSeniority();
    const difficultyMap: Record<string, "Entry" | "Mid" | "Senior" | "Staff"> =
      {
        Junior: "Entry",
        Senior: "Senior",
        Staff: "Staff",
        Principal: "Staff",
      };

    const difficulty = seniority ? (difficultyMap[seniority] ?? "Mid") : "Mid";

    setIsSubmitting(true);
    setSubmitError(null);

    // ── GitHub mode: POST to github endpoint → redirect to ready page ──
    if (selectedMode === "github") {
      try {
        const res = await fetch("/api/interview/new-interview/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoLink: repoUrl,
            roleInProject: repoRole,
            roleForInterview: repoTargetRole ?? "fullstack",
            userLevel: difficulty,
          }),
        });

        const json = await res.json();

        if (!json.success) {
          setSubmitError(json.message || "Failed to create interview");
          setIsSubmitting(false);
          return;
        }

        const interviewId = json.data?.id || json.data;
        const readyParams = new URLSearchParams({
          repo: repoUrl,
          questions: "8",
          difficulty,
          role:
            (repoTargetRole && INTERVIEW_CONFIGS[repoTargetRole]?.label) ||
            INTERVIEW_CONFIGS.fullstack.label,
        });
        onClose();
        router.push(
          `/interview/${interviewId}/ready?${readyParams.toString()}`,
        );
      } catch {
        setSubmitError("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
      return;
    }

    // ── Non-GitHub modes (legacy path) ──
    try {
      const res = await fetch("/api/interview/new-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: modeConfig.apiType,
          company: "Generic",
          difficulty,
          noOfQuestions: 8,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setSubmitError(json.message || "Failed to create interview");
        setIsSubmitting(false);
        return;
      }

      const interviewId = json.data;
      const params = new URLSearchParams({
        interviewId,
        mode: modeConfig.id,
        difficulty,
        questions: "8",
      });
      router.push(`/interview/new-session?${params.toString()}`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  /* ── Close on Escape ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Check if a row should be disabled (insufficient credits) ── */
  const isRowDisabled = (mode: ModeConfig) => initialCredits < mode.credits;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "92vw",
          maxWidth: 580,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          overflow: "hidden",
          animation: "simModalSlideUp 0.22s ease forwards",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "1.5rem 1.75rem 1.25rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                color: "var(--amber)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              New Interview
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: "1.3rem",
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {page === 1
                ? "Choose your interview type"
                : "Configure your session"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: "0.68rem",
                color: "var(--text-muted)",
              }}
            >
              {page} of 2
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1.2rem",
                lineHeight: 1,
                padding: "2px 4px",
                transition: "color 160ms ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div
          style={{
            height: 3,
            background: "var(--border-subtle)",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "var(--amber)",
              width: page === 1 ? "50%" : "100%",
              transition: "width 300ms ease",
            }}
          />
        </div>

        {/* ════════════════════════════════════════
           PAGE 1: TYPE SELECTION
        ════════════════════════════════════════ */}
        {page === 1 && (
          <>
            <div
              className="amber-scrollbar"
              style={{
                padding: "1.25rem 1.75rem",
                maxHeight: "68vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {MODES.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  const disabled = isRowDisabled(mode);
                  return (
                    <OptionRow
                      key={mode.id}
                      mode={mode}
                      isSelected={isSelected}
                      disabled={disabled}
                      onSelect={() => {
                        if (!disabled) setSelectedMode(mode.id);
                      }}
                    />
                  );
                })}
              </div>

              {/* Credit Balance Warning */}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.75rem",
                  color:
                    selectedMode && !hasEnoughCredits
                      ? "var(--amber)"
                      : "var(--text-muted)",
                  marginTop: "1rem",
                  transition: "color 160ms ease",
                }}
              >
                {selectedMode && !hasEnoughCredits
                  ? "Not enough credits for this option."
                  : `You have ${initialCredits} credit${initialCredits !== 1 ? "s" : ""} remaining.`}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.75rem",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  if (!selectedMode || !hasEnoughCredits) return;
                  if (selectedMode !== "github") {
                    toast.info(
                      "Coming soon — only GitHub Deep Dive is available right now",
                      {
                        duration: 3000,
                      },
                    );
                    return;
                  }
                  setPage(2);
                }}
                disabled={!selectedMode || !hasEnoughCredits}
                style={{
                  background: "var(--amber)",
                  color: "#000",
                  fontFamily: MONO,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "none",
                  cursor:
                    selectedMode && hasEnoughCredits
                      ? "pointer"
                      : "not-allowed",
                  opacity: selectedMode && hasEnoughCredits ? 1 : 0.4,
                  pointerEvents:
                    selectedMode && hasEnoughCredits ? "auto" : "none",
                  transition: "opacity 160ms ease",
                  letterSpacing: "0.02em",
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
           PAGE 2: CONFIGURATION
        ════════════════════════════════════════ */}
        {page === 2 && modeConfig && (
          <>
            <div
              className="amber-scrollbar"
              style={{
                padding: "1.25rem 1.75rem",
                maxHeight: "68vh",
                overflowY: "auto",
              }}
            >
              {/* ── Confirmation strip ── */}
              <div
                style={{
                  borderRadius: 8,
                  padding: "0.75rem 1rem",
                  background: "var(--amber-dim)",
                  border: "1px solid rgba(245,158,11,0.15)",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Selected:
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: "0.82rem",
                      color: "var(--amber)",
                      fontWeight: 600,
                    }}
                  >
                    {modeConfig.name}
                  </span>
                </div>
                <CreditPill credits={modeConfig.credits} />
              </div>

              {/* ── Mode-specific fields ── */}
              {selectedMode === "dsa" && (
                <DSAFields
                  difficulty={dsaDifficulty}
                  setDifficulty={setDsaDifficulty}
                  topics={dsaTopics}
                  setTopics={setDsaTopics}
                  seniority={dsaSeniority}
                  setSeniority={setDsaSeniority}
                />
              )}

              {selectedMode === "systemdesign" && (
                <SystemDesignFields
                  focus={sdFocus}
                  setFocus={setSdFocus}
                  seniority={sdSeniority}
                  setSeniority={setSdSeniority}
                  companyStyle={sdCompanyStyle}
                  setCompanyStyle={setSdCompanyStyle}
                />
              )}

              {selectedMode === "resume" && (
                <ResumeFields
                  hasResumeOnFile={hasResumeOnFile}
                  useExistingResume={useExistingResume}
                  setUseExistingResume={setUseExistingResume}
                  resumeFile={resumeFile}
                  setResumeFile={setResumeFile}
                  fileInputRef={fileInputRef}
                  targetRole={resumeTargetRole}
                  setTargetRole={setResumeTargetRole}
                  seniority={resumeSeniority}
                  setSeniority={setResumeSeniority}
                  focusArea={resumeFocusArea}
                  setFocusArea={setResumeFocusArea}
                />
              )}

              {selectedMode === "github" && (
                <GitHubFields
                  repoUrl={repoUrl}
                  setRepoUrl={setRepoUrl}
                  repoUrlError={repoUrlError}
                  validateRepoUrl={validateRepoUrl}
                  repoRole={repoRole}
                  setRepoRole={setRepoRole}
                  targetRole={repoTargetRole}
                  setTargetRole={setRepoTargetRole}
                  seniority={repoSeniority}
                  setSeniority={setRepoSeniority}
                />
              )}
            </div>

            {/* Submit error above footer */}
            {submitError && (
              <div
                style={{
                  padding: "0 1.75rem 0.5rem",
                  fontFamily: MONO,
                  fontSize: "0.78rem",
                  color: "#f87171",
                }}
              >
                {submitError}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.75rem",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => {
                  setSubmitError(null);
                  setPage(1);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontFamily: MONO,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  padding: 0,
                  letterSpacing: "0.02em",
                  transition: "color 160ms ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                ← Back
              </button>

              <button
                onClick={handleStart}
                disabled={!isPage2Valid() || isSubmitting}
                style={{
                  background: "var(--amber)",
                  color: "#000",
                  fontFamily: MONO,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "none",
                  cursor:
                    isPage2Valid() && !isSubmitting ? "pointer" : "not-allowed",
                  opacity: isPage2Valid() && !isSubmitting ? 1 : 0.4,
                  pointerEvents:
                    isPage2Valid() && !isSubmitting ? "auto" : "none",
                  transition: "opacity 160ms ease",
                  letterSpacing: "0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 160,
                  justifyContent: "center",
                }}
              >
                {isSubmitting ? <CSSSpinner /> : "Start Interview →"}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes simModalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes simSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── CSS-only Spinner ───────────────────────────────────────── */
function CSSSpinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,0.2)",
        borderTopColor: "#000",
        borderRadius: "50%",
        animation: "simSpin 0.6s linear infinite",
      }}
    />
  );
}

/* ─── Credit Pill (inline next to name) ──────────────────────── */
function CreditPill({ credits }: { credits: number }) {
  const colors = getCreditPillStyle(credits);
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: "0.68rem",
        letterSpacing: "0.06em",
        padding: "2px 9px",
        borderRadius: 20,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...colors,
      }}
    >
      {credits} credit{credits > 1 ? "s" : ""}
    </span>
  );
}

/* ─── Option Row (Page 1) ────────────────────────────────────── */
function OptionRow({
  mode,
  isSelected,
  disabled,
  onSelect,
}: {
  mode: ModeConfig;
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const pillColors = getCreditPillStyle(mode.credits);

  return (
    <div
      onClick={() => !disabled && onSelect()}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && !disabled && onSelect()}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        padding: "1.1rem 1.25rem",
        borderRadius: 10,
        border: `1px solid ${isSelected ? "var(--amber)" : "var(--border-subtle)"}`,
        background: isSelected ? "var(--amber-dim)" : "rgba(255,255,255,0.02)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 160ms, background 160ms",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !disabled) {
          const el = e.currentTarget;
          el.style.borderColor = "rgba(255,255,255,0.12)";
          el.style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !disabled) {
          const el = e.currentTarget;
          el.style.borderColor = "var(--border-subtle)";
          el.style.background = "rgba(255,255,255,0.02)";
        }
      }}
    >
      {/* Radio indicator */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `1.5px solid ${isSelected ? "var(--amber)" : "var(--border-subtle)"}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          transition: "border-color 160ms ease",
        }}
      >
        {isSelected && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--amber)",
            }}
          />
        )}
      </div>

      {/* Middle — content */}
      <div style={{ flex: 1 }}>
        {/* Name + credit pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {mode.name}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              padding: "2px 9px",
              borderRadius: 20,
              textTransform: "uppercase",
              ...pillColors,
            }}
          >
            {mode.credits} CREDIT{mode.credits > 1 ? "S" : ""}
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            color: "var(--text-muted)",
            fontFamily: MONO,
            fontSize: "0.82rem",
            lineHeight: 1.55,
            marginTop: 4,
          }}
        >
          {mode.description}
        </div>

        {/* What to expect */}
        <div
          style={{
            color: "var(--text-dim)",
            fontFamily: MONO,
            fontSize: "0.75rem",
            marginTop: 6,
          }}
        >
          {mode.whatToExpect}
        </div>
      </div>

      {/* Right — cost block */}
      <div
        style={{
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: "1.4rem",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {mode.credits}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            marginTop: 2,
          }}
        >
          {mode.credits === 1 ? "credit" : "credits"}
        </div>
      </div>
    </div>
  );
}

/* ─── Field Label ────────────────────────────────────────────── */
function FieldLabel({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {children}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: MONO,
            fontSize: "0.68rem",
            color: "var(--text-dim)",
            marginLeft: 6,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

/* ─── Single-select Pill Row ─────────────────────────────────── */
function PillRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: `1px solid ${active ? "var(--amber)" : "var(--border-subtle)"}`,
              background: active ? "var(--amber-dim)" : "transparent",
              color: active ? "var(--amber)" : "var(--text-muted)",
              fontFamily: MONO,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 160ms ease",
              letterSpacing: "0.02em",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Multi-select Pill Row ──────────────────────────────────── */
function MultiPillRow({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: `1px solid ${active ? "var(--amber)" : "var(--border-subtle)"}`,
              background: active ? "var(--amber-dim)" : "transparent",
              color: active ? "var(--amber)" : "var(--text-muted)",
              fontFamily: MONO,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 160ms ease",
              letterSpacing: "0.02em",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Styled Text Input ──────────────────────────────────────── */
function StyledInput({
  value,
  onChange,
  placeholder,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "10px 14px",
        color: "var(--text-primary)",
        fontFamily: MONO,
        fontSize: "0.85rem",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 160ms ease",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--amber)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    />
  );
}

/* ─── Styled Select ──────────────────────────────────────────── */
function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "10px 14px",
        color: "var(--text-primary)",
        fontFamily: MONO,
        fontSize: "0.85rem",
        outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: 36,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--amber)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      {options.map((opt) => (
        <option
          key={opt}
          value={opt}
          style={{ background: "#0f0f0f", color: "#e8e8ed" }}
        >
          {opt}
        </option>
      ))}
    </select>
  );
}

const fieldGap = { marginBottom: "1.25rem" } as const;

/* ═══════════════════════════════════════════════════
   PAGE 2 — DSA FIELDS
═══════════════════════════════════════════════════ */
function DSAFields({
  difficulty,
  setDifficulty,
  topics,
  setTopics,
  seniority,
  setSeniority,
}: {
  difficulty: string | null;
  setDifficulty: (v: string) => void;
  topics: string[];
  setTopics: (v: string[]) => void;
  seniority: string | null;
  setSeniority: (v: string) => void;
}) {
  const toggleTopic = (t: string) => {
    setTopics(
      topics.includes(t) ? topics.filter((x) => x !== t) : [...topics, t],
    );
  };

  return (
    <>
      <div style={fieldGap}>
        <FieldLabel>Difficulty</FieldLabel>
        <PillRow
          options={["Easy", "Medium", "Hard"]}
          selected={difficulty}
          onSelect={setDifficulty}
        />
      </div>
      <div style={fieldGap}>
        <FieldLabel sub="(optional — leave blank for mixed)">
          Topic Focus
        </FieldLabel>
        <MultiPillRow
          options={[
            "Arrays",
            "Strings",
            "Trees",
            "Graphs",
            "DP",
            "Sliding Window",
            "Heaps",
            "Binary Search",
          ]}
          selected={topics}
          onToggle={toggleTopic}
        />
      </div>
      <div style={{ marginBottom: 0 }}>
        <FieldLabel>Your Level</FieldLabel>
        <PillRow
          options={SENIORITY}
          selected={seniority}
          onSelect={setSeniority}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 2 — SYSTEM DESIGN FIELDS
═══════════════════════════════════════════════════ */
const SD_TILES = [
  { title: "Backend Systems", sub: "APIs, databases, caching" },
  { title: "Frontend Architecture", sub: "SPAs, CDNs, performance" },
  { title: "Data Pipelines", sub: "ETL, streaming, warehousing" },
  { title: "Mixed / Surprise me", sub: "Interviewer picks the domain" },
];

function SystemDesignFields({
  focus,
  setFocus,
  seniority,
  setSeniority,
  companyStyle,
  setCompanyStyle,
}: {
  focus: string | null;
  setFocus: (v: string) => void;
  seniority: string | null;
  setSeniority: (v: string) => void;
  companyStyle: string;
  setCompanyStyle: (v: string) => void;
}) {
  return (
    <>
      <div style={fieldGap}>
        <FieldLabel>Design Focus</FieldLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {SD_TILES.map((tile) => {
            const active = focus === tile.title;
            return (
              <button
                key={tile.title}
                onClick={() => setFocus(tile.title)}
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: 8,
                  border: `1px solid ${active ? "var(--amber)" : "var(--border-subtle)"}`,
                  background: active
                    ? "var(--amber-dim)"
                    : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 160ms ease",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                  }}
                >
                  {tile.title}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    marginTop: 3,
                  }}
                >
                  {tile.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={fieldGap}>
        <FieldLabel>Your Level</FieldLabel>
        <PillRow
          options={SENIORITY}
          selected={seniority}
          onSelect={setSeniority}
        />
      </div>
      <div style={{ marginBottom: 0 }}>
        <FieldLabel sub="(optional)">Company Style</FieldLabel>
        <StyledSelect
          value={companyStyle}
          onChange={setCompanyStyle}
          options={[
            "Generic / Any",
            "FAANG-style (depth-first)",
            "Startup (speed & pragmatism)",
            "Enterprise (compliance & scale)",
          ]}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 2 — RESUME-BASED FIELDS
═══════════════════════════════════════════════════ */
const RESUME_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack",
  "Data Engineer",
  "ML Engineer",
  "DevOps",
  "AI Engineer",
];

function ResumeFields({
  hasResumeOnFile,
  useExistingResume,
  setUseExistingResume,
  resumeFile,
  setResumeFile,
  fileInputRef,
  targetRole,
  setTargetRole,
  seniority,
  setSeniority,
  focusArea,
  setFocusArea,
}: {
  hasResumeOnFile: boolean;
  useExistingResume: boolean;
  setUseExistingResume: (v: boolean) => void;
  resumeFile: File | null;
  setResumeFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  targetRole: string | null;
  setTargetRole: (v: string) => void;
  seniority: string | null;
  setSeniority: (v: string) => void;
  focusArea: string;
  setFocusArea: (v: string) => void;
}) {
  return (
    <>
      {/* Upload / Resume on file */}
      <div style={fieldGap}>
        {hasResumeOnFile && useExistingResume ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Resume on File
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "0.82rem",
                  color: "rgba(16,185,129,0.9)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>✓</span>
                <span>Uploaded resume</span>
              </div>
            </div>
            <button
              onClick={() => {
                setUseExistingResume(false);
                setResumeFile(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--amber)",
                fontFamily: MONO,
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: 0,
                letterSpacing: "0.02em",
              }}
            >
              Use different file →
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) setResumeFile(file);
              }}
            />
            {resumeFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {resumeFile.name}
                </span>
                <button
                  onClick={() => setResumeFile(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "2px 6px",
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "1.5px dashed rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Drop your resume here
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "0.72rem",
                    color: "var(--text-dim)",
                    marginTop: 4,
                  }}
                >
                  PDF or DOCX · Max 5MB
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--amber)",
                    fontFamily: MONO,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    marginTop: 10,
                    padding: 0,
                  }}
                >
                  Browse files
                </button>
              </div>
            )}
            {hasResumeOnFile && (
              <button
                onClick={() => setUseExistingResume(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--amber)",
                  fontFamily: MONO,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  padding: 0,
                  marginTop: 8,
                }}
              >
                ← Use existing resume on file
              </button>
            )}
          </div>
        )}
      </div>

      <div style={fieldGap}>
        <FieldLabel>Target Role</FieldLabel>
        <PillRow
          options={RESUME_ROLES}
          selected={targetRole}
          onSelect={setTargetRole}
        />
      </div>
      <div style={fieldGap}>
        <FieldLabel>Your Level</FieldLabel>
        <PillRow
          options={SENIORITY}
          selected={seniority}
          onSelect={setSeniority}
        />
      </div>
      <div style={{ marginBottom: 0 }}>
        <FieldLabel sub="(optional)">Focus Area</FieldLabel>
        <PillRow
          options={["Projects", "Work Experience", "Skills & Tools", "Mixed"]}
          selected={focusArea}
          onSelect={setFocusArea}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE 2 — GITHUB REPO FIELDS
═══════════════════════════════════════════════════ */
const REPO_ROLES = [
  "Solo builder",
  "Frontend lead",
  "Backend lead",
  "Full stack",
  "Contributor",
];
const GITHUB_TARGET_ROLES = [
  {
    value: "system_design",
    label: INTERVIEW_CONFIGS.system_design.label,
  },
  {
    value: "frontend",
    label: INTERVIEW_CONFIGS.frontend.label,
  },
  {
    value: "backend",
    label: INTERVIEW_CONFIGS.backend.label,
  },
  {
    value: "fullstack",
    label: INTERVIEW_CONFIGS.fullstack.label,
  },
  {
    value: "ai_engineer",
    label: INTERVIEW_CONFIGS.ai_engineer.label,
  },
  {
    value: "devops_engineer",
    label: INTERVIEW_CONFIGS.devops_engineer.label,
  },
  {
    value: "ml_engineer",
    label: INTERVIEW_CONFIGS.ml_engineer.label,
  },
  {
    value: "data_engineer",
    label: INTERVIEW_CONFIGS.data_engineer.label,
  },
] as const;

function GitHubFields({
  repoUrl,
  setRepoUrl,
  repoUrlError,
  validateRepoUrl,
  repoRole,
  setRepoRole,
  targetRole,
  setTargetRole,
  seniority,
  setSeniority,
}: {
  repoUrl: string;
  setRepoUrl: (v: string) => void;
  repoUrlError: string | null;
  validateRepoUrl: (v: string) => void;
  repoRole: string | null;
  setRepoRole: (v: string) => void;
  targetRole: InterviewType | null;
  setTargetRole: React.Dispatch<React.SetStateAction<InterviewType | null>>;
  seniority: string | null;
  setSeniority: (v: string) => void;
}) {
  return (
    <>
      {/* Cost reminder callout */}
      <div
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 8,
          padding: "0.85rem 1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.8rem",
            color: "#f87171",
            fontWeight: 600,
          }}
        >
          This interview uses 3 credits.
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginTop: 4,
          }}
        >
          We scrape your repository, perform semantic analysis, and generate
          questions from your actual code. This takes up to 60 seconds to
          prepare.
        </div>
      </div>

      <div style={fieldGap}>
        <FieldLabel>GitHub Repo URL</FieldLabel>
        <StyledInput
          value={repoUrl}
          onChange={setRepoUrl}
          placeholder="https://github.com/username/repo"
          onBlur={() => validateRepoUrl(repoUrl)}
        />
        {repoUrlError && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: "0.72rem",
              color: "#f87171",
              marginTop: 4,
            }}
          >
            {repoUrlError}
          </div>
        )}
      </div>

      <div style={fieldGap}>
        <FieldLabel>Your Role</FieldLabel>
        <PillRow
          options={REPO_ROLES}
          selected={repoRole}
          onSelect={setRepoRole}
        />
      </div>

      <div style={fieldGap}>
        <FieldLabel>Interviewing For</FieldLabel>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {GITHUB_TARGET_ROLES.map((option) => {
            const active = targetRole === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTargetRole(option.value)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: `1px solid ${active ? "var(--amber)" : "var(--border-subtle)"}`,
                  background: active ? "var(--amber-dim)" : "transparent",
                  color: active ? "var(--amber)" : "var(--text-muted)",
                  fontFamily: MONO,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 160ms ease",
                  letterSpacing: "0.02em",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={fieldGap}>
        <FieldLabel>Your Level</FieldLabel>
        <PillRow
          options={SENIORITY}
          selected={seniority}
          onSelect={setSeniority}
        />
      </div>

      {/* Repo visibility notice */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: "0.7rem",
          color: "var(--text-dim)",
          marginBottom: 0,
        }}
      >
        We only read file contents — no write access, no forks, no stars.
      </div>
    </>
  );
}
