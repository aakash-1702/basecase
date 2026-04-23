"use client";

import { useEffect, useRef } from "react";

/**
 * Prevents accidental navigation (tab close, back button, link click)
 * while the interview is active. Shows the browser's built-in
 * "Leave site?" confirmation for tab/window close, and intercepts
 * the back button via `popstate` — calling `onBackAttempt` instead.
 *
 * @param isActive   – pass `true` while the interview session is running
 * @param onBackAttempt – callback when user attempts to navigate back
 */
export function useBlockNavigation(
  isActive: boolean,
  onBackAttempt: () => void,
) {
  const onBackAttemptRef = useRef(onBackAttempt);
  onBackAttemptRef.current = onBackAttempt;

  useEffect(() => {
    if (!isActive) return;

    /* ---- Tab / window close ---- */
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    /* ---- Back button ---- */
    // Push a dummy history entry so the first "back" press pops it
    // instead of actually navigating away.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Re-push so repeated back presses keep getting intercepted
      window.history.pushState(null, "", window.location.href);
      onBackAttemptRef.current();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isActive]);
}
