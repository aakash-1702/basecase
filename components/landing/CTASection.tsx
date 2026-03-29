"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.55,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

const testimonials = [
  {
    title: "The spaced repetition actually works.",
    quote:
      "I was doing random LeetCode for 4 months and retaining nothing. Three weeks on BaseCase with SM-2 and I can actually recall patterns mid-interview. Flipkart call came in last week.",
    name: "Rohan M.",
    role: "SDE Intern",
  },
  {
    title: "The mock interview feedback is brutally honest.",
    quote:
      "My first session score was rough. The report broke down exactly where I lost points on depth and follow-ups. Two weeks later I cleared the Razorpay technical round.",
    name: "Priya S.",
    role: "Final Year CSE",
  },
  {
    title: "Finally a platform that doesn't overwhelm you.",
    quote:
      "The AI roadmap feature got me. I gave it my target company and timeline, it generated a full plan with checkpoints. Felt like having a senior guiding me.",
    name: "Arjun K.",
    role: "Backend Engineer",
  },
];

const faq = [
  {
    q: "Is BaseCase free?",
    a: "Yes. All DSA sheets, problem tracking, and 3 mock interviews/month are completely free.",
  },
  {
    q: "How is this different from LeetCode?",
    a: "LeetCode is a judge. BaseCase is a learning system with structure, spaced repetition, and AI interview practice - not just a problem list.",
  },
  {
    q: "What is SM-2 spaced repetition?",
    a: "The algorithm behind Anki. Based on your confidence rating after each problem, we schedule the next review to maximize long-term retention.",
  },
  {
    q: "How does the AI mock interview work?",
    a: "You join a voice session. Gemini asks a question via Sarvam TTS, listens to your response, asks adaptive follow-ups, then generates a structured feedback report at the end.",
  },
  {
    q: "Can I build my own problem sheet?",
    a: "Yes. The Custom Sheet Builder lets you create, reorder, tag, and optionally publish your own curated lists.",
  },
  {
    q: "Is there a mobile app?",
    a: "A React Native companion app is in development - quiz engine, roadmap tracking, and community features coming soon.",
  },
];

export default function CTASection() {
  return (
    <>
      <section id="community" className="py-20 md:py-28 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeUp}>
            <Badge
              variant="outline"
              className="border-orange-500/40 text-orange-400 bg-orange-500/10"
            >
              Community
            </Badge>
            <h2 className="mt-4 text-3xl md:text-5xl font-mono font-bold tracking-tight">
              Developers who made the switch
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real feedback from engineers who prepped on BaseCase.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-12">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.08 }}
                whileHover={{
                  y: -3,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <Card className="glow-hover bg-zinc-950 border-zinc-800 p-5 sm:p-6 h-full flex flex-col">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className="text-orange-400 text-sm">
                            ★
                          </span>
                        ))}
                    </div>
                    <p className="text-white font-semibold text-sm sm:text-base mb-3 tracking-tight">
                      "{item.title}"
                    </p>
                    <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed italic flex-1">
                      "{item.quote}"
                    </p>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-zinc-800/60">
                      <div className="w-9 h-9 rounded-full bg-orange-500/12 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">
                        {item.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-zinc-200 text-xs font-semibold">
                          {item.name}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeUp}>
            <Badge
              variant="outline"
              className="border-orange-500/40 text-orange-400 bg-orange-500/10"
            >
              Pricing
            </Badge>
            <h2 className="mt-4 text-3xl md:text-5xl font-mono font-bold tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Upgrade when you're ready.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
            >
              <Card className="h-full bg-zinc-950 border-zinc-800">
                <CardContent className="p-6">
                  <p className="font-semibold">Free</p>
                  <div className="mt-6 mb-6 pb-6 border-b border-zinc-800">
                    <span className="font-mono font-bold text-3xl sm:text-4xl text-white">
                      ₹0
                    </span>
                    <span className="text-zinc-500 text-sm ml-2">
                      / forever
                    </span>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li>✓ Access to all DSA sheets</li>
                    <li>✓ Problem tracking and confidence notes</li>
                    <li>✓ Basic analytics dashboard</li>
                    <li>✓ Community roadmaps</li>
                    <li>✓ 3 AI mock interview sessions / month</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-6 w-full border-zinc-600 bg-zinc-900/65 text-white hover:bg-zinc-800"
                  >
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
            >
              <Card className="h-full bg-zinc-950 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.08)] relative">
                <CardContent className="p-6">
                  <Badge className="absolute top-4 right-4 bg-orange-500 text-black">
                    Most Popular
                  </Badge>
                  <p className="font-semibold">Pro</p>
                  <div className="mt-6 mb-6 pb-6 border-b border-zinc-800/60">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-bold text-3xl sm:text-4xl text-orange-400">
                        ₹299
                      </span>
                      <span className="text-zinc-600 text-sm line-through">
                        ₹599
                      </span>
                      <span className="text-zinc-500 text-sm">/ month</span>
                    </div>
                    <p className="text-green-400 text-xs font-medium mt-1">
                      🎉 50% off - launch pricing
                    </p>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li className="text-orange-300">✓ Everything in Free</li>
                    <li className="text-orange-300">
                      ✓ Unlimited mock interviews
                    </li>
                    <li className="text-orange-300">
                      ✓ Full AI feedback reports with scoring breakdown
                    </li>
                    <li className="text-orange-300">
                      ✓ Company-specific question patterns
                    </li>
                    <li className="text-orange-300">
                      ✓ Priority SM-2 recommendations
                    </li>
                    <li className="text-orange-300">
                      ✓ Radar analytics heatmaps
                    </li>
                  </ul>
                  <Button className="mt-6 w-full bg-white text-black hover:bg-zinc-100">
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 max-w-2xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
              Frequently asked questions
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
          >
            <Accordion
              type="single"
              collapsible
              className="mt-10 w-full divide-y divide-zinc-800/60"
            >
              {faq.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="border-0 border-b border-zinc-800/60 last:border-0"
                >
                  <AccordionTrigger className="text-zinc-200 font-medium text-sm sm:text-base hover:text-white hover:no-underline py-5 data-[state=open]:text-orange-400 transition-colors text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-500 text-sm leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            {...fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-tight text-white text-center max-w-2xl mx-auto leading-tight"
          >
            Ready to stop{" "}
            <span className="text-gradient-orange">grinding randomly</span>?
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-zinc-400 text-base sm:text-lg mt-4 text-center"
          >
            Join 1,000+ engineers who prep smarter with BaseCase.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto group gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1.5"
              >
                Start for Free{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-zinc-600 bg-zinc-900/65 text-white hover:border-zinc-500 hover:bg-zinc-800"
            >
              <Link href="/sheets">Browse Sheets</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
