"use client";

import { useState } from "react";
import { Check, X, Sparkles, Zap, MessageSquare, Brain, TrendingUp, Target, Crown } from "lucide-react";
import Container from "@/components/shared/Container";
import Reveal from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

interface SubscriptionPageProps {
  isPremium: boolean;
  userName: string;
}

type PlanId = "free" | "pro";

const plans: {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  disabled: boolean;
  highlight: boolean;
}[] = [
  {
    id: "free",
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
    id: "pro",
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

const FEATURES = [
  { icon: MessageSquare, title: "Voice-First Interviews", desc: "Natural conversation with AI that mirrors real FAANG interviewers" },
  { icon: Brain, title: "AI Mentor", desc: "Get hints, explanations, and guidance on every coding problem" },
  { icon: TrendingUp, title: "Detailed Feedback", desc: "Scores across confidence, depth, clarity, and technical accuracy" },
  { icon: Target, title: "Company Patterns", desc: "Interview questions tailored to Google, Amazon, Meta, and more" },
  { icon: Zap, title: "All Interview Modes", desc: "DSA, Technical, HR, and Behavioural interview simulations" },
  { icon: Sparkles, title: "Unlimited Sessions", desc: "Practice as much as you need with no daily limits" },
];

export function SubscriptionPage({ isPremium, userName }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");
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
    <Container size="lg" className="pb-24 pt-16 md:pt-20">
      {/* Header */}
      <div className="mb-16 animate-fade-up text-center">
        <span className="eyebrow justify-center">
          <Crown className="h-3.5 w-3.5" />
          BaseCase Pro
        </span>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-fg md:text-5xl">
          Unlock your full
          <br />
          <span className="text-gradient">interview potential.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-fg-secondary">
          {isPremium
            ? `You're already on Pro, ${userName} — thanks for supporting BaseCase.`
            : "Join hundreds of engineers who use BaseCase to prepare for FAANG interviews with AI-powered mock sessions and personalised feedback."}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mb-16 grid animate-fade-up gap-6 md:grid-cols-2" style={{ animationDelay: "100ms" }}>
        {plans.map((plan) => {
          const selected = selectedPlan === plan.id && !plan.disabled;
          const isCta = plan.highlight && !isPremium;
          return (
            <div
              key={plan.id}
              onClick={() => !plan.disabled && setSelectedPlan(plan.id)}
              className={cn(
                "card-base relative p-8 transition-colors",
                plan.highlight && "border-beam",
                selected && "border-accent/40",
                !plan.disabled && "cursor-pointer",
              )}
            >
              {plan.highlight && (
                <span className="chip absolute -top-3 left-1/2 -translate-x-1/2 border-accent bg-accent text-accent-ink">
                  Recommended
                </span>
              )}

              <div className="mb-6">
                <h3 className="font-display text-lg text-fg">{plan.name}</h3>
                <p className="mt-1 text-xs text-fg-muted">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-display text-4xl tracking-tight",
                    plan.highlight ? "text-accent" : "text-fg",
                  )}
                >
                  {plan.price}
                </span>
                <span className="font-mono text-sm text-fg-muted">{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-fg-dim" />
                    )}
                    <span className={cn("text-sm", feature.included ? "text-fg" : "text-fg-muted")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!plan.disabled && plan.highlight) handleUpgrade();
                }}
                disabled={plan.disabled || isLoading || isPremium}
                className={cn("btn btn-lg w-full", isCta ? "btn-primary" : "btn-secondary")}
              >
                {isPremium && plan.highlight
                  ? "Current Plan"
                  : isLoading && plan.highlight
                    ? "Processing..."
                    : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <Reveal>
        <h2 className="mb-8 text-center font-display text-2xl tracking-tight text-fg">
          Everything in Pro
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card-base card-hover p-5">
              <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent">
                <feature.icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-sm font-semibold text-fg">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Social Proof */}
      <Reveal className="mt-16 text-center" delay={80}>
        <p className="font-mono text-xs text-fg-muted">
          Hundreds of engineers use BaseCase to prep for FAANG interviews
        </p>
      </Reveal>
    </Container>
  );
}
