"use client";

import {
  Sparkles,
  Mic,
  Shield,
  ChevronRight,
  Target,
  TrendingUp,
  Brain,
} from "lucide-react";

interface LobbyScreenProps {
  config: {
    company: string;
    mode: string;
    questions: number;
    difficulty: string;
  };
  onJoin: () => void;
}

export function LobbyScreen({ config, onJoin }: LobbyScreenProps) {
  return (
    <div className="min-h-screen interview-ambient-bg interview-grid-overlay flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Value Proposition */}
        <div
          className="text-center mb-6"
          style={{ animation: "fadeSlideUp 0.4s ease backwards" }}
        >
          <div
            className="text-[10px] tracking-[0.2em] uppercase mb-3"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            AI-POWERED MOCK INTERVIEW
          </div>
          <h1
            className="text-2xl mb-2"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
            }}
          >
            Practice Like It's Real
          </h1>
          <p
            className="text-[11px] leading-relaxed max-w-xs mx-auto"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            AI interviewer calibrated to{" "}
            <span style={{ color: "var(--amber)" }}>{config.company}</span>'s
            hiring bar — real questions, real-time feedback, real confidence.
          </p>
        </div>

        {/* Features — single line */}
        <div
          className="flex justify-center gap-5 mb-6"
          style={{ animation: "fadeSlideUp 0.4s ease 0.05s backwards" }}
        >
          {[
            { icon: <Target className="w-3 h-3" />, text: "Company prep" },
            { icon: <Brain className="w-3 h-3" />, text: "Follow-ups" },
            { icon: <TrendingUp className="w-3 h-3" />, text: "Scoring" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-1 text-[9px]"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--text-muted)",
              }}
            >
              <span style={{ color: "var(--amber)" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Session Config — tiny pills */}
        <div
          className="flex justify-center gap-1.5 mb-6"
          style={{ animation: "fadeSlideUp 0.4s ease 0.08s backwards" }}
        >
          {[
            { label: "Mode", value: config.mode },
            { label: "Qs", value: config.questions.toString() },
            { label: "Company", value: config.company },
            { label: "Level", value: config.difficulty },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-2.5 py-1.5 border text-center"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                borderRadius: "4px",
              }}
            >
              <div
                className="text-[7px] tracking-[0.12em] uppercase"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-muted)",
                }}
              >
                {stat.label}
              </div>
              <div
                className="text-[11px] capitalize"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  color: "var(--text-primary)",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mb-6"
          style={{ animation: "fadeSlideUp 0.4s ease 0.1s backwards" }}
        >
          <button
            onClick={onJoin}
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              background: "var(--amber)",
              color: "#000",
              borderRadius: "6px",
              fontFamily: "var(--font-dm-mono)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Join Interview Room
          </button>
        </div>

        {/* Tips — ultra compact */}
        <div
          className="px-3 py-2.5 border"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
            borderRadius: "6px",
            animation: "fadeSlideUp 0.4s ease 0.12s backwards",
          }}
        >
          <div className="flex justify-between">
            {[
              { icon: <Mic className="w-2.5 h-2.5" />, text: "Test mic" },
              { icon: <Shield className="w-2.5 h-2.5" />, text: "Quiet space" },
              {
                icon: <Sparkles className="w-2.5 h-2.5" />,
                text: "Speak clearly",
              },
              {
                icon: <ChevronRight className="w-2.5 h-2.5" />,
                text: "End anytime",
              },
            ].map((tip) => (
              <div
                key={tip.text}
                className="flex items-center gap-1 text-[9px]"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ color: "var(--emerald)" }}>{tip.icon}</span>
                {tip.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
