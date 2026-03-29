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

  const line = `${tags.join(" · ")} · ${tags.join(" · ")} ·`;

  return (
    <section className="py-8 border-y border-zinc-800/50 overflow-hidden">
      <div className="opacity-40">
        <div className="whitespace-nowrap scroll-left font-mono text-xs sm:text-sm text-zinc-400 py-1">
          <span className="mx-4">{line}</span>
        </div>
        <div className="whitespace-nowrap scroll-right font-mono text-xs sm:text-sm text-zinc-500 py-1">
          <span className="mx-4">{line}</span>
        </div>
      </div>
    </section>
  );
}
