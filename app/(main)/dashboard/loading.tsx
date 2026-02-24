export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#080808] z-50 flex flex-col items-center justify-center gap-6">
      {/* Grid background matches layout */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `v   
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Logo mark */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
        style={{ background: "linear-gradient(135deg, #d97706, #ea580c)" }}
      >
        ⌘
      </div>

      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#f59e0b" }}
        />
      </div>

      <div className="text-center">
        <p className="text-neutral-300 font-medium text-sm">
          Loading your dashboard
        </p>
        <p className="text-neutral-600 text-xs mt-1">
          Fetching your progress...
        </p>
      </div>
    </div>
  );
}
