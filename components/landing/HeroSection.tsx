import Link from "next/link";
import { ArrowRight, Cpu, Mic, CalendarClock } from "lucide-react";
import Container from "@/components/shared/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import CountUp from "@/components/motion/CountUp";
import FeatureShowcase from "./FeatureShowcase";
import HeroSceneLazy from "./HeroSceneLazy";

export default function HeroSection({
  stats,
  isAuthed,
}: {
  stats: { problems: number; sheets: number; users: number };
  isAuthed: boolean;
}) {
  const primaryHref = isAuthed ? "/dashboard" : "/auth/sign-up";

  return (
    <section className="relative overflow-hidden pt-14 pb-14 sm:pt-20 sm:pb-20">
      {/* background: static grid + three.js particle field on the right */}
      <div className="absolute inset-0 -z-20 bg-grid mask-radial opacity-60" aria-hidden />
      <div
        className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] mask-radial opacity-80 lg:block"
        aria-hidden
      >
        <HeroSceneLazy className="h-full w-full" />
      </div>
      <div className="spotlight -z-10" aria-hidden />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
          {/* copy */}
          <Stagger inView={false} stagger={0.08} delay={0.05} className="flex min-w-0 flex-col">
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip chip-accent">
                  <Cpu className="h-3 w-3" /> Self-hosted Judge0
                </span>
                <span className="chip chip-neutral">
                  <Mic className="h-3 w-3" /> Voice AI interviews
                </span>
                <span className="chip chip-neutral">
                  <CalendarClock className="h-3 w-3" /> SM-2 revision
                </span>
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-6 font-display text-[2.75rem] leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[4rem]">
                Solve. Get judged.
                <br />
                Get interviewed.
                <br />
                <span className="text-gradient">Remember all of it.</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-secondary sm:text-lg text-pretty">
                BaseCase runs your code on a self-hosted Judge0, schedules
                revisions with SM-2, and puts you in front of a voice AI
                interviewer that asks follow-ups. Curated sheets decide what you
                solve next.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link href={primaryHref} className="btn btn-primary btn-lg">
                  {isAuthed ? "Open dashboard" : "Start solving — it's free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sheets" className="btn btn-secondary btn-lg">
                  Browse sheets
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-fg-muted">
                <div>
                  <dt className="sr-only">Problems</dt>
                  <dd>
                    <CountUp value={stats.problems} suffix="+" className="text-base font-semibold text-fg" />{" "}
                    problems
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Sheets</dt>
                  <dd>
                    <CountUp value={stats.sheets} className="text-base font-semibold text-fg" /> curated
                    sheets
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Engineers</dt>
                  <dd>
                    <CountUp value={stats.users} suffix="+" className="text-base font-semibold text-fg" />{" "}
                    engineers
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Pricing</dt>
                  <dd>
                    <span className="text-base font-semibold text-accent">₹0</span> to start
                  </dd>
                </div>
              </dl>
            </StaggerItem>
          </Stagger>

          {/* product demo */}
          <Stagger inView={false} delay={0.3} className="relative">
            <StaggerItem>
              <FeatureShowcase />
            </StaggerItem>
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
