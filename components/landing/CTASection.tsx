import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";

export default function CTASection({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-surface px-6 py-20 text-center sm:px-12">
            <div className="absolute inset-0 -z-10 bg-dots mask-radial opacity-60" aria-hidden />
            <div
              className="absolute inset-x-0 bottom-0 -z-10 h-72"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 100%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
              }}
            />
            <h2 className="font-display text-4xl tracking-tight text-balance sm:text-5xl">
              Your next interview
              <br />
              <span className="text-gradient">starts here.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base text-fg-secondary">
              Every engineer you admire solved the same problems you&apos;re avoiding.
              One problem. One pattern. One step closer.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={isAuthed ? "/problems" : "/auth/sign-up"} className="btn btn-primary btn-lg">
                {isAuthed ? "Solve a problem now" : "Start solving free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/subscription" className="btn btn-ghost btn-lg">
                See pricing
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
