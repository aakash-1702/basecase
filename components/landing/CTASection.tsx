export default function CTASection() {
  return (
    <section className="w-full px-5 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="relative text-center py-32 overflow-hidden">
          {/* Orange Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(249,115,22,0.08), transparent 60%)",
            }}
          />

          {/* Heading */}
          <h2 className="font-[Syne] font-extrabold text-4xl mb-4">
            Your Next Interview
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-neutral-400 max-w-lg mx-auto mb-8">
            Every top engineer you admire solved the same problems you're
            avoiding. Start today. One problem. One pattern. One step closer.
          </p>

          {/* Primary Button */}
          <button className="bg-amber-500 text-black font-bold rounded-lg px-6 py-3 text-sm">
            Start Solving Free →
          </button>
        </div>
      </div>
    </section>
  );
}
