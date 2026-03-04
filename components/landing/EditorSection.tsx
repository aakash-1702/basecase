export default function EditorSection() {
  return (
    <section className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left Column */}
          <div>
            {/* Section Tag */}
            <p className="text-amber-500 font-[JetBrains Mono] uppercase text-xs tracking-widest mb-4">
              // AI Interview Practice
            </p>

            {/* Heading */}
            <h2 className="font-[Syne] font-extrabold text-3xl mb-6">
              Practice Like It's the Real Thing.
            </h2>

            {/* Description */}
            <p className="text-zinc-400 text-sm mb-6">
              Our AI interviewer simulates real technical interviews — asking
              follow-ups, testing edge cases, and giving you instant feedback on
              your approach.
            </p>

            {/* Feature Bullets */}
            <ul className="space-y-4">
              {[
                { icon: "🎯", text: "Adaptive questions based on your level" },
                { icon: "💬", text: "Real-time AI feedback on your solutions" },
                { icon: "📝", text: "Detailed post-interview analysis" },
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-xl">{feature.icon}</span>
                  <p className="text-neutral-500 text-sm">{feature.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Interview Preview Card */}
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl overflow-hidden">
            {/* Topbar */}
            <div className="bg-neutral-900 border-b border-neutral-800/60 flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-[JetBrains Mono] text-neutral-500 text-xs">
                Mock Interview Session
              </span>
              <span className="bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            {/* Chat Body */}
            <div className="p-6 space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm flex-shrink-0">
                  AI
                </div>
                <div className="bg-neutral-800/60 rounded-xl rounded-tl-none p-4 max-w-[85%]">
                  <p className="text-neutral-300 text-sm">
                    Let's start with a classic. Given an array of integers, find
                    two numbers such that they add up to a target. What's your
                    approach?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl rounded-tr-none p-4 max-w-[85%]">
                  <p className="text-neutral-300 text-sm">
                    I'd use a hash map to store values as I iterate. For each
                    number, I check if the complement exists...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 text-sm flex-shrink-0">
                  U
                </div>
              </div>

              {/* AI Follow-up */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm flex-shrink-0">
                  AI
                </div>
                <div className="bg-neutral-800/60 rounded-xl rounded-tl-none p-4 max-w-[85%]">
                  <p className="text-neutral-300 text-sm">
                    Good start! What's the time and space complexity? Can you
                    handle duplicate values?
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/[0.06] px-6 py-3 flex items-center justify-between text-zinc-500 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Interview in progress
              </span>
              <span>12:34</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
