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

const FEATURES = [
  { icon: Target, text: "Company prep" },
  { icon: Brain, text: "Follow-ups" },
  { icon: TrendingUp, text: "Scoring" },
];

const TIPS = [
  { icon: Mic, text: "Test mic" },
  { icon: Shield, text: "Quiet space" },
  { icon: Sparkles, text: "Speak clearly" },
  { icon: ChevronRight, text: "End anytime" },
];

export function LobbyScreen({ config, onJoin }: LobbyScreenProps) {
  const stats = [
    { label: "Mode", value: config.mode },
    { label: "Qs", value: config.questions.toString() },
    { label: "Company", value: config.company },
    { label: "Level", value: config.difficulty },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Value Proposition */}
        <div className="mb-6 animate-fade-up text-center">
          <span className="eyebrow justify-center">AI-powered mock interview</span>
          <h1 className="mb-2 mt-3 font-display text-2xl tracking-tight text-fg">
            Practice like it&apos;s real
          </h1>
          <p className="mx-auto max-w-xs text-[11px] leading-relaxed text-fg-muted">
            AI interviewer calibrated to <span className="text-accent">{config.company}</span>&apos;s
            hiring bar — real questions, real-time feedback, real confidence.
          </p>
        </div>

        {/* Features — single line */}
        <div className="mb-6 flex animate-fade-up justify-center gap-5" style={{ animationDelay: "50ms" }}>
          {FEATURES.map((item) => (
            <div key={item.text} className="flex items-center gap-1 font-mono text-[9px] text-fg-muted">
              <item.icon className="h-3 w-3 text-accent" />
              {item.text}
            </div>
          ))}
        </div>

        {/* Session Config — tiny pills */}
        <div className="mb-6 flex animate-fade-up justify-center gap-1.5" style={{ animationDelay: "80ms" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="card-base rounded-md px-2.5 py-1.5 text-center">
              <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-fg-muted">{stat.label}</div>
              <div className="font-display text-[11px] capitalize text-fg">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mb-6 animate-fade-up text-center" style={{ animationDelay: "100ms" }}>
          <button type="button" onClick={onJoin} className="btn btn-primary">
            <Sparkles className="h-4 w-4" />
            Join interview room
          </button>
        </div>

        {/* Tips — ultra compact */}
        <div className="card-base animate-fade-up px-3 py-2.5" style={{ animationDelay: "120ms" }}>
          <div className="flex justify-between">
            {TIPS.map((tip) => (
              <div key={tip.text} className="flex items-center gap-1 font-mono text-[9px] text-fg-muted">
                <tip.icon className="h-2.5 w-2.5 text-success" />
                {tip.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
