export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 animate-pulse">
      {/* Tag */}
      <div className="h-3 w-36 rounded bg-white/5 mb-8" />
      {/* Title */}
      <div className="space-y-3 mb-10">
        <div className="h-10 w-72 rounded bg-white/5" />
        <div className="h-10 w-56 rounded bg-white/5" />
      </div>
      {/* Subtitle */}
      <div className="h-4 w-96 rounded bg-white/5 mb-10" />
      {/* CTA + Stats */}
      <div className="flex items-end gap-6 mb-12">
        <div className="h-12 w-48 rounded bg-white/5" />
        <div className="flex gap-6">
          <div className="space-y-1">
            <div className="h-7 w-12 rounded bg-white/5" />
            <div className="h-3 w-16 rounded bg-white/5" />
          </div>
          <div className="space-y-1">
            <div className="h-7 w-8 rounded bg-white/5" />
            <div className="h-3 w-16 rounded bg-white/5" />
          </div>
        </div>
      </div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 rounded-lg border border-white/5 bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
