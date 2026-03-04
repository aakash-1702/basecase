import useScrollReveal from "@/hooks/useScrollReveal";

export default function TickerSection() {
  const ref = useScrollReveal();

  const tickerItems = [
    "🔥 500+ Problems across 20+ topics",
    "📈 Streak system that builds real habits",
    "🧩 Curated sheets for every interview track",
    "⚡ From Arrays to DP — every pattern covered",
    "🏆 Leaderboard updated in real time",
    "🎯 Problems tagged by company and difficulty",
    "📚 Editorials and hints for every problem",
    "🔁 Spaced repetition to lock in concepts",
    "💡 Pattern-first approach to problem solving",
    "🚀 Used by learners targeting FAANG and beyond",
  ];

  return (
    <div
      ref={ref}
      className="relative w-full border-t border-b border-white/[0.06] py-3 overflow-hidden"
    >
      {/* Fade masks */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none" />

      {/* Ticker content */}
      <div className="flex animate-ticker">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-10 font-[JetBrains Mono] text-xs text-neutral-500"
          >
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            {item}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-ticker {
          display: flex;
          white-space: nowrap;
          will-change: transform;
          animation: ticker 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
