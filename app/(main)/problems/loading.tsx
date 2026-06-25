export default function Loading() {
  type SkeletonProps = {
    className: string;
    delay?: number;
  };

  const Skeleton = ({ className, delay = 0 }: SkeletonProps) => (
    <div
      className={`skeleton ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );

  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(140%); }
        }

        @keyframes skeleton-breathe {
          0%, 100% { opacity: .82; }
          50% { opacity: 1; }
        }

        @keyframes row-rise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .skeleton {
          position: relative;
          overflow: hidden;
          animation: skeleton-breathe 2.2s ease-in-out infinite;
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 48%, transparent 100%);
          animation: shimmer-slide 1.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: inherit;
        }

        .row-anim {
          opacity: 0;
          animation: row-rise 0.45s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <section className="relative overflow-hidden border-b border-neutral-800/50 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <Skeleton className="h-12 w-80 rounded-xl bg-neutral-800/80 md:h-14 md:w-136" />
              <Skeleton
                className="mt-5 h-5 w-full max-w-3xl rounded bg-neutral-800/60"
                delay={120}
              />
              <Skeleton
                className="mt-2 h-5 w-2/3 max-w-2xl rounded bg-neutral-800/50"
                delay={200}
              />
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Skeleton
                  className="h-11 w-40 rounded-full border border-amber-700/30 bg-amber-950/30"
                  delay={300}
                />
                <Skeleton
                  className="h-11 w-44 rounded-full border border-amber-700/30 bg-amber-950/30"
                  delay={380}
                />
                <Skeleton
                  className="h-11 w-36 rounded-full border border-amber-700/30 bg-amber-950/30"
                  delay={460}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-40 border-b border-neutral-800/40 bg-neutral-950/80 py-8 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Skeleton
                className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 sm:w-96"
                delay={140}
              />
              <div className="flex flex-wrap gap-3">
                <Skeleton
                  className="h-10 w-36 rounded-md border border-neutral-700 bg-neutral-900"
                  delay={220}
                />
                <Skeleton
                  className="h-10 w-40 rounded-md border border-neutral-700 bg-neutral-900"
                  delay={300}
                />
                <Skeleton
                  className="h-10 w-36 rounded-md border border-amber-700/40 bg-amber-950/20"
                  delay={380}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-xl border border-neutral-800/70 bg-neutral-900/35">
              <div className="grid grid-cols-12 border-b border-neutral-800/70 px-4 py-4 text-xs uppercase tracking-wider text-neutral-500 sm:px-6">
                <Skeleton className="col-span-1 h-4 w-12 rounded bg-neutral-800/60" />
                <Skeleton
                  className="col-span-6 h-4 w-28 rounded bg-neutral-800/60"
                  delay={80}
                />
                <Skeleton
                  className="col-span-2 h-4 w-20 rounded bg-neutral-800/60"
                  delay={120}
                />
                <Skeleton
                  className="col-span-3 h-4 w-24 rounded bg-neutral-800/60"
                  delay={160}
                />
              </div>

              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="row-anim grid grid-cols-12 items-center border-b border-neutral-800/60 px-4 py-5 sm:px-6"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Skeleton
                    className="col-span-1 h-7 w-7 rounded-full border border-neutral-700 bg-neutral-800"
                    delay={i * 60}
                  />
                  <div className="col-span-6">
                    <Skeleton
                      className="h-5 w-3/4 rounded bg-neutral-800/60"
                      delay={i * 60 + 80}
                    />
                  </div>
                  <div className="col-span-2">
                    <Skeleton
                      className="h-7 w-14 rounded-full border border-emerald-700/35 bg-emerald-950/25"
                      delay={i * 60 + 120}
                    />
                  </div>
                  <div className="col-span-3">
                    <Skeleton
                      className="h-5 w-24 rounded bg-neutral-800/50"
                      delay={i * 60 + 160}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Skeleton
                className="h-9 w-44 rounded-md border border-neutral-800 bg-neutral-900/50"
                delay={320}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
