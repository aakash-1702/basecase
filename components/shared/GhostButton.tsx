"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GhostButtonProps {
  children: React.ReactNode;
  href?: string;
  style?: React.CSSProperties;
}

export default function GhostButton({
  children,
  href = "#",
  style,
}: GhostButtonProps) {
  return (
    <motion.span
      whileHover={{
        scale: 1.03,
        borderColor: "var(--orange, #f97316)",
        color: "var(--orange, #f97316)",
      }}
      whileTap={{ scale: 0.97 }}
      style={{ display: "inline-flex" }}
    >
      <Button
        asChild
        variant="outline"
        size="lg"
        style={{
          background: "transparent",
          border: "1px solid var(--border, #2d3748)",
          color: "var(--text, #e2e8f0)",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          borderRadius: 10,
          padding: "14px 32px",
          ...style,
        }}
      >
        <a href={href}>{children}</a>
      </Button>
    </motion.span>
  );
}
