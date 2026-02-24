// app/page.tsx

'use client';

import Hero from "@/components/Hero"; // ← the Hero we just made (or inline it here)

import { Button } from "@/components/ui/button";
import UserNavbar from "@/components/UserNavbar";
import {
  ArrowRight,
  Code2,
  Github,
  Twitter,
  Linkedin,
  Users,
  LayoutGrid,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (

    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Your layout already includes <UserNavbar /> and main wrapper */}
      {/* So we just put content here */}
      <UserNavbar />

      <Hero />

      {/* ── FEATURES / WHY SECTION ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-neutral-800/40 bg-neutral-950/80">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Why <span className="text-amber-500">BaseCase</span>?
            </h2>
            <p className="mt-4 text-lg text-neutral-400 max-w-3xl mx-auto">
              Built for serious coders who want structured learning, real
              contest pressure, and fast progress toward top-tier interviews.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: LayoutGrid,
                title: "Curated Sheets",
                desc: "Topic-wise, company-wise, difficulty-wise — handpicked & updated regularly.",
              },
              {
                icon: Trophy,
                title: "Live Contests",
                desc: "Weekly & daily battles with global ranking, ratings, and virtual participation.",
              },
              {
                icon: Code2,
                title: "Quality Problems",
                desc: "From beginner to expert — strong test cases, editorials, and discussion forums.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-8 backdrop-blur-sm transition-all duration-300 hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-900/20 hover:-translate-y-1"
              >
                <feature.icon className="h-10 w-10 text-amber-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BIG CALL TO ACTION ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Subtle linear background */}
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950 via-amber-950/10 to-neutral-950 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Ready to <span className="text-amber-500">Crack</span> Your Dream
            Job?
          </h2>

          <p className="text-xl md:text-2xl text-neutral-300 mb-10 max-w-3xl mx-auto">
            Join thousands of coders already using BaseCase to level up daily
            and land offers at top tech companies.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-900/30 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              asChild
            >
              <Link href="/sheets">
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 text-lg border-amber-600/60 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition-all duration-300"
              asChild
            >
              <Link href="/problems">Explore Problems First</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-800/60 bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">
            {/* Column 1 */}
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-5">
                BaseCase
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Level up your DSA skills with curated problems, sheets, and live
                contests — built for coders targeting top companies.
              </p>
              <p className="text-xs text-neutral-500">
                © {new Date().getFullYear()} BaseCase. All rights reserved.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-base font-medium mb-5">Platform</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link
                    href="/problems"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Problems
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sheets"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Sheets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Interview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/editor"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Online Editor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-base font-medium mb-5">Resources</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roadmap"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Learning Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-amber-400 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-amber-400 transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Socials */}
            <div>
              <h4 className="text-base font-medium mb-5">Connect</h4>
              <div className="flex gap-5">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>

              <p className="mt-6 text-sm text-neutral-500">
                Follow us for updates, tips, and new sheets!
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
