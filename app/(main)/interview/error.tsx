"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p
        className="text-sm"
        style={{ fontFamily: "var(--font-dm-mono)", color: "rgba(255,255,255,0.4)" }}
      >
        Something went wrong loading interviews.
      </p>
      <button
        onClick={reset}
        className="text-xs border px-4 py-2 rounded transition-colors duration-200 hover:border-white/20"
        style={{
          fontFamily: "var(--font-dm-mono)",
          color: "rgba(255,255,255,0.4)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        try again
      </button>
    </div>
  );
}
