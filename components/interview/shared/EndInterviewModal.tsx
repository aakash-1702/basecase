"use client";

import { useState } from "react";

interface EndInterviewModalProps {
  isOpen: boolean;
  interviewId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function EndInterviewModal({
  isOpen,
  interviewId,
  onClose,
  onConfirm,
}: EndInterviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/interview/${interviewId}/end-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.message || "Failed to end interview. Please retry.");
        setIsLoading(false);
        return;
      }

      // Delegate navigation/state change to parent
      onConfirm();
    } catch {
      setError("Something went wrong. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "32px 28px 24px",
          position: "relative",
          animation: "ghSlideUp 200ms ease-out both",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#525252",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#a3a3a3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#525252";
          }}
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Warning icon */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "18px",
            fontWeight: 600,
            color: "#f5f5f5",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          End Interview?
        </h2>

        {/* Body */}
        <p
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "13px",
            color: "#71717a",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          This will permanently end your session. This action cannot be undone.
        </p>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: "#ef4444",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a3a3a3",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.4 : 1,
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              background: isLoading ? "#7f1d1d" : "#ef4444",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#dc2626";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#ef4444";
            }}
          >
            {isLoading ? "Ending..." : "Confirm End"}
          </button>
        </div>
      </div>
    </div>
  );
}
