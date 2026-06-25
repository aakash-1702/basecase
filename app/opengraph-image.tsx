import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont() {
  const fontUrl =
    "https://raw.githubusercontent.com/google/fonts/main/ofl/sora/Sora-Bold.ttf";
  const response = await fetch(fontUrl);
  if (!response.ok) return null;
  return response.arrayBuffer();
}

export default async function Image() {
  const soraBold = await loadFont();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px",
        background: "#0f0f0f",
        color: "#f4f4f5",
        position: "relative",
        fontFamily: "Sora",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 15%, rgba(249,115,22,0.16), transparent 40%), radial-gradient(circle at 90% 90%, rgba(249,115,22,0.1), transparent 35%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 28,
            color: "#f97316",
          }}
        >
          <span>{SITE_NAME}</span>
          <span style={{ color: "#a1a1aa", fontSize: 20 }}>
            Structured Interview Prep
          </span>
        </div>
        <div
          style={{
            border: "1px solid rgba(249,115,22,0.35)",
            background: "rgba(249,115,22,0.08)",
            borderRadius: 999,
            padding: "10px 18px",
            fontSize: 18,
            color: "#fdba74",
          }}
        >
          500+ Problems
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 980,
        }}
      >
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.03,
            letterSpacing: "-0.02em",
            color: "#fafafa",
          }}
        >
          Master DSA and System Design
        </div>
        <div style={{ fontSize: 30, color: "#a1a1aa", lineHeight: 1.3 }}>
          Curated sheets, SM-2 revision, AI mock interviews, and actionable
          analytics.
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#d4d4d8",
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <span>Problems</span>
          <span>Sheets</span>
          <span>Roadmaps</span>
          <span>Interviews</span>
        </div>
        <div style={{ color: "#f97316" }}>basecase</div>
      </div>
    </div>,
    {
      ...size,
      fonts: soraBold
        ? [{ name: "Sora", data: soraBold, style: "normal", weight: 700 }]
        : [],
    },
  );
}
