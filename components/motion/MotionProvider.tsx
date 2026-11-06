"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

/**
 * App-wide motion settings:
 * - `LazyMotion` + `domAnimation` keeps the framer-motion bundle small
 * - `reducedMotion="user"` disables transforms for users who asked for it
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
