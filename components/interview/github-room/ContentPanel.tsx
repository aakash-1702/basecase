"use client";

import { useEffect, useRef } from "react";

export interface TranscriptEntry {
  id: string;
  role: "ai" | "user";
  text: string;
  isFollowup?: boolean;
}

interface ContentPanelProps {
  currentQuestion: string;
  isFollowup: boolean;
  transcript: TranscriptEntry[];
  isStreaming: boolean; // AI is currently streaming response
  streamingText: string; // text being streamed in real-time
}

export function ContentPanel({
  currentQuestion,
  isFollowup,
  transcript,
  isStreaming,
  streamingText,
}: ContentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript, streamingText]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Current Question Display (~30%) ── */}
      <div
        style={{
          flex: "0 0 30%",
          padding: "28px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: "#3a3a3a",
              textTransform: "uppercase",
            }}
          >
            Current Question
          </span>
          {isFollowup && (
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "9px",
                letterSpacing: "0.06em",
                padding: "2px 8px",
                borderRadius: 4,
                background: "rgba(249,115,22,0.1)",
                color: "#f97316",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            >
              Follow-up
            </span>
          )}
        </div>

        {/* Question text */}
        <div
          key={currentQuestion}
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "20px",
            color: "#f0f0f0",
            lineHeight: 1.6,
            maxWidth: 640,
            animation: "ghMessageFadeIn 400ms ease backwards",
          }}
        >
          {currentQuestion || (
            <div
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#2a2a2a",
                fontStyle: "italic",
              }}
            >
              Waiting for the interviewer...
            </div>
          )}
        </div>
      </div>

      {/* ── Transcript Feed (~70%) ── */}
      <div
        ref={scrollRef}
        className="interview-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px",
        }}
      >
        {/* Transcript entries */}
        {transcript.length === 0 && !isStreaming && (
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#2a2a2a",
              fontStyle: "italic",
              textAlign: "center",
              paddingTop: 40,
            }}
          >
            Conversation will appear here...
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {transcript.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent:
                  entry.role === "ai" ? "flex-start" : "flex-end",
                animation: "ghMessageFadeIn 300ms ease backwards",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "14px 18px",
                  borderRadius: 10,
                  background:
                    entry.role === "ai"
                      ? "#161616"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${entry.role === "ai" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {/* Role label */}
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color:
                      entry.role === "ai"
                        ? "rgba(249,115,22,0.6)"
                        : "#525252",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background:
                        entry.role === "ai"
                          ? "rgba(249,115,22,0.5)"
                          : "#525252",
                      display: "inline-block",
                    }}
                  />
                  {entry.role === "ai" ? "AI" : "You"}
                </div>

                {/* Text */}
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "13px",
                    color:
                      entry.role === "ai" ? "#d4d4d4" : "#a3a3a3",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {entry.text}
                </div>
              </div>
            </div>
          ))}

          {/* Active AI streaming bubble */}
          {isStreaming && streamingText && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                animation: "ghMessageFadeIn 300ms ease backwards",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "14px 18px",
                  borderRadius: 10,
                  background: "#161616",
                  border: "1px solid rgba(249,115,22,0.1)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(249,115,22,0.6)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "rgba(249,115,22,0.5)",
                      display: "inline-block",
                    }}
                  />
                  AI
                </div>
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
                </div>
              </div>
            </div>
          )}

          {/* AI thinking dots */}
          {isStreaming && !streamingText && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 10,
                  background: "#161616",
                  border: "1px solid rgba(255,255,255,0.04)",
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
                      animation: "ghDotBounce 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
