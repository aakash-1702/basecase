"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/landing-animations";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/ forever",
    highlight: false,
    features: [
      "Access to all DSA sheets",
      "Problem tracking & confidence notes",
      "Basic analytics dashboard",
      "Community roadmaps",
      "3 AI mock interviews / month",
      "Judge0 code execution",
    ],
    cta: "Get Started Free",
    ctaHref: "/auth/sign-up",
  },
  {
    name: "Pro",
    price: "₹299",
    originalPrice: "₹599",
    period: "/ month",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited AI mock interviews",
      "Full AI feedback reports with scoring",
      "Project-based GitHub repo interviews",
      "Company-specific question patterns",
      "Priority SM-2 recommendations",
      "Advanced analytics & heatmaps",
      "AI Mentor in problems (unlimited)",
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/subscription",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28" style={{ background: "#0a0a0f" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Simple, <span className="text-gradient-bc">honest</span> pricing
          </h2>
          <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Start free. Upgrade when you&apos;re ready.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className="relative rounded-xl p-6 transition-all"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: plan.highlight
                  ? "1px solid rgba(240, 90, 40, 0.5)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: plan.highlight
                  ? "0 0 40px rgba(240, 90, 40, 0.08)"
                  : "none",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#f05a28", color: "#fff" }}
                >
                  {plan.badge}
                </span>
              )}

              <p className="text-white font-semibold text-lg" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                {plan.name}
              </p>

              <div className="mt-4 mb-5 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl sm:text-4xl font-bold"
                    style={{
                      fontFamily: "var(--font-syne), sans-serif",
                      color: plan.highlight ? "#f05a28" : "#fff",
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {plan.period}
                  </span>
                </div>
                {plan.highlight && (
                  <p className="text-xs font-medium mt-1.5 flex items-center gap-1" style={{ color: "#4ade80" }}>
                    <Sparkles className="w-3 h-3" />
                    50% off — launch pricing
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: plan.highlight ? "rgba(240, 90, 40, 0.9)" : "rgba(255,255,255,0.55)" }}>
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.highlight ? "#f05a28" : "rgba(255,255,255,0.3)" }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: plan.highlight ? "#f05a28" : "rgba(255,255,255,0.06)",
                  color: plan.highlight ? "#fff" : "rgba(255,255,255,0.8)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
