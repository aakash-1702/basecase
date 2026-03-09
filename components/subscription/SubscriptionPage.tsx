"use client";

import { useState } from "react";
import {
  Check,
  X,
  Sparkles,
  Zap,
  MessageSquare,
  Brain,
  TrendingUp,
  Target,
  Crown,
} from "lucide-react";

interface SubscriptionPageProps {
  isPremium: boolean;
  userName: string;
}

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic features",
    features: [
      { text: "Access to 50+ curated problems", included: true },
      { text: "Basic problem tracking", included: true },
      { text: "Mock interviews", included: false },
      { text: "AI feedback reports", included: false },
      { text: "AI Mentor for problems", included: false },
      { text: "Company-specific patterns", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
    disabled: true,
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "Everything you need for FAANG prep",
    features: [
      { text: "Unlimited mock interviews", included: true },
      { text: "Access to all 200+ problems", included: true },
      { text: "Full AI feedback reports", included: true },
      { text: "AI Mentor for every problem", included: true },
      { text: "Company-specific interview patterns", included: true },
      { text: "DSA, Technical, HR, Behavioural modes", included: true },
      { text: "Score across confidence, depth, clarity", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade to Pro",
    disabled: false,
    highlight: true,
  },
];

export function SubscriptionPage({
  isPremium,
  userName,
}: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">("pro");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Mock upgrade flow - in production this would redirect to payment
    setTimeout(() => {
      setIsLoading(false);
      alert("Payment integration coming soon!");
    }, 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(249,115,22,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{ animation: "fadeSlideUp 0.5s ease backwards" }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.15)",
            }}
          >
            <Crown className="w-3.5 h-3.5" style={{ color: "var(--amber)" }} />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-dm-mono)",
                color: "var(--amber)",
              }}
            >
              BaseCase Pro
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl mb-5 leading-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
            }}
          >
            Unlock your full
            <br />
            interview potential.
          </h1>

          <p
            className="text-sm max-w-lg mx-auto leading-relaxed"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "var(--text-muted)",
            }}
          >
            Join hundreds of engineers who use BaseCase to prepare for FAANG
            interviews with AI-powered mock sessions and personalized feedback.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className="grid md:grid-cols-2 gap-6 mb-16"
          style={{ animation: "fadeSlideUp 0.5s ease 0.1s backwards" }}
        >
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className="relative p-8 border transition-all duration-300"
              style={{
                background: plan.highlight
                  ? "rgba(249,115,22,0.03)"
                  : "var(--bg-card)",
                borderColor: plan.highlight
                  ? "rgba(249,115,22,0.2)"
                  : "var(--border-subtle)",
                borderRadius: "12px",
                transform:
                  selectedPlan === plan.name.toLowerCase()
                    ? "scale(1.02)"
                    : "scale(1)",
              }}
              onClick={() =>
                !plan.disabled &&
                setSelectedPlan(plan.name.toLowerCase() as "free" | "pro")
              }
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full"
                  style={{
                    background: "var(--amber)",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "10px",
                    color: "#000",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  RECOMMENDED
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="text-lg mb-1"
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    color: "var(--text-primary)",
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span
                  className="text-4xl"
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    color: plan.highlight
                      ? "var(--amber)"
                      : "var(--text-primary)",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check
                        className="w-4 h-4 shrink-0"
                        style={{ color: "#10b981" }}
                      />
                    ) : (
                      <X
                        className="w-4 h-4 shrink-0"
                        style={{ color: "#525252" }}
                      />
                    )}
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "var(--font-dm-mono)",
                        color: feature.included
                          ? "var(--text-primary)"
                          : "#525252",
                      }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!plan.disabled && plan.highlight) handleUpgrade();
                }}
                disabled={plan.disabled || isLoading || isPremium}
                className="w-full py-3.5 text-sm font-medium tracking-wide transition-all duration-200"
                style={{
                  background:
                    plan.highlight && !isPremium
                      ? "var(--amber)"
                      : "transparent",
                  color:
                    plan.highlight && !isPremium ? "#000" : "var(--text-muted)",
                  border: plan.highlight
                    ? "none"
                    : "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-dm-mono)",
                  cursor:
                    plan.disabled || isPremium ? "not-allowed" : "pointer",
                  opacity:
                    plan.disabled || (isPremium && !plan.highlight) ? 0.5 : 1,
                }}
              >
                {isPremium && plan.highlight
                  ? "Current Plan"
                  : isLoading && plan.highlight
                    ? "Processing..."
                    : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div style={{ animation: "fadeSlideUp 0.5s ease 0.2s backwards" }}>
          <h2
            className="text-center text-xl mb-8"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
            }}
          >
            Everything in Pro
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: MessageSquare,
                title: "Voice-First Interviews",
                desc: "Natural conversation with AI that mirrors real FAANG interviewers",
              },
              {
                icon: Brain,
                title: "AI Mentor",
                desc: "Get hints, explanations, and guidance on every coding problem",
              },
              {
                icon: TrendingUp,
                title: "Detailed Feedback",
                desc: "Scores across confidence, depth, clarity, and technical accuracy",
              },
              {
                icon: Target,
                title: "Company Patterns",
                desc: "Interview questions tailored to Google, Amazon, Meta, and more",
              },
              {
                icon: Zap,
                title: "All Interview Modes",
                desc: "DSA, Technical, HR, and Behavioural interview simulations",
              },
              {
                icon: Sparkles,
                title: "Unlimited Sessions",
                desc: "Practice as much as you need with no daily limits",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 border transition-colors duration-200 hover:border-white/[0.1]"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                  borderRadius: "8px",
                }}
              >
                <feature.icon
                  className="w-5 h-5 mb-3"
                  style={{ color: "var(--amber)" }}
                />
                <h3
                  className="text-sm mb-1"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-primary)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div
          className="mt-16 text-center"
          style={{ animation: "fadeSlideUp 0.5s ease 0.3s backwards" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-dm-mono)",
              color: "#3a3a3a",
            }}
          >
            Hundreds of engineers use BaseCase to prep for FAANG interviews
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
