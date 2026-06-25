export default function Loading() {
  return (
    <div className="flex min-h-[60vh] animate-pulse flex-col items-center justify-center gap-4 p-6">
      <div className="h-8 w-48 rounded-md bg-muted/30" />
      <div className="h-4 w-72 rounded bg-muted/20" />
      <div className="h-12 w-full max-w-md rounded-xl bg-muted/20" />
      <div className="h-12 w-full max-w-md rounded-xl bg-muted/20" />
      <div className="h-12 w-full max-w-md rounded-xl bg-muted/20" />
    </div>
  );
}
