export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4 p-6">
      <div className="h-8 w-64 rounded-md bg-muted/30" />
      <div className="h-4 w-full rounded bg-muted/20" />
      <div className="h-4 w-2/3 rounded bg-muted/20" />
      <div className="mt-4 space-y-3">
        <div className="h-16 rounded-xl bg-muted/20" />
        <div className="h-16 rounded-xl bg-muted/20" />
        <div className="h-16 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}
