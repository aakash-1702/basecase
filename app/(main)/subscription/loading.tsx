export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4 p-6">
      <div className="h-8 w-48 rounded-md bg-muted/30" />
      <div className="h-4 w-full rounded bg-muted/20" />
      <div className="h-4 w-3/4 rounded bg-muted/20" />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-44 rounded-xl bg-muted/20" />
        <div className="h-44 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}
