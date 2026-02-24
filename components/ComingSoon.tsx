"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lightbulb,
  Bug,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeedback, type Importance } from "../hooks/useFeedback";

// ─── Static data ───────────────────────────────────────────────────────────────

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

const CATEGORIES: {
  icon: React.ElementType;
  label: string;
  value: Importance;
}[] = [
  { icon: Lightbulb, label: "Feature Idea", value: "feature" },
  { icon: Bug, label: "Pain Point", value: "pain" },
  { icon: Star, label: "Must Have", value: "must" },
  { icon: Zap, label: "Nice to Have", value: "nice" },
];

// ─── Toast ─────────────────────────────────────────────────────────────────────

type ToastVariant = "loading" | "success" | "error";

interface ToastData {
  variant: ToastVariant;
  title: string;
  sub?: string;
  key: number;
}

function Toast({ variant, title, sub }: Omit<ToastData, "key">) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border",
        "animate-in slide-in-from-bottom-4 duration-300",
        variant === "loading" && "bg-neutral-900 border-amber-700/50",
        variant === "success" && "bg-neutral-900 border-emerald-600/40",
        variant === "error" && "bg-neutral-900 border-red-700/50",
      )}
    >
      {variant === "loading" && (
        <Loader2 className="h-5 w-5 animate-spin text-amber-400 shrink-0" />
      )}
      {variant === "success" && (
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
      )}
      {variant === "error" && (
        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
      )}

      <div>
        <p
          className={cn(
            "text-sm font-semibold leading-tight",
            variant === "loading" && "text-amber-200",
            variant === "success" && "text-emerald-200",
            variant === "error" && "text-red-200",
          )}
        >
          {title}
        </p>
        {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── useToast ──────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (data: Omit<ToastData, "key">, autoDismissMs = 3500) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...data, key: Date.now() });
    if (data.variant !== "loading") {
      timer.current = setTimeout(() => setToast(null), autoDismissMs);
    }
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  };

  return { toast, show, hide };
}

// ─── Feedback Drawer ────────────────────────────────────────────────────────────

function FeedbackDrawer({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState<Importance>("feature");
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast, show: showToast, hide: hideToast } = useToast();
  const { status, errorMessage, submit, reset } = useFeedback();

  const isSubmitting = status === "loading";

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  // Mirror status → toast
  useEffect(() => {
    if (status === "loading") {
      showToast({
        variant: "loading",
        title: "Posting suggestion…",
        sub: "Hang tight",
      });
    } else if (status === "success") {
      showToast(
        {
          variant: "success",
          title: "Thanks for the feedback!",
          sub: "It shapes what we build next",
        },
        3500,
      );
      setShowSuccess(true);
      onSuccess();
    } else if (status === "error" && errorMessage) {
      showToast(
        { variant: "error", title: "Couldn't submit.", sub: errorMessage },
        4000,
      );
    }
  }, [status, errorMessage]);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    await submit({ message: text.trim(), importance: category });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setShowSuccess(false);
      setText("");
      setCategory("feature");
      hideToast();
      reset();
    }, 400);
  };

  return (
    <>
      {toast && (
        <Toast
          key={toast.key}
          variant={toast.variant}
          title={toast.title}
          sub={toast.sub}
        />
      )}

      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={cn(
          "fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100]",
          "bg-neutral-950 border-t border-neutral-800/80",
          "rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.7)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "max-h-[90vh] overflow-y-auto",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        <div className="px-6 pt-4 pb-12 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">
                Share Your Thoughts
              </h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Your input shapes what we build next
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showSuccess ? (
            /* ── Success screen ── */
            <div className="py-12 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                You're awesome.
              </h3>
              <p className="text-neutral-400 max-w-sm mx-auto mb-8">
                Thanks for helping us build something truly useful. Every
                suggestion gets read.
              </p>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Close
              </Button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-6">
              {/* Category chips */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 block">
                  Type of feedback
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(({ icon: Icon, label, value }) => (
                    <button
                      key={value}
                      onClick={() => setCategory(value)}
                      disabled={isSubmitting}
                      className={cn(
                        "flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-sm font-medium",
                        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                        category === value
                          ? "border-amber-600/70 bg-amber-950/50 text-amber-200 shadow-lg shadow-amber-900/20"
                          : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          category === value
                            ? "text-amber-400"
                            : "text-neutral-500",
                        )}
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 block">
                  Your suggestion
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="What would make AI mock interviews indispensable for your prep? Be as specific as you want…"
                    rows={5}
                    maxLength={2000}
                    className={cn(
                      "w-full resize-none rounded-xl px-4 py-3 text-sm",
                      "bg-neutral-900 border border-neutral-800",
                      "text-neutral-100 placeholder:text-neutral-600",
                      "focus:outline-none focus:border-amber-700/60 focus:ring-2 focus:ring-amber-900/30",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-colors duration-200",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute bottom-3 right-3 text-xs select-none transition-colors",
                      text.length > 1800
                        ? "text-amber-500"
                        : "text-neutral-600",
                    )}
                  >
                    {text.length} / 2000
                  </span>
                </div>

                {/* Inline API error */}
                {status === "error" && errorMessage && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                className={cn(
                  "w-full h-12 font-semibold text-base",
                  "bg-gradient-to-r from-amber-600 to-orange-600",
                  "hover:from-amber-500 hover:to-orange-500",
                  "shadow-lg shadow-amber-900/30 hover:shadow-amber-800/50",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Waitlist Button ────────────────────────────────────────────────────────────

function WaitlistButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const { toast, show: showToast } = useToast();

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");
    showToast({
      variant: "loading",
      title: "Joining waitlist…",
      sub: "Just a moment",
    });
    // 🔌 Replace with your real waitlist API call when ready
    await new Promise((r) => setTimeout(r, 1600));
    setState("done");
    showToast(
      {
        variant: "success",
        title: "You're on the list!",
        sub: "We'll notify you when it launches",
      },
      4000,
    );
  };

  return (
    <>
      {toast && (
        <Toast
          key={toast.key}
          variant={toast.variant}
          title={toast.title}
          sub={toast.sub}
        />
      )}
      <Button
        size="lg"
        variant="outline"
        onClick={handleClick}
        disabled={state !== "idle"}
        className={cn(
          "h-12 px-10 transition-all duration-300 ease-out",
          state === "idle"
            ? "border-amber-700/60 text-amber-300 hover:bg-amber-950/40 hover:border-amber-600/60 hover:text-amber-200 hover:scale-105 active:scale-95"
            : state === "loading"
              ? "border-neutral-700 text-neutral-400 cursor-not-allowed opacity-70"
              : "border-emerald-700/50 text-emerald-300 bg-emerald-950/30 cursor-not-allowed opacity-90",
        )}
      >
        {state === "loading" && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {state === "done" && (
          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
        )}
        {state === "idle"
          ? "Join Early Access Waitlist"
          : state === "loading"
            ? "Joining…"
            : "You're on the List!"}
      </Button>
    </>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AIMockInterviewComingSoon() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  return (
    <>
      <FeedbackDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => setFeedbackDone(true)}
      />

      <div className="min-h-screen bg-neutral-950 text-neutral-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-amber-950/5 to-neutral-950 pointer-events-none" />
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[900px] h-[600px] bg-amber-500/4 rounded-full blur-3xl animate-pulse opacity-60" />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 py-20 md:py-32">
          {/* Hero */}
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
              We're still building and polishing this feature to ensure it
              delivers real value — thank you for your patience.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={cn(
                  "border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-md",
                  "transition-all duration-300 ease-out animate-fade-in-up",
                  "hover:border-amber-700/50 hover:shadow-xl hover:shadow-amber-900/20 hover:scale-[1.015] hover:bg-neutral-900/50",
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
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
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

          {/* CTA */}
          <div className="mt-32 text-center animate-fade-in-up animation-delay-600">
            <div className="inline-flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-amber-400" />
              <h3 className="text-3xl md:text-4xl font-bold text-amber-100">
                Help Us Build It Right
              </h3>
            </div>

            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
              What would make AI Mock Interviews the ultimate preparation tool
              for you? Feature ideas, must-haves, pain points — we're listening.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              {/* Suggest — locks permanently after submit */}
              {feedbackDone ? (
                <Button
                  size="lg"
                  disabled
                  className="h-12 px-10 bg-neutral-800/60 border border-neutral-700 text-neutral-400 cursor-not-allowed opacity-80"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                  Feedback Submitted
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setDrawerOpen(true)}
                  className={cn(
                    "h-12 px-10 group",
                    "bg-gradient-to-r from-amber-600 to-orange-600",
                    "hover:from-amber-500 hover:to-orange-500",
                    "shadow-lg shadow-amber-900/40 hover:shadow-amber-800/60",
                    "transition-all duration-300 ease-out hover:scale-105 active:scale-95",
                  )}
                >
                  Suggest a Feature
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              )}

              <WaitlistButton />
            </div>

            <p className="mt-8 text-sm text-neutral-500">
              Your input directly shapes what we ship next. Thank you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
