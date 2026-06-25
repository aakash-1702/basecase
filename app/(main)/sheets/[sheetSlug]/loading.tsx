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

        @keyframes block-rise {
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

        .block-anim {
          opacity: 0;
          animation: block-rise .45s ease-out forwards;
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-neutral-950 pb-20 text-neutral-100">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-neutral-900 via-neutral-950 to-neutral-950" />

        <section className="relative border-b border-neutral-800/30 pt-16 pb-12 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-6 lg:px-8">
            <Skeleton className="mx-auto mb-6 h-8 w-48 rounded-full border border-amber-700/30 bg-amber-950/25" />
            <Skeleton
              className="mx-auto h-14 w-md max-w-full rounded-xl bg-neutral-800/80"
              delay={120}
            />
            <Skeleton
              className="mx-auto mt-5 h-5 w-full max-w-3xl rounded bg-neutral-800/60"
              delay={200}
            />

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="block-anim rounded-2xl border border-neutral-800/70 bg-neutral-900/60 px-6 py-5"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Skeleton
                    className="mx-auto h-5 w-8 rounded bg-neutral-800/70"
                    delay={i * 70}
                  />
                  <Skeleton
                    className="mx-auto mt-3 h-7 w-12 rounded bg-neutral-800/65"
                    delay={i * 70 + 60}
                  />
                  <Skeleton
                    className="mx-auto mt-2 h-3 w-16 rounded bg-neutral-800/55"
                    delay={i * 70 + 110}
                  />
                </div>
              ))}
            </div>

            <div
              className="block-anim mx-auto mt-10 max-w-xl rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-5"
              style={{ animationDelay: "220ms" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <Skeleton
                  className="h-5 w-32 rounded bg-neutral-800/70"
                  delay={180}
                />
                <Skeleton
                  className="h-7 w-14 rounded bg-neutral-800/70"
                  delay={240}
                />
              </div>
              <Skeleton
                className="h-3 rounded-full bg-neutral-800/80"
                delay={300}
              />
              <Skeleton
                className="mt-3 h-4 w-44 rounded bg-neutral-800/55"
                delay={360}
              />
            </div>
          </div>
        </section>

        <section className="relative py-10">
          <div className="mx-auto max-w-6xl space-y-4 px-5 sm:px-6 lg:px-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="block-anim overflow-hidden rounded-xl border border-neutral-800/70 bg-neutral-900/45"
                style={{ animationDelay: `${i * 90 + 80}ms` }}
              >
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <Skeleton
                      className="h-6 w-64 rounded bg-neutral-800/70"
                      delay={i * 90 + 60}
                    />
                    <Skeleton
                      className="mt-3 h-4 w-44 rounded bg-neutral-800/55"
                      delay={i * 90 + 120}
                    />
                  </div>
                  <Skeleton
                    className="h-8 w-8 rounded-full bg-neutral-800/65"
                    delay={i * 90 + 180}
                  />
                </div>
                <div className="border-t border-neutral-800/60 px-6 py-4">
                  {Array.from({ length: 3 }).map((__, row) => (
                    <div
                      key={row}
                      className="flex items-center justify-between border-b border-neutral-800/50 py-3 last:border-b-0"
                    >
                      <Skeleton
                        className="h-5 w-1/2 rounded bg-neutral-800/65"
                        delay={i * 90 + row * 60 + 220}
                      />
                      <Skeleton
                        className="h-6 w-20 rounded-full bg-neutral-800/65"
                        delay={i * 90 + row * 60 + 280}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
