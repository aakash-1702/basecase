import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ProblemPayload = {
  title?: string;
  difficulty?: string;
  tags?: string[];
};

async function loadFont() {
  const fontUrl =
    "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-SemiBold.ttf";
  const response = await fetch(fontUrl);
  if (!response.ok) return null;
  return response.arrayBuffer();
}

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getProblemMeta(problemSlug: string): Promise<ProblemPayload> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("x-forwarded-host") || h.get("host");
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    return { title: slugToTitle(problemSlug) };
  }

  try {
    const response = await fetch(
      `${origin}/api/problems/${problemSlug}/problem`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return { title: slugToTitle(problemSlug) };
    }

    const json = await response.json();
    const problem = json?.data?.problem;
    return {
      title: problem?.title || slugToTitle(problemSlug),
      difficulty: problem?.difficulty,
      tags: Array.isArray(problem?.tags) ? problem.tags.slice(0, 3) : [],
    };
  } catch {
    return { title: slugToTitle(problemSlug) };
  }
}

function difficultyColor(difficulty?: string) {
  const key = (difficulty || "").toLowerCase();
  if (key === "easy") return "#10b981";
  if (key === "medium") return "#f59e0b";
  if (key === "hard") return "#ef4444";
  return "#a1a1aa";
}

export default async function Image({
  params,
}: {
  params: Promise<{ problemSlug: string }>;
}) {
  const { problemSlug } = await params;
  const problem = await getProblemMeta(problemSlug);
  const mono = await loadFont();
  const difficulty = problem.difficulty || "Problem";

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
        fontFamily: "IBM Plex Mono",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 10% 20%, rgba(249,115,22,0.18), transparent 36%), radial-gradient(circle at 90% 90%, rgba(249,115,22,0.12), transparent 34%)",
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
        <div style={{ fontSize: 26, color: "#f97316" }}>BaseCase Problems</div>
        <div
          style={{
            border: `1px solid ${difficultyColor(difficulty)}66`,
            background: `${difficultyColor(difficulty)}1a`,
            borderRadius: 999,
            padding: "9px 16px",
            fontSize: 20,
            color: difficultyColor(difficulty),
          }}
        >
          {difficulty}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 1020,
        }}
      >
        <div
          style={{
            fontSize: 64,
            lineHeight: 1.07,
            letterSpacing: "-0.02em",
            color: "#fafafa",
          }}
        >
          {problem.title || slugToTitle(problemSlug)}
        </div>
        <div style={{ fontSize: 26, color: "#a1a1aa" }}>
          Practice this problem with editor, hints, AI mentor, and test runner.
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {(problem.tags || []).map((tag) => (
            <div
              key={tag}
              style={{
                border: "1px solid rgba(161,161,170,0.35)",
                background: "rgba(24,24,27,0.7)",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 18,
                color: "#d4d4d8",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 22, color: "#f97316" }}>
          basecase / problems / {problemSlug}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: mono
        ? [
            {
              name: "IBM Plex Mono",
              data: mono,
              style: "normal",
              weight: 600,
            },
          ]
        : [],
    },
  );
}
