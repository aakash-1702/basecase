import useScrollReveal from "@/hooks/useScrollReveal";
import Link from "next/link";

export default function HeroSection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative w-full px-5 sm:px-6 lg:px-8 pt-24 pb-20"
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.08), transparent 60%)",
        }}
      />
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mx-auto max-w-7xl flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500 text-amber-500 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          The DSA platform built different
        </div>

        {/* Heading */}
        <h1 className="font-[Syne] font-extrabold tracking-tight leading-[0.95] text-[clamp(3rem,8vw,6.5rem)] mt-6">
          <span className="text-white">Master the Patterns.</span>
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Crack Any Interview.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-zinc-400 max-w-lg text-[1.1rem] mt-6">
          Basecase is a structured DSA practice platform with curated sheets,
          pattern-based problem sets, streaks, and leaderboards — built for
          engineers who are serious about landing their dream role.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Link
            href="/sheets"
            className="group bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-lg px-8 py-3.5 text-sm hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-amber-900/30 cursor-pointer flex items-center gap-2"
          >
            Start Practicing Free
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/problems"
            className="border border-white/10 text-white rounded-lg px-8 py-3.5 text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Explore Problem Sheets
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center mt-12 divide-x divide-white/[0.06]">
          {[
            { number: "500+", label: "Handpicked Problems" },
            { number: "40+", label: "Curated Sheets" },
            { number: "20+", label: "Topic Patterns" },
            { number: "100%", label: "Free to Start" },
          ].map((stat, index) => (
            <div key={index} className="flex flex-col items-center px-6">
              <span className="font-[Syne] text-2xl text-white font-bold">
                {stat.number}
              </span>
              <span className="text-zinc-500 uppercase tracking-widest text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
