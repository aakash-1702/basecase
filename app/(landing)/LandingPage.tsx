// app/page.tsx

"use client";

import HeroSection from "@/components/landing/HeroSection";
import TickerSection from "@/components/landing/TickerSection";
import ProblemsSection from "@/components/landing/ProblemsSection";
import SheetsSection from "@/components/landing/SheetsSection";
import EditorSection from "@/components/landing/EditorSection";
import GamificationSection from "@/components/landing/GamificationSection";
import ActivitySection from "@/components/landing/ActivitySection";
import UserNavbar from "@/components/UserNavbar";
import { useSession } from "@/lib/auth-client";
import { ArrowRight, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <UserNavbar session={session} />

      <div className="pt-16">
        <HeroSection />
        <TickerSection />
        <ProblemsSection />
        <SheetsSection />
        <EditorSection />
        <GamificationSection />
        <ActivitySection />

        {/* 
        AI MENTOR VIDEO SECTION
        */}
        <section className="py-20 md:py-28 border-t border-neutral-800/40 bg-neutral-950 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Floating orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/3 rounded-full blur-3xl" />

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-12">
              <p className="text-amber-500 font-mono uppercase text-xs tracking-widest mb-4 animate-fade-in">
                // AI-Powered Learning
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                Meet Your{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  AI Mentor
                </span>
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Get personalized guidance, instant code reviews, and
                step-by-step explanations tailored to your learning style.
              </p>
            </div>

            {/* Video Container */}
            <div className="relative max-w-4xl mx-auto group">
              {/* Glow effect behind video */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Animated border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/50 via-orange-500/50 to-amber-500/50 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Video wrapper */}
              <div className="relative bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
                {/* Video element */}
                <video
                  className="w-full aspect-video object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/hero/dashboard.jpg"
                >
                  <source src="/hero/ai-mentor.mp4" type="video/mp4" />
                </video>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Bottom caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-amber-400 text-sm font-medium">
                        AI Mentor Active
                      </span>
                    </div>
                    <span className="text-neutral-500 text-sm">
                      Available 24/7 to help you grow
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating feature badges */}
              <div className="absolute -left-4 top-1/4 transform -translate-x-full hidden lg:block animate-float">
                <div className="bg-neutral-900/90 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                  <p className="text-amber-400 font-semibold text-sm">
                    Instant Feedback
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Real-time code analysis
                  </p>
                </div>
              </div>

              <div className="absolute -right-4 top-1/3 transform translate-x-full hidden lg:block animate-float delay-500">
                <div className="bg-neutral-900/90 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                  <p className="text-amber-400 font-semibold text-sm">
                    Smart Hints
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Guided problem solving
                  </p>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 transform translate-x-full hidden lg:block animate-float delay-1000">
                <div className="bg-neutral-900/90 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                  <p className="text-amber-400 font-semibold text-sm">
                    Pattern Recognition
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Learn underlying concepts
                  </p>
                </div>
              </div>
            </div>

            {/* CTA below video */}
            <div className="text-center mt-10">
              <Link
                href="/interview"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-900/30 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                Try AI Mentor Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* 
        BIG CALL TO ACTION
        */}
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
              <Link
                href="/sheets"
                className="group inline-flex items-center justify-center h-14 px-10 text-lg font-semibold rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/problems"
                className="inline-flex items-center justify-center h-14 px-10 text-lg font-medium rounded-lg border border-amber-600/60 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 hover:border-amber-500/80 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Explore Problems First
              </Link>
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
                  Level up your DSA skills with curated problems, sheets, and
                  live contests — built for coders targeting top companies.
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
                      href="/dashboard"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Dashboard
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
                    href="https://github.com/aakash-1702"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-amber-400 hover:scale-110 transition-all duration-300 cursor-pointer"
                    aria-label="GitHub"
                  >
                    <Github className="h-6 w-6" />
                  </a>
                  <a
                    href="https://x.com/im_aakash49"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-amber-400 hover:scale-110 transition-all duration-300 cursor-pointer"
                    aria-label="Twitter/X"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/aakash49/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-amber-400 hover:scale-110 transition-all duration-300 cursor-pointer"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>

                <p className="mt-6 text-sm text-neutral-500">
                  Follow for updates, tips, and new sheets!
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
