"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EndSessionModal({
  isOpen,
  onClose,
  onConfirm,
}: EndSessionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isLoading]);

  const handleConfirmClick = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
        }}
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
            padding: "32px",
            maxWidth: "400px",
            width: "100%",
            animation: "fadeSlideUp 200ms ease",
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: "20px",
              color: "#f0f0f0",
              marginBottom: "16px",
            }}
          >
            Exit Interview?
          </h2>

          {/* Body */}
          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#a8a8a8",
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            Your progress will be saved and your report will be generated.
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: isLoading ? "#525252" : "#a8a8a8",
                background: "transparent",
                border: "none",
                padding: "8px 16px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="flex items-center gap-2"
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: isLoading ? "#a8a8a8" : "#f59e0b",
                background: "transparent",
                border: isLoading
                  ? "1px solid rgba(168,168,168,0.2)"
                  : "1px solid rgba(245,158,11,0.3)",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {isLoading ? "Ending..." : "Exit & Generate Report"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
