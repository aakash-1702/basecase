import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/shared/Reveal";

const QUOTES = [
  {
    quote:
      "The revision queue is the feature I didn't know I needed. Problems I'd forgotten came back right on time.",
    name: "Priya S.",
    role: "SDE-2 · Fintech",
  },
  {
    quote:
      "Did 30 AI mock interviews before my loop. The follow-up questions were brutal in the best way.",
    name: "Rahul M.",
    role: "Backend Engineer",
  },
  {
    quote:
      "Finished Blind 75 in six weeks with the streak system. First time I've stuck with anything this long.",
    name: "Ananya K.",
    role: "Final-year student",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="From the community"
            title="Thousands of engineers. One goal."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 70} className="h-full">
              <figure className="card-base card-hover flex h-full flex-col p-6">
                <span className="font-display text-4xl leading-none text-accent">“</span>
                <blockquote className="mt-2 text-sm leading-relaxed text-fg-secondary">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-6">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent">
                    {q.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-fg">{q.name}</p>
                    <p className="text-xs text-fg-muted">{q.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
