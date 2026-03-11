export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-pulse">
      {/* Back link */}
      <div className="h-3 w-32 rounded bg-white/5 mb-10" />
      {/* Header */}
      <div className="space-y-3 mb-12">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-8 w-72 rounded bg-white/5" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-white/5" />
          <div className="h-6 w-16 rounded-full bg-white/5" />
          <div className="h-6 w-24 rounded-full bg-white/5" />
        </div>
      </div>
      {/* Overall score card */}
      <div className="rounded-xl h-32 bg-white/[0.02] border border-white/5 mb-10" />
      {/* Dimension cards */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl h-28 bg-white/[0.02] border border-white/5 mb-4"
        />
      ))}
    </div>
  );
}
