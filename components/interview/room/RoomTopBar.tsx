"use client";

interface RoomTopBarProps {
  currentQuestion: number;
  totalQuestions: number;
  onEndSession: () => void;
}

export function RoomTopBar({ currentQuestion, totalQuestions, onEndSession }: RoomTopBarProps) {
  const handleEnd = () => {
    if (confirm("Are you sure you want to end this session?")) onEndSession();
  };

  return (
    <div className="py-4 px-6 border-b" style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-sm font-medium" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
          BaseCase
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
            Q {currentQuestion.toString().padStart(2, "0")}/{totalQuestions.toString().padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5">
            {[...Array(totalQuestions)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i < currentQuestion ? "var(--amber)" : "var(--text-dim)",
                  opacity: i < currentQuestion ? 1 : 0.3,
                  animation: i === currentQuestion - 1 ? "breathe 2s ease-in-out infinite" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* End Button */}
        <button
          onClick={handleEnd}
          className="px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 hover:brightness-110"
          style={{
            background: "transparent",
            color: "var(--rose)",
            border: "1px solid var(--rose)",
            borderRadius: "4px",
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
}
