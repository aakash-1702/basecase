"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT, VIEWPORT_ONCE } from "@/components/motion/presets";

/**
 * Reveals children once when they enter the viewport (framer-motion
 * `whileInView`, observed once, transform + opacity only).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  y = 18,
}: {
  children: React.ReactNode;
  className?: string;
  /** milliseconds */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  y?: number;
}) {
  const Comp = m[as];
  return (
    <Comp
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: delay / 1000 }}
    >
      {children}
    </Comp>
  );
}
