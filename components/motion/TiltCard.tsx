"use client";

import { useRef } from "react";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Subtle 3D tilt that follows the pointer. Uses motion values (no React
 * re-renders per mousemove) and springs for a snappy, physical feel.
 */
export default function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 24, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 220, damping: 24, mass: 0.6 });
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  return (
    <div className={cn("[perspective:1200px]", className)}>
      <m.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!el || e.pointerType === "touch") return;
          const r = el.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        className="will-change-transform"
      >
        {children}
      </m.div>
    </div>
  );
}
