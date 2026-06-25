"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface OrangeButtonProps {
  children: React.ReactNode;
  href?: string;
  style?: React.CSSProperties;
}

export default function OrangeButton({
  children,
  href = "#",
  style,
}: OrangeButtonProps) {
  return (
    <motion.span
      whileHover={{
        scale: 1.03,
        boxShadow: "0 0 30px rgba(249,115,22,0.3)",
      }}
      whileTap={{ scale: 0.97 }}
      style={{ display: "inline-flex" }}
    >
      <Button
        asChild
        size="lg"
        style={{
          background: "var(--orange, #f97316)",
          color: "#fff",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          borderRadius: 10,
          padding: "14px 32px",
          boxShadow: "0 0 20px rgba(249,115,22,0.15)",
          border: "none",
          ...style,
        }}
      >
        <a href={href}>{children}</a>
      </Button>
    </motion.span>
  );
}
