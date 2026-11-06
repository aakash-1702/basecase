import { cn } from "@/lib/utils";

/** Labelled block on the landing page: eyebrow + meta on the right + hairline. */
export function InterviewListSection({
  title,
  meta,
  live = false,
  className,
  children,
}: {
  title: string;
  meta?: string;
  /** Shows a softly pulsing dot next to the title (pending / processing). */
  live?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("pb-14", className)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="eyebrow">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-accent", live && "animate-pulse")} />
          {title}
        </span>
        {meta && <span className="font-mono text-[11px] text-fg-muted">{meta}</span>}
      </div>
      <div className="mb-6 h-px bg-line" />
      {children}
    </section>
  );
}
