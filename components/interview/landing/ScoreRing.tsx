import { memo } from "react";
import { scoreTone } from "./utils";

function ScoreRingBase({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(10, score));
  const offset = circumference - (clamped / 10) * circumference;
  const c = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-hidden
    >
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={2.5} />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={scoreTone(score)}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${c} ${c})`}
      />
      <text
        x={c}
        y={c}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-fg font-mono font-semibold"
        fontSize={size * 0.28}
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

export const ScoreRing = memo(ScoreRingBase);
