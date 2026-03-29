export default function TagsBanner() {
  const tags = [
    "Arrays",
    "Binary Search",
    "DP",
    "Graphs",
    "Trees",
    "Sliding Window",
    "Two Pointers",
    "Greedy",
    "Backtracking",
    "Tries",
    "Heap",
    "Stack",
    "Queue",
    "Recursion",
    "Bit Manipulation",
  ];

  const line = `${tags.join("  ·  ")}  ·  ${tags.join("  ·  ")}  ·  `;

  return (
    <section className="py-6 sm:py-8 border-y border-zinc-800/40 overflow-hidden relative">
      {/* Gradient masks for seamless edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="opacity-30">
        <div className="whitespace-nowrap scroll-left font-mono text-[11px] sm:text-xs text-zinc-400 py-1">
          <span>{line}</span>
        </div>
        <div className="whitespace-nowrap scroll-right font-mono text-[11px] sm:text-xs text-zinc-500 py-1 mt-1">
          <span>{line}</span>
        </div>
      </div>
    </section>
  );
}
