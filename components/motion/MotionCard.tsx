"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "./presets";

// Hoisted so the component identity is stable across renders (no remounts).
const MotionLink = m.create(Link);

/**
 * Card with a snappy hover lift + press feedback. Transform-only, so it never
 * triggers layout or paint on hover.
 */
export default function MotionCard({
  children,
  className,
  href,
  onClick,
  lift = 4,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  lift?: number;
}) {
  const classes = cn("card-base card-glow-top block will-change-transform", className);
  const motionProps = {
    whileHover: { y: -lift },
    whileTap: { scale: 0.985 },
    transition: SPRING_SNAPPY,
  };

  if (href) {
    return (
      <MotionLink href={href} className={classes} {...motionProps}>
        {children}
      </MotionLink>
    );
  }
  return (
    <m.div className={classes} onClick={onClick} {...motionProps}>
      {children}
    </m.div>
  );
}
