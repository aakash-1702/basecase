import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/shared/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Pick a sheet",
    text: "Choose a track that matches your target — Blind 75 for a quick loop, Striver for depth.",
  },
  {
    n: "02",
    title: "Solve in the browser",
    text: "Write, run and submit against real test cases. Stuck? Ask the AI mentor for a nudge, not the answer.",
  },
  {
    n: "03",
    title: "Rate your confidence",
    text: "One click after every solve. The revision queue brings it back right before you'd forget it.",
  },
  {
    n: "04",
    title: "Interview with AI",
    text: "Run a voice mock interview, get a scored report, and fix the gaps before the real round.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="border-t border-line py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="Four steps. One compounding loop."
            align="center"
          />
        </Reveal>
        <ol className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="divider-glow absolute inset-x-[12%] top-6 hidden md:block" aria-hidden />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80} as="li" className="relative">
              <div className="relative z-10 grid h-12 w-12 place-items-center rounded-xl border border-accent/40 bg-bg font-mono text-sm font-semibold text-accent">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-lg text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
