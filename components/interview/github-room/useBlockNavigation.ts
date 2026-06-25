"use client";

import { useEffect } from "react";

/**
 * Blocks navigation (tab close + browser back) while interview is active.
 * On tab close: fires a sendBeacon with Blob so Next.js req.json() works.
 * On browser back: calls onShowModal instead of navigating.
 */
export function useBlockNavigation(
  interviewId: string,
  isActive: boolean,
  onShowModal: () => void
) {
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // MUST use Blob — raw string sends as text/plain, req.json() rejects it
      navigator.sendBeacon(
        "/api/interview/end",
        new Blob([JSON.stringify({ interviewId })], {
          type: "application/json",
        })
      );
      return (e.returnValue = "");
    };

    // Push a dummy state so the back button doesn't immediately navigate
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      // Re-push so repeated back presses keep showing the modal
      window.history.pushState(null, "", window.location.href);
      onShowModal();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [interviewId, isActive, onShowModal]);
}
