import { cn } from "@/lib/utils";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  size = "md",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display tracking-tight text-fg text-balance",
          size === "lg"
            ? "text-4xl sm:text-5xl lg:text-6xl leading-[1.02]"
            : "text-3xl sm:text-4xl leading-[1.08]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-fg-secondary text-pretty",
            size === "lg" && "text-lg",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
