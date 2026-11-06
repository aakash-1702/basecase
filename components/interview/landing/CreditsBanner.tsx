import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRenewalDate } from "./utils";

export function CreditsBanner({
  premium,
  credits,
  expiresAt,
}: {
  premium: boolean;
  credits: number;
  expiresAt: string | null;
}) {
  const hasCredits = credits > 0;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className={cn("chip uppercase tracking-[0.12em]", premium ? "chip-accent" : "chip-neutral")}>
        {premium && <Crown className="h-3 w-3" />}
        {premium ? "Premium" : "Free"}
      </span>

      <span
        className={cn(
          "chip",
          hasCredits
            ? "border-success/30 bg-success/10 text-success"
            : "border-danger/30 bg-danger/10 text-danger",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", hasCredits ? "bg-success" : "bg-danger")} />
        {credits} interview{credits !== 1 ? "s" : ""} remaining
      </span>

      {premium && expiresAt && (
        <span className="hidden font-mono text-[11px] text-fg-muted sm:inline">
          Renews {formatRenewalDate(expiresAt)}
        </span>
      )}
    </div>
  );
}
