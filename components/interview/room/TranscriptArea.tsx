"use client";

import { useEffect, useRef } from "react";
import type {
  Phase,
  HistoryTurn,
  TranscriptMessage,
} from "@/types/interview-room";

// New interface for InterviewRoom
interface NewTranscriptAreaProps {
  phase: Phase;
  currentMessage: string;
  liveTranscript: string;
  history: HistoryTurn[];
  errorMessage: string;
  canRetry: boolean;
  onRetry: () => void;
  needsManualPlay: boolean;
  onManualPlay: () => void;
}

// Legacy interface for ActiveRoom
interface LegacyTranscriptAreaProps {
  messages: TranscriptMessage[];
  isProcessing: boolean;
}

type TranscriptAreaProps = Partial<NewTranscriptAreaProps> &
  Partial<LegacyTranscriptAreaProps>;

export function TranscriptArea(props: TranscriptAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect if using legacy mode
  const isLegacyMode = "messages" in props && props.messages !== undefined;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isLegacyMode ? props.messages : props.history]);

  // ==================== LEGACY MODE ====================
  if (isLegacyMode) {
    const { messages = [], isProcessing = false } = props;

    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes messageFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes dotBounceTranscript {
            0%, 80%, 100% { transform: translateY(0); }
            40%           { transform: translateY(-5px); }
          }
        `,
          }}
        />

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
                    color:
                      msg.role === "ai" ? "var(--amber, #f59e0b)" : "#737373",
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
                    borderLeft:
                      msg.role === "ai"
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

  // ==================== NEW MODE ====================
  const {
    phase = "answering",
    currentMessage = "",
    liveTranscript = "",
    history = [],
    errorMessage = "",
    canRetry = false,
    onRetry = () => {},
    needsManualPlay = false,
    onManualPlay = () => {},
  } = props;

  // Phase indicator text
  const getPhaseIndicator = () => {
    switch (phase) {
      case "speaking":
        return { text: "● speaking...", color: "rgba(245,158,11,0.5)" };
      case "submitting":
        return { text: "● processing...", color: "#3a3a3a" };
      case "recording":
        return { text: "● listening...", color: "rgba(245,158,11,0.4)" };
      default:
        return null;
    }
  };

  // Message opacity based on phase
  const getMessageOpacity = () => {
    switch (phase) {
      case "recording":
        return 0.7;
      case "submitting":
        return 0.5;
      default:
        return 1;
    }
  };

  const phaseIndicator = getPhaseIndicator();

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{
        padding: "32px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.06) transparent",
      }}
    >
      {/* Current Message Section */}
      <div
        style={{
          animation: "fadeSlideUp 300ms ease",
          marginBottom: "24px",
        }}
      >
        {/* Label row */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "12px" }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "9px",
              letterSpacing: "0.15em",
              color: "#2a2a2a",
            }}
          >
            AI
          </span>
          {phaseIndicator && (
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "9px",
                color: phaseIndicator.color,
              }}
            >
              {phaseIndicator.text}
            </span>
          )}
        </div>

        {/* Message text or shimmer skeleton */}
        {phase === "loading" ? (
          // Shimmer skeleton
          <div className="space-y-3">
            <div
              style={{
                height: "22px",
                width: "80%",
                background:
                  "linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)",
                backgroundSize: "800px 100%",
                animation: "shimmer 1.5s infinite linear",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                height: "22px",
                width: "60%",
                background:
                  "linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)",
                backgroundSize: "800px 100%",
                animation: "shimmer 1.5s infinite linear",
                animationDelay: "0.2s",
                borderRadius: "4px",
              }}
            />
          </div>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: "22px",
              color: "#f0f0f0",
              lineHeight: 1.65,
              maxWidth: "680px",
              opacity: getMessageOpacity(),
              transition: "opacity 200ms",
            }}
          >
            {currentMessage}
          </p>
        )}

        {/* Manual play button if autoplay blocked */}
        {needsManualPlay && (
          <button
            onClick={onManualPlay}
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "rgba(245,158,11,0.6)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginTop: "12px",
              padding: 0,
            }}
          >
            ▶ Play response
          </button>
        )}
      </div>

      {/* Live Answer Block */}
      <div
        style={{
          minHeight: "100px",
          borderLeft: "2px solid rgba(255,255,255,0.05)",
          paddingLeft: "20px",
          marginBottom: "32px",
        }}
      >
        {phase === "answering" && !liveTranscript && (
          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#2a2a2a",
              fontStyle: "italic",
            }}
          >
            Click Speak when you're ready...
          </p>
        )}

        {phase === "recording" && (
          <>
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "14px",
                color: "#d4d4d4",
                lineHeight: 1.7,
              }}
            >
              {liveTranscript || "Listening..."}
            </p>

            {/* Waveform */}
            <div
              className="flex items-end"
              style={{ gap: "3px", height: "20px", marginTop: "16px" }}
            >
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "2px",
                    height: "100%",
                    background: "rgba(245,158,11,0.4)",
                    animation: "wavePulse 0.8s ease-in-out infinite",
                    animationDelay: `${i * 0.05}s`,
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {phase === "submitting" && liveTranscript && (
          <>
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "14px",
                color: "#d4d4d4",
                lineHeight: 1.7,
                opacity: 0.5,
              }}
            >
              {liveTranscript}
            </p>
            <div
              style={{
                height: "14px",
                width: "120px",
                background:
                  "linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)",
                backgroundSize: "800px 100%",
                animation: "shimmer 1.5s infinite linear",
                borderRadius: "4px",
                marginTop: "12px",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "9px",
                color: "#2a2a2a",
                display: "block",
                marginTop: "8px",
              }}
            >
              processing...
            </span>
          </>
        )}
      </div>

      {/* Error Block */}
      {phase === "error" && errorMessage && (
        <div
          style={{
            borderLeft: "2px solid rgba(244,63,94,0.3)",
            paddingLeft: "20px",
            marginBottom: "24px",
            animation: "fadeSlideUp 300ms ease",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "9px",
              color: "rgba(244,63,94,0.5)",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            unable to continue
          </span>
          <p
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#d4d4d4",
              lineHeight: 1.6,
            }}
          >
            {errorMessage}
          </p>
          {canRetry && (
            <button
              onClick={onRetry}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "#3a3a3a",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "4px",
                padding: "6px 14px",
                cursor: "pointer",
                marginTop: "12px",
                transition: "color 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#3a3a3a";
              }}
            >
              retry
            </button>
          )}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: "24px",
            marginTop: "32px",
          }}
        >
          {history.map((turn, index) => (
            <div
              key={index}
              className="transition-opacity duration-200 hover:opacity-70"
              style={{
                marginBottom: "28px",
                opacity: 0.4,
              }}
            >
              {/* AI message */}
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "12px",
                  color: "#3a3a3a",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: "#2a2a2a", marginRight: "8px" }}>AI</span>
                {turn.aiMessage}
              </div>

              {/* User answer */}
              <div
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  color: "#2a2a2a",
                  marginTop: "6px",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                ↳ {turn.userAnswer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
