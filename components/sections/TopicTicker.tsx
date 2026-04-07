"use client";

import { TOPICS } from "@/lib/constants";

export default function TopicTicker() {
  const items = [...TOPICS, ...TOPICS];

  return (
    <section
      className="bc-ticker-wrap"
      style={{
        borderTop: "1px solid var(--border, #2d3748)",
        borderBottom: "1px solid var(--border, #2d3748)",
        padding: "16px 0",
        overflow: "hidden",
      }}
    >
      <div className="bc-ticker-container" style={{ display: "flex", width: "max-content" }}>
        {items.map((topic, i) => (
          <span
            key={`${topic}-${i}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "0 24px",
              borderRight: "1px solid var(--border, #2d3748)",
              fontFamily: "Fira Code, monospace",
              fontWeight: 800,
              fontSize: 13,
              color: "var(--text-muted, #94a3b8)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--orange, #f97316)", fontSize: 8 }}>{"\u25CF"}</span>
            {topic}
          </span>
        ))}
      </div>
    </section>
  );
}
