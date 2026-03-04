"use client";

import { useEffect, useState } from "react";

export default function ActivitySection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="bg-neutral-900/40 border-t border-b border-neutral-800/60 py-20">
          <div className="max-w-[1100px] mx-auto text-center">
            {/* Heading */}
            <h2 className="font-[Syne] font-extrabold text-3xl mb-12">
              Thousands of Learners. One Goal.
            </h2>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎯",
                  title: "Pattern-First Learning",
                  description:
                    "Every problem is tagged to a core pattern so you build transferable skills, not just solutions.",
                },
                {
                  icon: "📋",
                  title: "40+ Interview Sheets",
                  description:
                    "Sheets organized by topic, company track, and difficulty level — so you always know what to practice next.",
                },
                {
                  icon: "🔥",
                  title: "Daily Streak System",
                  description:
                    "Consistency beats intensity. Our streak system keeps you showing up even on the hard days.",
                },
                {
                  icon: "🏆",
                  title: "Global Leaderboard",
                  description:
                    "See where you stand among thousands of learners. Compete, climb, and stay motivated.",
                },
                {
                  icon: "💡",
                  title: "Hints & Editorials",
                  description:
                    "Stuck? Get a nudge without spoiling the solution. Learn the thought process, not just the answer.",
                },
                {
                  icon: "⚡",
                  title: "Instant Feedback",
                  description:
                    "Submit your solution and get results in milliseconds. No waiting, no friction.",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-7 hover:border-amber-700/50 hover:shadow-amber-900/20 hover:-translate-y-1 transition-all"
                >
                  <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 text-2xl">
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
