"use client";

import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "@/types/interview-room";

interface TranscriptAreaProps {
  messages: TranscriptMessage[];
  isProcessing: boolean;
}

export function TranscriptArea({ messages, isProcessing }: TranscriptAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or processing state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isProcessing]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes messageFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes dotBounceTranscript {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
      `}} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto interview-scrollbar"
        style={{ padding: "32px 36px" }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#2a2a2a",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}
        >
          TRANSCRIPT
        </div>

        {/* Empty state */}
        {messages.length === 0 && !isProcessing && (
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "14px",
              color: "#2a2a2a",
              fontStyle: "italic",
              paddingTop: "40px",
              textAlign: "center",
            }}
          >
            Waiting for your interviewer...
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{ animation: "messageFadeIn 0.4s ease backwards" }}
            >
              {/* Role label */}
              <div
                className="flex items-center gap-2 mb-2"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: msg.role === "ai" ? "var(--amber, #f59e0b)" : "#737373",
                }}
              >
                {msg.role === "ai" ? (
                  <>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--amber, #f59e0b)" }}
                    />
                    Interviewer
                  </>
                ) : (
                  <>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "#525252" }}
                    />
                    You
                  </>
                )}
              </div>

              {/* Message text */}
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "14px",
                  color: msg.role === "ai" ? "#d4d4d4" : "#a3a3a3",
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                  paddingLeft: "12px",
                  borderLeft: msg.role === "ai"
                    ? "2px solid rgba(245,158,11,0.2)"
                    : "2px solid rgba(255,255,255,0.06)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* AI thinking indicator */}
          {isProcessing && (
            <div style={{ animation: "messageFadeIn 0.3s ease backwards" }}>
              <div
                className="flex items-center gap-2 mb-2"
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--amber, #f59e0b)",
                }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--amber, #f59e0b)" }}
                />
                Interviewer
              </div>
              <div
                className="flex items-center gap-1.5"
                style={{
                  paddingLeft: "12px",
                  borderLeft: "2px solid rgba(245,158,11,0.2)",
                  height: "28px",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      background: "rgba(245,158,11,0.5)",
                      animation: `dotBounceTranscript 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer for scroll padding */}
        <div className="h-8" />
      </div>
    </>
  );
}
