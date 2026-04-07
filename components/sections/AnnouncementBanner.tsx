"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AnnouncementBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bc-shimmer-banner"
      style={{
        width: "100%",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background:
          "linear-gradient(90deg, #ea580c, #f97316, #fb923c, #f97316, #ea580c)",
        backgroundSize: "200% auto",
      }}
    >
      <Badge
        style={{
          background: "#fff",
          color: "var(--orange, #f97316)",
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          fontSize: 11,
          padding: "3px 10px",
          borderRadius: 100,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          border: "none",
        }}
      >
        NEW
      </Badge>
      <span
        style={{
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: "#fff",
          textAlign: "center",
        }}
      >
        AI Roadmap Generator is now live {"\u2014"} powered by Gemini
      </span>
    </motion.div>
  );
}
