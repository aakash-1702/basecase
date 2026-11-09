import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  size = "xl",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
  as?: "div" | "section" | "header" | "footer" | "main";
}) {
  const width =
    size === "md" ? "max-w-3xl" : size === "lg" ? "max-w-5xl" : "max-w-7xl";
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", width, className)}>
      {children}
    </Tag>
  );
}
