"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface ResizableSplitProps {
  /** Fills the remaining space above the handle. */
  top: ReactNode;
  /** Fixed-height (user resizable) panel below the handle. */
  bottom: ReactNode;
  initialSize?: number;
  minSize?: number;
  /** Max bottom height as a fraction of the container. */
  maxRatio?: number;
  className?: string;
  topClassName?: string;
  bottomClassName?: string;
}

/**
 * Vertical split with a drag handle. Dragging never touches React state: the
 * pointer position is coalesced into one `requestAnimationFrame` per frame and
 * written to the `--split-size` CSS variable on the container. Pointer capture
 * keeps the listeners on the handle itself, so there is nothing to detach from
 * `document` and nothing leaks on unmount.
 */
const ResizableSplit = memo(function ResizableSplit({
  top,
  bottom,
  initialSize = 220,
  minSize = 100,
  maxRatio = 0.6,
  className,
  topClassName,
  bottomClassName,
}: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(initialSize);
  const dragRef = useRef<{ startY: number; startSize: number } | null>(null);
  const latestYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const drag = dragRef.current;
    const el = containerRef.current;
    if (!drag || !el) return;
    const max = Math.max(minSize, el.offsetHeight * maxRatio);
    const next = Math.min(
      max,
      Math.max(minSize, drag.startSize + (drag.startY - latestYRef.current)),
    );
    sizeRef.current = next;
    el.style.setProperty("--split-size", `${next}px`);
  }, [minSize, maxRatio]);

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startSize: sizeRef.current };
    latestYRef.current = e.clientY;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      latestYRef.current = e.clientY;
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  // Safety net: cancel a pending frame and restore body styles if unmounted mid-drag.
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (dragRef.current) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      style={{ "--split-size": `${initialSize}px` } as CSSProperties}
    >
      <div className={cn("min-h-0 flex-1", topClassName)}>{top}</div>

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize output panel"
        className="group flex h-2 shrink-0 cursor-row-resize touch-none items-center justify-center border-t border-line transition-colors hover:bg-accent-soft"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <span className="h-[3px] w-[3px] rounded-full bg-fg/15 transition-colors group-hover:bg-accent/60" />
      </div>

      <div
        className={cn("flex shrink-0 flex-col overflow-hidden", bottomClassName)}
        style={{ height: "var(--split-size)" }}
      >
        {bottom}
      </div>
    </div>
  );
});

export default ResizableSplit;
