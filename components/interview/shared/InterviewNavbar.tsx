"use client";

interface InterviewNavbarProps {
  contextLabel: string;
  creditsRemaining: number;
  onEndInterview: () => void;
}

export function InterviewNavbar({
  contextLabel,
  creditsRemaining,
  onEndInterview,
}: InterviewNavbarProps) {
  return (
    <div
      style={{
        height: 52,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#111111",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {/* ── Left: context label with git-branch icon ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Git branch icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#e5e5e5",
            letterSpacing: "0.02em",
          }}
        >
          {contextLabel}
        </span>
      </div>

      {/* ── Right: Credits + End Interview ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Credits badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 20,
            padding: "5px 14px",
          }}
        >
          {/* Coin icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "#f59e0b",
              letterSpacing: "0.04em",
              fontWeight: 500,
            }}
          >
            {creditsRemaining} Credits
          </span>
        </div>

        {/* End Interview button */}
        <button
          type="button"
          onClick={onEndInterview}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 6,
            background: "transparent",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#ef4444",
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            letterSpacing: "0.02em",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
          }}
        >
          {/* Stop icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          End Interview
        </button>
      </div>
    </div>
  );
}
