"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, VIEWPORT_ONCE } from "./presets";

/** Parent that reveals its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.06,
  delay = 0,
  as = "div",
  inView = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol" | "section";
  inView?: boolean;
}) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: VIEWPORT_ONCE } : { animate: "show" })}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span";
}) {
  const Comp = m[as];
  return (
    <Comp className={cn(className)} variants={fadeUp}>
      {children}
    </Comp>
  );
}
