"use client";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: "var(--orange, #f97316)",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 2,
        textTransform: "uppercase",
        fontFamily: "Nunito, sans-serif",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
