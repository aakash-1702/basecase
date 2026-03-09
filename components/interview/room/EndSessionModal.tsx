"use client";

import { useEffect } from "react";

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
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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
        onClick={onClose}
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
            End this session?
          </h2>

          {/* Body */}
          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#525252",
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            Your progress so far will not be saved.
            <br />
            You won't receive a feedback report for an incomplete session.
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: "#525252",
                background: "transparent",
                border: "none",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "12px",
                color: "#f87171",
                background: "transparent",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: "4px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
