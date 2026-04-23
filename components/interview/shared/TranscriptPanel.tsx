"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptMessage } from "./types";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  streamingText: string;
  isStreaming: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ label, bg }: { label: string; bg: string }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: bg,
        fontSize: "10px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--font-dm-mono)",
      }}
    >
      {label}
    </div>
  );
}

export function TranscriptPanel({
  messages,
  streamingText,
  isStreaming,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);
  const [showPill, setShowPill] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    isUserScrolledUpRef.current = !atBottom;
    if (atBottom) setShowPill(false);
  };

  useEffect(() => {
    if (!scrollRef.current) return;

    if (isUserScrolledUpRef.current) {
      const frame = requestAnimationFrame(() => setShowPill(true));
      return () => cancelAnimationFrame(frame);
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    isUserScrolledUpRef.current = false;
    setShowPill(false);
  };

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10b981",
            animation: "ghOrbBreathe 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "12px",
            fontWeight: 500,
            color: "#a3a3a3",
            letterSpacing: "0.04em",
          }}
        >
          Live Transcript
        </span>
      </div>

      {/* ── Scrollable Feed ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="interview-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: "20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#2a2a2a",
                textAlign: "center",
              }}
            >
              The interview will appear here as it progresses.
            </p>
          </div>
        )}

        {/* ── Message Bubbles ── */}
        {messages.map((msg) => {
          const isAI = msg.role === "interviewer";

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                justifyContent: isAI ? "flex-start" : "flex-end",
                animation: "ghMessageFadeIn 250ms ease-out both",
              }}
            >
              {isAI && <Avatar label="AI" bg="rgba(99,102,241,0.6)" />}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxWidth: "85%",
                  alignItems: isAI ? "flex-start" : "flex-end",
                }}
              >
                {/* Role label */}
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: isAI ? "#818cf8" : "#34d399",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isAI ? "Interviewer" : "You"}
                </span>

                {/* Bubble */}
                <div
                  style={{
                    background: isAI ? "#1a1a1a" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isAI ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: isAI
                      ? "2px 12px 12px 12px"
                      : "12px 2px 12px 12px",
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "13px",
                      color: isAI ? "#d4d4d4" : "#a3a3a3",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "9px",
                    color: "#3a3a3a",
                    letterSpacing: "0.04em",
                  }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              {!isAI && <Avatar label="You" bg="rgba(16,185,129,0.6)" />}
            </div>
          );
        })}

        {/* ── Active streaming bubble ── */}
        {isStreaming && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              justifyContent: "flex-start",
              animation: "ghMessageFadeIn 250ms ease-out both",
            }}
          >
            <Avatar label="AI" bg="rgba(99,102,241,0.6)" />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxWidth: "85%",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "#818cf8",
                  letterSpacing: "0.04em",
                }}
              >
                Interviewer
              </span>

              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(249,115,22,0.12)",
                  borderRadius: "2px 12px 12px 12px",
                  padding: "12px 16px",
                }}
              >
                {streamingText ? (
                  <div
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "13px",
                      color: "#d4d4d4",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {streamingText}
                    <span
                      style={{
                        animation: "ghv2CursorBlink 1s step-end infinite",
                        color: "#f97316",
                        marginLeft: 1,
                      }}
                    >
                      |
                    </span>
                  </div>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "rgba(249,115,22,0.4)",
                          animation: `ghDotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height: 8, flexShrink: 0 }} />
      </div>

      {/* ── New message pill ── */}
      {showPill && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={scrollToBottom}
            style={{
              background: "#6366f1",
              color: "#fff",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              animation: "ghv2FadeIn 200ms ease-out both",
              transition: "background 150ms ease",
            }}
          >
            ↓ New message
          </button>
        </div>
      )}
    </div>
  );
}
