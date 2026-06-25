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

        @keyframes card-rise {
          0% { opacity: 0; transform: translateY(10px); }
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
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 48%, transparent 100%);
          animation: shimmer-slide 1.75s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: inherit;
        }

        .card-anim {
          opacity: 0;
          animation: card-rise .45s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <section className="relative overflow-hidden border-b border-neutral-800/50 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-12 w-72 rounded-xl bg-neutral-800/80 md:h-14 md:w-120" />
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
                  className="h-11 w-32 rounded-full border border-amber-700/30 bg-amber-950/30"
                  delay={260}
                />
                <Skeleton
                  className="h-11 w-44 rounded-full border border-amber-700/30 bg-amber-950/30"
                  delay={340}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-40 border-b border-neutral-800/50 bg-neutral-950/90 py-6 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Skeleton
                className="h-10 w-full rounded-lg border border-neutral-700 bg-neutral-900 sm:w-96"
                delay={120}
              />
              <div className="flex gap-3">
                <Skeleton
                  className="h-10 w-44 rounded-md border border-neutral-700 bg-neutral-900"
                  delay={200}
                />
                <Skeleton
                  className="h-10 w-36 rounded-md border border-amber-700/40 bg-amber-950/20"
                  delay={280}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Skeleton
              className="mx-auto mb-12 h-10 w-72 rounded-lg bg-neutral-800/70"
              delay={320}
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="card-anim rounded-xl border border-neutral-800/70 bg-neutral-900/60 p-6"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <Skeleton
                    className="h-6 w-3/4 rounded bg-neutral-800/70"
                    delay={i * 60}
                  />
                  <Skeleton
                    className="mt-3 h-4 w-full rounded bg-neutral-800/60"
                    delay={i * 60 + 60}
                  />
                  <Skeleton
                    className="mt-2 h-4 w-2/3 rounded bg-neutral-800/50"
                    delay={i * 60 + 100}
                  />

                  <div className="mt-5 flex gap-2">
                    <Skeleton
                      className="h-6 w-20 rounded-full bg-neutral-800/70"
                      delay={i * 60 + 140}
                    />
                    <Skeleton
                      className="h-6 w-16 rounded-full bg-neutral-800/55"
                      delay={i * 60 + 180}
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Skeleton
                      className="h-4 w-28 rounded bg-neutral-800/55"
                      delay={i * 60 + 220}
                    />
                    <Skeleton
                      className="h-4 w-20 rounded bg-neutral-800/55"
                      delay={i * 60 + 260}
                    />
                  </div>

                  <Skeleton
                    className="mt-6 h-10 w-full rounded-md border border-amber-700/35 bg-amber-950/20"
                    delay={i * 60 + 300}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
