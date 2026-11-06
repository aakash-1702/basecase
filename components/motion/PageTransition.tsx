"use client";

import { m } from "framer-motion";
import { EASE_OUT } from "./presets";

/** Short enter transition for route changes (used by app/(main)/template.tsx). */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="min-h-full"
    >
      {children}
    </m.div>
  );
}
