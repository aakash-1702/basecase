import useScrollReveal from "@/hooks/useScrollReveal";

export default function LandingNav() {
  const ref = useScrollReveal();

  return (
    <nav
      ref={ref}
      className="fixed top-0 w-full h-16 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/60 flex items-center justify-between px-6 z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#f97316] rounded-md flex items-center justify-center">
          <span className="text-[9px] font-black text-black">BC</span>
        </div>
        <span className="text-base font-bold text-white font-[Syne]">
          Basecase
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-neutral-500 hover:text-white text-[13px]">
          Problems
        </a>
        <a href="#" className="text-neutral-500 hover:text-white text-[13px]">
          Sheets
        </a>
        <a href="#" className="text-neutral-500 hover:text-white text-[13px]">
          Practice
        </a>
        <a href="#" className="text-neutral-500 hover:text-white text-[13px]">
          Community
        </a>
        <a href="#" className="text-neutral-500 hover:text-white text-[13px]">
          Sign In
        </a>
        <a
          href="#"
          className="bg-amber-500 text-black font-bold rounded-lg px-4 py-2 text-[13px]"
        >
          Start Free →
        </a>
      </div>
    </nav>
  );
}
