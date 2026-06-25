"use client";

import { Badge } from "@/components/ui/badge";

const colorMap = {
  Confident: {
    bg: "rgba(34,197,94,0.15)",
    color: "var(--green, #22c55e)",
    border: "rgba(34,197,94,0.3)",
  },
  Shaky: {
    bg: "rgba(234,179,8,0.15)",
    color: "var(--yellow, #eab308)",
    border: "rgba(234,179,8,0.3)",
  },
  Forgot: {
    bg: "rgba(239,68,68,0.15)",
    color: "var(--red, #ef4444)",
    border: "rgba(239,68,68,0.3)",
  },
};

export default function ConfidenceBadge({
  confidence,
}: {
  confidence: "Confident" | "Shaky" | "Forgot" | null;
}) {
  if (!confidence) return null;
  const c = colorMap[confidence];
  return (
    <Badge
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 100,
        fontWeight: 800,
        fontSize: 11,
        textTransform: "uppercase",
        padding: "3px 10px",
        fontFamily: "Nunito, sans-serif",
        letterSpacing: 0.5,
      }}
    >
      {confidence}
    </Badge>
  );
}
