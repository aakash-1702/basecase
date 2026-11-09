/**
 * One fixed, paint-once background layer for the whole app.
 * Replaces the stacks of per-page blurred/animated glow divs.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-ambient"
      style={{ contain: "strict" }}
    />
  );
}
