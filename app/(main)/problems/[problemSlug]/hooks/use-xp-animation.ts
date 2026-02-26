"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Encapsulates XP display, solve-flash, and XP-popup animation state.
 * Cleans up timeouts on unmount.
 */
export function useXPAnimation(initialXP: number) {
  const [localXP, setLocalXP] = useState(initialXP);
  const [xpPop, setXpPop] = useState(false);
  const [solveFlash, setSolveFlash] = useState(false);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (xpTimer.current) clearTimeout(xpTimer.current);
    };
  }, []);

  const triggerXPGain = useCallback((amount: number) => {
    setLocalXP((x) => x + amount);

    setSolveFlash(true);
    flashTimer.current = setTimeout(() => setSolveFlash(false), 800);

    setXpPop(true);
    xpTimer.current = setTimeout(() => setXpPop(false), 1100);
  }, []);

  return { localXP, xpPop, solveFlash, triggerXPGain } as const;
}
