"use client";

type AIState = "speaking" | "thinking" | "listening";
type UserState = "recording" | "ready";

interface ParticipantsPanelProps {
  aiState: AIState;
  userState: UserState;
  isSpeakDisabled: boolean;
  isRecording: boolean;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
}

export function ParticipantsPanel({
  aiState,
  userState,
  isSpeakDisabled,
  isRecording,
  onStartSpeaking,
  onStopSpeaking,
}: ParticipantsPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* ── AI Interviewer Zone (~45%) ── */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "9px",
            letterSpacing: "0.25em",
            color: "#3a3a3a",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          AI Interviewer
        </div>

        {/* Avatar with concentric rings */}
        <div
          style={{
            position: "relative",
            width: 88,
            height: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${aiState === "speaking" ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.04)"}`,
              animation:
                aiState === "speaking"
                  ? "ghSpeakingRing 1.5s ease-in-out infinite"
                  : "none",
              transition: "border-color 300ms ease",
            }}
          />
          {/* Middle ring */}
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              border: `1px solid ${aiState === "speaking" ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.03)"}`,
              animation:
                aiState === "speaking"
                  ? "ghSpeakingRing 1.5s ease-in-out 0.3s infinite"
                  : "none",
              transition: "border-color 300ms ease",
            }}
          />
          {/* Core orb */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background:
                aiState === "speaking"
                  ? "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0.1) 70%, transparent 100%)"
                  : aiState === "thinking"
                    ? "radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(249,115,22,0.06) 70%, transparent 100%)"
                    : "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.03) 70%, transparent 100%)",
              animation:
                aiState === "speaking"
                  ? "ghOrbBreathe 1.5s ease-in-out infinite"
                  : aiState === "thinking"
                    ? "ghOrbBreathe 2.5s ease-in-out infinite"
                    : "none",
              transition: "background 300ms ease",
            }}
          />
        </div>

        {/* State indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background:
                aiState === "speaking"
                  ? "#f97316"
                  : aiState === "thinking"
                    ? "#71717a"
                    : "#3a3a3a",
              animation:
                aiState === "thinking"
                  ? "ghOrbBreathe 2s ease-in-out infinite"
                  : "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color:
                aiState === "speaking"
                  ? "#f97316"
                  : aiState === "thinking"
                    ? "#71717a"
                    : "#3a3a3a",
              letterSpacing: "0.06em",
            }}
          >
            {aiState === "speaking"
              ? "Speaking..."
              : aiState === "thinking"
                ? "Thinking..."
                : "Listening..."}
          </span>
        </div>
      </div>

      {/* ── Speak Button Junction (~10%) ── */}
      <div
        style={{
          flex: "0 0 10%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
        }}
      >
        {isRecording ? (
          <button
            onClick={onStopSpeaking}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 28px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.15)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.4)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              animation: "ghRecordPulse 2s ease-in-out infinite",
              letterSpacing: "0.04em",
              transition: "all 200ms ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Speaking
          </button>
        ) : (
          <button
            onClick={onStartSpeaking}
            disabled={isSpeakDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 28px",
              borderRadius: 8,
              background: "transparent",
              color: isSpeakDisabled ? "#3a3a3a" : "#f97316",
              border: `1px solid ${isSpeakDisabled ? "rgba(255,255,255,0.06)" : "rgba(249,115,22,0.5)"}`,
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: isSpeakDisabled ? "not-allowed" : "pointer",
              opacity: isSpeakDisabled ? 0.5 : 1,
              letterSpacing: "0.04em",
              transition: "all 200ms ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            Start Speaking
          </button>
        )}
      </div>

      {/* ── User Zone (~45%) ── */}
      <div
        style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontFamily: "var(--font-dm-mono)",
            fontSize: "9px",
            letterSpacing: "0.25em",
            color: "#3a3a3a",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          You
        </div>

        {/* User avatar */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: userState === "recording" ? "rgba(34,211,238,0.08)" : "#141414",
            border:
              userState === "recording"
                ? "1.5px solid rgba(34,211,238,0.4)"
                : "1.5px solid rgba(255,255,255,0.08)",
            animation:
              userState === "recording"
                ? "ghUserBreathe 2s ease-in-out infinite"
                : "none",
            transition: "all 300ms ease",
          }}
        >
          {/* Mic icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={userState === "recording" ? "#22d3ee" : "#525252"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 300ms ease" }}
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>

        {/* State indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: userState === "recording" ? "#22d3ee" : "#3a3a3a",
              transition: "background 200ms ease",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: userState === "recording" ? "#22d3ee" : "#3a3a3a",
              letterSpacing: "0.06em",
              transition: "color 200ms ease",
            }}
          >
            {userState === "recording" ? "Listening..." : "Ready"}
          </span>
        </div>

        {/* Waveform when recording */}
        {userState === "recording" && (
          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: 3,
              height: 20,
              marginTop: 16,
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  height: "100%",
                  background: "rgba(34,211,238,0.4)",
                  animation: "ghWavePulse 0.8s ease-in-out infinite",
                  animationDelay: `${i * 0.07}s`,
                  transformOrigin: "bottom",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
