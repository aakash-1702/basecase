export default function LandingFooter() {
  return (
    <footer className="border-t border-neutral-800/60 py-6 max-w-[1100px] mx-auto flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
          <span className="text-[9px] font-black text-black">BC</span>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.3em] text-neutral-500 uppercase">
          Basecase
        </span>
      </div>

      {/* Copyright Text */}
      <p className="text-neutral-500 text-xs">
        © 2026 Basecase. Built for learners who are serious.
      </p>
    </footer>
  );
}
