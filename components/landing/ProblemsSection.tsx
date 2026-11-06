import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import DifficultyBadge from "@/components/shared/DifficultyBadge";
import Reveal from "@/components/shared/Reveal";
import type { LandingProblem } from "@/lib/landing";

export default function ProblemsSection({
  problems,
  total,
}: {
  problems: LandingProblem[];
  total: number;
}) {
  return (
    <section id="problems" className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Problem library"
            title="Every pattern. Learned through practice."
            description="A library built around how patterns actually show up in interviews — so solving one problem teaches you to solve ten."
          />
          <Link href="/problems" className="btn btn-outline-accent shrink-0">
            Browse all {total}+ problems <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, i) => (
            <Reveal key={p.id} delay={i * 50} className="bg-surface">
              <Link
                href={`/problems/${p.slug}`}
                className="group relative flex h-full flex-col bg-surface p-6 transition-colors hover:bg-surface-2"
              >
                <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-warning transition-transform duration-300 group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <DifficultyBadge difficulty={p.difficulty} />
                  <ArrowRight className="h-4 w-4 -translate-x-1 text-accent opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <h3 className="mt-4 font-display text-lg text-fg">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-fg-secondary">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {p.tags.map((t) => (
                      <span key={t} className="chip chip-neutral font-mono font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
