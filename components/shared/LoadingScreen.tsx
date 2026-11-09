import Logo from "./Logo";

/** Full-area loading state shared by route-level loading.tsx files. */
export default function LoadingScreen({
  title = "Loading",
  subtitle,
  fullscreen = false,
}: {
  title?: string;
  subtitle?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg"
          : "flex min-h-[60vh] flex-col items-center justify-center gap-5"
      }
      role="status"
      aria-live="polite"
    >
      <Logo href={null} size="lg" />
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-line" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-fg-secondary">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-fg-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
