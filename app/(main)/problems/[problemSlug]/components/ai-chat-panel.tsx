"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIFeatureId } from "../types";

interface AIChatPanelProps {
  feature: AIFeatureId;
  onClose: () => void;
  creditsRemaining: number;
}

const PLACEHOLDERS: Record<AIFeatureId, string> = {
  hint: "Describe where you're stuck, get a nudge…",
  review: "Paste your solution here for a full review…",
  chat: "Ask anything about this problem…",
};

const EMPTY_MESSAGES: Record<AIFeatureId, string> = {
  hint: "Describe where you're stuck — I'll nudge you in the right direction without spoiling the solution.",
  review:
    "Paste your code. I'll give feedback on correctness, time/space complexity, and style.",
  chat: "Ask anything — edge cases, why this pattern works, alternative approaches, etc.",
};

export const AIChatPanel = React.memo(function AIChatPanel({
  feature,
  onClose,
  creditsRemaining,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setMessages((m) => [
      ...m,
      {
        role: "ai",
        text: "This is a simulated AI response. In production this calls POST /api/ai/:feature with the problem slug + message.",
      },
    ]);
    setLoading(false);
    // Real: await fetch(`/api/ai/${feature}`, { method:"POST", body: JSON.stringify({ slug: problem.slug, message: msg }) })
  }, [input, loading]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(249,115,22,0.25)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {creditsRemaining} credits remaining
        </span>
        <button
          onClick={onClose}
          className="text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="px-4 py-3 space-y-2.5 max-h-[200px] overflow-y-auto">
        {messages.length === 0 && (
          <p className="sans text-sm text-zinc-600 italic leading-relaxed">
            {EMPTY_MESSAGES[feature]}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "sans text-sm leading-relaxed px-3 py-2.5 rounded-xl",
              msg.role === "user" ? "ml-6" : "mr-6",
            )}
            style={{
              background:
                msg.role === "user"
                  ? "rgba(249,115,22,0.1)"
                  : "rgba(255,255,255,0.04)",
              border:
                msg.role === "user"
                  ? "1px solid rgba(249,115,22,0.2)"
                  : "1px solid rgba(255,255,255,0.07)",
              color: msg.role === "user" ? "#fb923c" : "#d4d4d8",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-zinc-600 px-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="mono text-[10px]">Thinking…</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex gap-2 items-end">
          <textarea
            className="sans flex-1 bg-transparent text-sm text-zinc-300 placeholder:text-zinc-700 outline-none resize-none leading-relaxed"
            placeholder={PLACEHOLDERS[feature]}
            value={input}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="shrink-0 p-2 rounded-xl transition-all duration-200"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg,#f97316,#ea580c)"
                : "rgba(255,255,255,0.04)",
              color: input.trim() ? "#000" : "#3f3f46",
            }}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
