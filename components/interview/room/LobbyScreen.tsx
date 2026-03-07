"use client";

import { Sparkles, Mic, Shield, ChevronRight } from "lucide-react";

interface LobbyScreenProps {
  config: {
    company: string;
    mode: string;
    questions: number;
    difficulty: string;
    stack: string[];
  };
  onJoin: () => void;
}

export function LobbyScreen({ config, onJoin }: LobbyScreenProps) {
  return (
    <div className="min-h-screen interview-ambient-bg interview-grid-overlay flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-2xl">
        {/* Company + Mode */}
        <div
          className="text-[11px] tracking-[0.2em] uppercase mb-6 text-center"
          style={{
            fontFamily: "var(--font-dm-mono)",
            animation: "fadeSlideUp 0.4s ease backwards",
          }}
        >
          <span style={{ color: "var(--amber)" }}>{config.company}</span>
          <span style={{ color: "var(--text-muted)" }}> · {config.mode} Interview</span>
        </div>

        {/* ── CTA — top and center ── */}
        <div className="text-center mb-12" style={{ animation: "fadeSlideUp 0.4s ease 0.06s backwards" }}>
          <h1 className="text-4xl mb-4" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
            Ready to Begin?
          </h1>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
            Your AI interviewer is prepared. Click below to enter the room.
          </p>

          <button
            onClick={onJoin}
            className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
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

        {/* Session details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" style={{ animation: "fadeSlideUp 0.4s ease 0.12s backwards" }}>
          {[
            { label: "Mode", value: config.mode },
            { label: "Questions", value: config.questions.toString() },
            { label: "Company", value: config.company },
            { label: "Difficulty", value: config.difficulty },
          ].map((stat) => (
            <div key={stat.label} className="p-4 border text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", borderRadius: "6px" }}>
              <div className="text-[9px] tracking-[0.15em] uppercase mb-1.5" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
                {stat.label}
              </div>
              <div className="text-sm capitalize" style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text-primary)" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Stack tags */}
        {config.stack?.length > 0 && (
          <div className="mb-8 text-center" style={{ animation: "fadeSlideUp 0.4s ease 0.18s backwards" }}>
            <div className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--amber)" }}>
              Your Stack
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {config.stack.map((tech) => (
                <span key={tech} className="px-3 py-1.5 text-xs" style={{ fontFamily: "var(--font-dm-mono)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", borderRadius: "4px" }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-5 border" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", borderRadius: "6px", animation: "fadeSlideUp 0.4s ease 0.24s backwards" }}>
          <div className="text-[10px] tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
            Before You Begin
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Mic className="w-3 h-3" />, text: "Test your microphone" },
              { icon: <Shield className="w-3 h-3" />, text: "Find a quiet space" },
              { icon: <Sparkles className="w-3 h-3" />, text: "Speak clearly" },
              { icon: <ChevronRight className="w-3 h-3" />, text: "End session anytime" },
            ].map((tip) => (
              <div key={tip.text} className="flex items-center gap-2 text-[11px]" style={{ fontFamily: "var(--font-dm-mono)", color: "var(--text-muted)" }}>
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
