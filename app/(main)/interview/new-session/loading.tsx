export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen animate-pulse">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        {/* Logo / icon placeholder */}
        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto" />
        {/* Title */}
        <div className="h-6 w-48 rounded bg-white/5 mx-auto" />
        {/* Subtitle */}
        <div className="space-y-2">
          <div className="h-3 w-64 rounded bg-white/5 mx-auto" />
          <div className="h-3 w-40 rounded bg-white/5 mx-auto" />
        </div>
        {/* Button placeholder */}
        <div className="h-12 w-48 rounded bg-white/5 mx-auto" />
      </div>
    </div>
  );
}
