import Marquee from "@/components/shared/Marquee";

const ITEMS = [
  "500+ problems across 20+ topics",
  "Streaks that build real habits",
  "Curated sheets for every interview track",
  "Arrays → Graphs → DP, every pattern covered",
  "Spaced-repetition revision queue",
  "AI mock interviews with voice",
  "Problems tagged by company & difficulty",
  "In-browser editor, instant verdicts",
];

export default function TickerSection() {
  return (
    <div className="border-y border-line py-3">
      <Marquee
        speed={45}
        items={ITEMS.map((text) => (
          <span key={text} className="flex items-center gap-3 font-mono text-xs text-fg-muted">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {text}
          </span>
        ))}
      />
    </div>
  );
}
