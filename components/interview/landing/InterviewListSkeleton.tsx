/** Card-shaped placeholders using the shared `skeleton` shimmer (no animate-pulse trees). */
export function InterviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card-base p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-3 w-36" />
            </div>
            <div className="skeleton h-10 w-10 rounded-full" />
          </div>
          <div className="mb-4 space-y-2">
            <div className="skeleton h-1 w-full" />
            <div className="skeleton h-1 w-3/4" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-5 w-14" />
            <div className="skeleton h-5 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
