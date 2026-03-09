"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  interviewId: string;
}

export function ExitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  interviewId,
}: ExitConfirmModalProps) {
  const [isEnding, setIsEnding] = useState(false);

  if (!isOpen) return null;

  const handleEndSession = async () => {
    setIsEnding(true);
    try {
      await onConfirm();
    } catch {
      setIsEnding(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0, 0, 0, 0.8)" }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-xl p-6"
          style={{
            background: "#0c0c0c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
            animation: "fadeSlideUp 0.2s ease",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <LogOut className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className="text-center text-lg mb-3"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
            }}
          >
            End your interview session?
          </h2>

          {/* Body */}
          <p
            className="text-center text-sm leading-relaxed mb-6"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            If you leave now, your session will be marked as ended. Your
            transcript will be saved and a performance report will be generated
            for you — this may take a few minutes.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Keep Going */}
            <button
              onClick={onClose}
              disabled={isEnding}
              className="flex-1 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-50"
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                fontFamily: "var(--font-dm-mono)",
              }}
              onMouseEnter={(e) => {
                if (!isEnding) {
                  (e.target as HTMLButtonElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                  (e.target as HTMLButtonElement).style.color =
                    "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.1)";
                (e.target as HTMLButtonElement).style.color =
                  "var(--text-muted)";
              }}
            >
              Keep Going
            </button>

            {/* End Session */}
            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex-1 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-70"
              style={{
                background: "rgba(244,63,94,0.15)",
                color: "#f43f5e",
                border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: "6px",
                fontFamily: "var(--font-dm-mono)",
              }}
              onMouseEnter={(e) => {
                if (!isEnding) {
                  (e.target as HTMLButtonElement).style.background =
                    "rgba(244,63,94,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(244,63,94,0.15)";
              }}
            >
              {isEnding ? "Ending..." : "End Session"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
