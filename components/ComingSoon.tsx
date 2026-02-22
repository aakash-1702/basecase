// app/interview-mode/coming-soon/page.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Hyper-Realistic AI Interviews",
    description:
      "Full-length mock sessions that mirror real FAANG technical + behavioral pressure.",
  },
  {
    title: "Mandatory Thought Process",
    description:
      "You must explain your reasoning aloud before coding — just like real interviews.",
  },
  {
    title: "Adaptive Pressure & Follow-ups",
    description:
      "Timed rounds with dynamic constraint changes and smart interviewer-style probing.",
  },
  {
    title: "Instant, Deep Feedback",
    description:
      "Comprehensive post-round analysis: complexity, edge cases, clarity, communication.",
  },
  {
    title: "Smart, Non-Spoiler Hints",
    description:
      "Targeted nudges when stuck — never full solutions, always teaching.",
  },
  {
    title: "Readiness Score & Gap Analysis",
    description:
      "Personal interview readiness score + automatic focus on your weakest topics.",
  },
];

export default function AIMockInterviewComingSoon() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-amber-950/5 to-neutral-950 pointer-events-none" />
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[900px] h-[600px] bg-amber-500/4 rounded-full blur-3xl animate-pulse-glow opacity-60" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 py-20 md:py-32">
        {/* Hero – very honest "Coming Soon" */}
        <div className="text-center mb-24 animate-fade-in-up">
          <Badge
            variant="outline"
            className="mb-6 px-6 py-2.5 text-lg border-amber-700/50 bg-amber-950/40 text-amber-300 animate-pulse-slow"
          >
            <Sparkles className="mr-2 h-5 w-5" /> Not Available Yet
          </Badge>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            AI Mock Interview
            <span className="block mt-4 text-4xl md:text-5xl text-neutral-400 font-bold">
              — Coming Soon —
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            The most realistic AI-powered mock interviews — designed to feel
            exactly like real FAANG rounds.
          </p>

          <p className="mt-6 text-lg text-neutral-500 max-w-2xl mx-auto">
            We’re still building and polishing this feature to ensure it
            delivers real value — thank you for your patience.
          </p>
        </div>

        {/* Feature List – clean stacked cards */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-md",
                "transition-all duration-300 ease-out",
                "hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-900/20 hover:scale-[1.015] hover:bg-neutral-900/50",
                "animate-fade-in-up",
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-6">
                  <div
                    className={cn(
                      "shrink-0 p-4 rounded-xl bg-gradient-to-br text-white",
                      index % 2 === 0
                        ? "from-amber-500 to-orange-600"
                        : "from-orange-500 to-amber-600",
                    )}
                  >
                    <Sparkles className="h-7 w-7" />
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-amber-200 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA – Suggestion / Waitlist */}
        <div className="mt-32 text-center animate-fade-in-up animation-delay-600">
          <div className="inline-flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-amber-400" />
            <h3 className="text-3xl md:text-4xl font-bold text-amber-100">
              Help Us Build It Right
            </h3>
          </div>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
            What would make AI Mock Interviews the ultimate preparation tool for
            you? Feature ideas, must-haves, pain points — we’re listening.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="h-12 px-10 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-900/40 hover:shadow-amber-800/60 transition-all duration-300 ease-out hover:scale-105 active:scale-95 group"
            >
              Suggest a Feature
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-12 px-10 border-amber-700/60 text-amber-300 hover:bg-amber-950/40 hover:border-amber-600/60 hover:text-amber-200 transition-all duration-300 ease-out hover:scale-105 active:scale-95"
            >
              Join Early Access Waitlist
            </Button>
          </div>

          <p className="mt-8 text-sm text-neutral-500">
            Your input directly shapes what we ship next. Thank you.
          </p>
        </div>
      </div>
    </div>
  );
}
