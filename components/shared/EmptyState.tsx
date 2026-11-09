import { cn } from "@/lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-base flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg text-fg">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
