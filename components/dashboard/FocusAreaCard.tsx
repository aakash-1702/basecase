import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import GlowCard from "@/components/shared/GlowCard";
import ProgressBar from "@/components/shared/ProgressBar";
import type { SheetProgressItem } from "@/lib/dashboard";

/** The user's weakest sheet, with a direct link to practise it. */
export default function FocusAreaCard({
  sheet,
  className,
}: {
  sheet: SheetProgressItem;
  className?: string;
}) {
  return (
    <GlowCard hover={false} className={className}>
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-danger">
        <AlertTriangle className="h-3 w-3" />
        Focus area
      </span>

      <h3 className="mt-3 font-display text-xl tracking-tight text-fg">
        {sheet.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
        Your weakest sheet — only {sheet.solved} of {sheet.total} solved. A
        focused session here will make the biggest difference.
      </p>

      <div className="mt-5 flex items-end justify-between">
        <span className="font-display text-3xl leading-none tabular-nums text-danger">
          {sheet.progress}%
        </span>
        <span className="font-mono text-xs text-fg-muted">
          {sheet.solved} / {sheet.total}
        </span>
      </div>
      <ProgressBar value={sheet.progress} color="danger" className="mt-2" />

      <Link
        href={`/sheets/${sheet.slug}`}
        className="btn btn-secondary btn-sm mt-5 w-full"
      >
        Practice {sheet.title}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </GlowCard>
  );
}
