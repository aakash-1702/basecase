import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/shared/Reveal";
import type { LandingSheet } from "@/lib/landing";

const TRACKS = [
  { title: "Arrays & Hashing", blurb: "Two pointers, sliding window, prefix sums.", tag: "Essential", count: 45, tone: "info" },
  { title: "Dynamic Programming", blurb: "1D → 2D, memoization, tabulation, state machines.", tag: "Interview favourite", count: 52, tone: "accent" },
  { title: "Graphs & Trees", blurb: "BFS, DFS, Dijkstra, union-find, topological sort.", tag: "Advanced", count: 48, tone: "success" },
] as const;

const TONE: Record<string, string> = {
  info: "text-info bg-info/10 border-info/30",
  accent: "text-accent-hover bg-accent-soft border-accent/30",
  success: "text-success bg-success/10 border-success/30",
};

export default function SheetsSection({
  sheets,
  total,
}: {
  sheets: LandingSheet[];
  total: number;
}) {
  return (
    <section id="sheets" className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Curated sheets"
            title="Stop grinding randomly. Follow a proven path."
            description="Every sheet is a complete learning track — ordered by concept, difficulty-ramped, and built around how interviews actually test you."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sheets.map((s, i) => (
            <Reveal key={s.id} delay={i * 60} className="h-full">
              <Link
                href={`/sheets/${s.slug}`}
                className="card-base card-hover card-glow-top group flex h-full flex-col p-6"
              >
                <span className="card-icon grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Layers className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-4 font-display text-lg text-fg group-hover:text-accent-hover">
                  {s.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-fg-secondary">{s.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5 font-mono text-xs text-fg-muted">
                  <span>{s.problemCount} problems</span>
                  <ArrowRight className="card-arrow h-4 w-4 text-accent" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14" delay={100}>
          <p className="eyebrow mb-5">
            <span className="h-1 w-1 rounded-full bg-accent" /> Most popular tracks
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TRACKS.map((t) => (
              <Link
                key={t.title}
                href="/sheets"
                className="card-base card-hover group flex flex-col p-6"
              >
                <span className={`chip self-start border ${TONE[t.tone]}`}>{t.tag}</span>
                <h3 className="mt-4 font-display text-lg text-fg">{t.title}</h3>
                <p className="mt-1.5 text-sm text-fg-secondary">{t.blurb}</p>
                <div className="mt-5 flex items-center justify-between font-mono text-xs text-fg-muted">
                  <span>{t.count} problems</span>
                  <span className="card-arrow text-accent">
                    Start →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 text-center">
          <Link href="/sheets" className="btn btn-outline-accent">
            View all {total}+ sheets <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
