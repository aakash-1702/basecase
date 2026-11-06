import type { Transition, Variants } from "framer-motion";

/** Snappy easing used everywhere: fast start, soft landing. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 260, damping: 28 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: SPRING_SNAPPY },
};

export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const VIEWPORT_ONCE = { once: true, margin: "0px 0px -10% 0px" } as const;
