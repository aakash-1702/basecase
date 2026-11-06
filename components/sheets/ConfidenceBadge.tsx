import type { ConfidenceV2 } from "./types";

const CONFIG: Record<
  NonNullable<ConfidenceV2>,
  { label: string; className: string; icon: string }
> = {
  LOW: { label: "Low", className: "chip chip-hard", icon: "◔" },
  MEDIUM: { label: "Medium", className: "chip chip-medium", icon: "◑" },
  HIGH: { label: "High", className: "chip chip-easy", icon: "●" },
};

const UNATTEMPTED = {
  label: "Not started",
  className: "chip chip-neutral",
  icon: "○",
};

export default function ConfidenceBadge({
  confidence,
}: {
  confidence: ConfidenceV2;
}) {
  const cfg = (confidence && CONFIG[confidence]) || UNATTEMPTED;
  return (
    <span className={cfg.className}>
      <span className="text-[10px]" aria-hidden>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}
