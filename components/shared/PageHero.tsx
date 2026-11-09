import Container from "./Container";
import { cn } from "@/lib/utils";

/**
 * Compact page-level hero used by list pages (Problems, Sheets, ...).
 * Pure CSS background: no blurred/animated layers.
 */
export default function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  chips,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  chips?: string[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-line", className)}>
      <div className="absolute inset-0 -z-10 bg-dots mask-radial opacity-60" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-64"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 70% at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <Container className="py-14 md:py-20 text-center">
        {eyebrow && (
          <span className="eyebrow justify-center">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl text-balance">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-fg-secondary sm:text-lg text-pretty">
            {description}
          </p>
        )}
        {chips && chips.length > 0 && (
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <span key={c} className="chip chip-accent px-3 py-1 text-xs">
                {c}
              </span>
            ))}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
