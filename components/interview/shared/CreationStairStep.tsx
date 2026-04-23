"use client";

export type CreationStepState = "pending" | "active" | "completed";

interface CreationStairStepProps {
  index: number;
  label: string;
  state: CreationStepState;
}

export function CreationStairStep({
  index,
  label,
  state,
}: CreationStairStepProps) {
  const isPending = state === "pending";
  const isActive = state === "active";
  const isCompleted = state === "completed";

  return (
    <div
      style={{ marginLeft: index * 32 }}
      className={[
        "relative overflow-hidden min-w-[320px] rounded-xl px-5 py-4 flex items-center gap-4 transition-all duration-300",
        isPending ? "bg-zinc-900 border border-zinc-800" : "",
        isActive
          ? "bg-zinc-900 border-l-2 border-indigo-500 border-t border-r border-b border-zinc-800/60"
          : "",
        isCompleted
          ? "bg-zinc-900 border-l-2 border-emerald-600 border-t border-r border-b border-zinc-800/60"
          : "",
        isActive
          ? "[animation:ghv2SpringIn_350ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
          : "",
      ].join(" ")}
    >
      {isActive && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{ animation: "ghv2ShimmerSweep 1.8s linear infinite" }}
        />
      )}

      {isCompleted && (
        <div className="pointer-events-none absolute inset-0 bg-emerald-500/5 rounded-xl" />
      )}

      <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
        {isPending && <span className="w-3 h-3 rounded-full border border-zinc-600" />}

        {isActive && (
          <>
            <span
              className="absolute inset-0 rounded-full bg-indigo-400/30"
              style={{ animation: "ghv2PingRing 1s ease-out infinite" }}
            />
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </>
        )}

        {isCompleted && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10 L8 14 L16 6"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24"
              strokeDashoffset="24"
              style={{ animation: "ghv2CheckDraw 300ms ease forwards" }}
            />
          </svg>
        )}
      </div>

      <span
        className={[
          "text-sm font-medium leading-snug relative z-10 transition-colors duration-300",
          isPending ? "text-zinc-600" : "",
          isActive ? "text-white" : "",
          isCompleted ? "text-zinc-300" : "",
        ].join(" ")}
      >
        <span className="text-xs uppercase tracking-widest mr-2 opacity-50">
          {String(index + 1).padStart(2, "0")}
        </span>
        {label}
      </span>
    </div>
  );
}
