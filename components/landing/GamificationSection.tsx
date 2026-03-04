export default function GamificationSection() {
  return (
    <section className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Tag */}
        <p className="text-amber-500 font-[JetBrains Mono] uppercase text-xs tracking-widest mb-4">
          // Stay Consistent
        </p>

        {/* Heading */}
        <h2 className="font-[Syne] font-extrabold text-3xl mb-6">
          The Best Coders Show Up Every Day.
        </h2>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-12">
          Streaks, leaderboards, and badges aren't gimmicks — they're the
          difference between learning for a week and learning for a year.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leaderboard Card */}
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-7 hover:-translate-y-0.5 transition-all">
            <h3 className="font-[Syne] font-bold text-white mb-4">
              🏆 Global Leaderboard
            </h3>
            <ul className="space-y-3">
              {["#1", "#2", "#3", "You"].map((rank, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      rank === "#1"
                        ? "text-yellow-400"
                        : rank === "#2"
                          ? "text-gray-400"
                          : rank === "#3"
                            ? "text-orange-400"
                            : "text-[#f97316]"
                    }`}
                  >
                    {rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-neutral-800/40" />
                  <span className="text-white text-sm">
                    {rank === "You" ? "You" : `User ${index + 1}`}
                  </span>
                  <span className="text-[#f97316] text-sm ml-auto">
                    {rank === "You" ? "—" : `${1000 - index * 100}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Streak Card */}
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-7 hover:-translate-y-0.5 transition-all">
            <h3 className="font-[Syne] font-bold text-white mb-4">
              🔥 Daily Streaks
            </h3>
            <div className="text-[#f97316] font-[Syne] text-5xl font-extrabold mb-2">
              21
            </div>
            <p className="text-zinc-500 text-xs mb-6">day streak</p>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 22 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-full aspect-square rounded-sm ${
                    index < 20
                      ? "bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      : index === 20
                        ? "bg-[#f97316]/20"
                        : index === 21
                          ? "border border-[#f97316]"
                          : "bg-[#1a1f2e]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-7 hover:-translate-y-0.5 transition-all">
            <h3 className="font-[Syne] font-bold text-white mb-4">
              🎖️ Collect Badges
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl ${
                    index < 3
                      ? "bg-[#f97316]/10 border border-[#f97316]/30"
                      : "bg-[#1a1f2e] border border-white/[0.06] text-white/35"
                  }`}
                >
                  {index < 3 ? "🏅" : "🔒"}
                </div>
              ))}
            </div>
            <p className="text-zinc-500 text-xs">3 / 11 badges earned</p>
          </div>
        </div>
      </div>
    </section>
  );
}
