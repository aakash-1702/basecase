"use client";

import { createPortal } from "react-dom";

export interface TooltipState {
  id: string;
  x: number;
  y: number;
  h: number;
}

/** Portal tooltip shown next to an unsolved problem's status circle.
 *  Rendered at document.body so it is never clipped by overflow containers. */
export default function SolveTooltip({
  tooltip,
}: {
  tooltip: TooltipState | null;
}) {
  if (!tooltip || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[9999] -translate-y-1/2 animate-fade-in"
      style={{ left: tooltip.x + 12, top: tooltip.y + tooltip.h / 2 }}
    >
      <div className="relative whitespace-nowrap rounded-lg border border-danger/40 bg-surface-2 px-3 py-2 text-xs font-medium text-fg shadow-xl shadow-black/40">
        Open the problem &amp; solve it — progress syncs automatically!
        <span
          aria-hidden
          className="absolute right-full top-1/2 -translate-y-1/2 border-y-[6px] border-r-[6px] border-y-transparent border-r-danger/40"
        />
      </div>
    </div>,
    document.body,
  );
}
