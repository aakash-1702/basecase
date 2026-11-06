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
      {/* Backdrop (solid tint, no backdrop-filter) */}
      <div
        className="fixed inset-0 z-50 animate-fade-in bg-scrim"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-session-title"
          className="card-base pointer-events-auto w-full max-w-sm animate-fade-up p-8"
        >
          <h2 id="end-session-title" className="font-display text-xl text-fg">
            Exit Interview?
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
            Your progress will be saved and your report will be generated.
          </p>

          <div className="mt-7 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="btn btn-outline-accent btn-sm"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? "Ending..." : "Exit & Generate Report"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
