import { cn } from "@/lib/utils";

/** Infinite horizontal scroller – CSS only, transform-based. */
export default function Marquee({
  items,
  className,
  itemClassName,
  speed = 40,
}: {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  speed?: number;
}) {
  const row = [...items, ...items];
  return (
    <div className={cn("relative w-full overflow-hidden mask-x", className)}>
      <div
        className="flex w-max animate-marquee will-change-transform"
        style={{ animationDuration: `${speed}s` }}
      >
        {row.map((item, i) => (
          <div
            key={i}
            aria-hidden={i >= items.length}
            className={cn("flex shrink-0 items-center gap-2 px-8", itemClassName)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
