"use client";
import React, { useState, useEffect, useRef } from "react";

const InterviewClient = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseActive, setPulseActive] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sample question for testing
  const question =
    "Tell me about a challenging project you've worked on and how you overcame the obstacles.";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        network:
          "Speech recognition is blocked in Brave. Go to brave://settings/privacy and disable 'Block fingerprinting', or try Chrome.",
        "not-allowed": "Microphone access denied.",
        "no-speech": "No speech detected. Try again.",
        "audio-capture": "No microphone found.",
      };

      setError(errorMessages[event.error] || `Error: ${event.error}`);
      setIsSpeaking(false);
    };

    recognition.onend = () => {
      setIsSpeaking(false);
      setPulseActive(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setIsSpeaking(true);
    setPulseActive(true);
    setTranscript("");
    setError(null);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsSpeaking(false);
    setPulseActive(false);
  };

  return (
    <div style={styles.page}>
      {/* Subtle grid background */}
      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge}>INTERVIEW SESSION</span>
          <div style={styles.liveIndicator}>
            <span
              style={{
                ...styles.liveDot,
                ...(isSpeaking ? styles.liveDotActive : {}),
              }}
            />
            <span style={styles.liveText}>
              {isSpeaking ? "RECORDING" : "STANDBY"}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div style={styles.questionCard}>
          <p style={styles.questionLabel}>Q&nbsp;&nbsp;/&nbsp;&nbsp;01</p>
          <p style={styles.questionText}>{question}</p>
        </div>

        {/* Transcript Area */}
        <div style={styles.transcriptBox}>
          {transcript ? (
            <p style={styles.transcriptText}>{transcript}</p>
          ) : (
            <p style={styles.transcriptPlaceholder}>
              {isSpeaking
                ? "Listening to your answer..."
                : "Your answer will appear here once you start speaking."}
            </p>
          )}

          {/* Animated waveform when speaking */}
          {isSpeaking && (
            <div style={styles.waveform}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.waveBar,
                    animationDelay: `${i * 0.08}s`,
                    height: `${Math.random() * 20 + 8}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>⚠ &nbsp;{error}</div>}

        {/* Controls */}
        <div style={styles.controls}>
          {!isSpeaking ? (
            <button style={styles.startBtn} onClick={startListening}>
              <span style={styles.micIcon}>🎙</span>
              Start Answering
            </button>
          ) : (
            <button style={styles.stopBtn} onClick={stopListening}>
              <span style={styles.stopIcon}>■</span>
              Done Answering
            </button>
          )}
        </div>

        {/* Footer hint */}
        <p style={styles.hint}>
          Speak clearly — click{" "}
          <strong style={{ color: "#f59e0b" }}>Done Answering</strong> when
          finished.
        </p>
      </div>

      <style>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Mono', monospace",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: "680px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "fadeIn 0.5s ease both",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    color: "#f59e0b",
    fontWeight: 500,
    border: "1px solid rgba(245,158,11,0.3)",
    padding: "4px 10px",
    borderRadius: "2px",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#444",
    transition: "background-color 0.3s",
  },
  liveDotActive: {
    backgroundColor: "#f59e0b",
    animation: "pulse 1.5s infinite",
  },
  liveText: {
    fontSize: "11px",
    letterSpacing: "0.15em",
    color: "#555",
  },
  questionCard: {
    backgroundColor: "#111",
    border: "1px solid #222",
    borderLeft: "3px solid #f59e0b",
    borderRadius: "6px",
    padding: "24px 28px",
  },
  questionLabel: {
    fontSize: "11px",
    color: "#f59e0b",
    letterSpacing: "0.15em",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  questionText: {
    fontSize: "18px",
    color: "#f5f5f5",
    lineHeight: "1.65",
    fontFamily: "'DM Serif Display', serif",
    margin: 0,
  },
  transcriptBox: {
    backgroundColor: "#0f0f0f",
    border: "1px solid #1e1e1e",
    borderRadius: "6px",
    padding: "24px",
    minHeight: "150px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px",
  },
  transcriptText: {
    fontSize: "15px",
    color: "#e5e5e5",
    lineHeight: "1.7",
    margin: 0,
  },
  transcriptPlaceholder: {
    fontSize: "14px",
    color: "#333",
    fontStyle: "italic",
    margin: 0,
    lineHeight: "1.6",
  },
  waveform: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "32px",
  },
  waveBar: {
    width: "3px",
    backgroundColor: "#f59e0b",
    borderRadius: "2px",
    animation: "wavePulse 0.8s ease-in-out infinite",
    opacity: 0.8,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#f87171",
    letterSpacing: "0.02em",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
  },
  startBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f59e0b",
    color: "#0a0a0a",
    border: "none",
    borderRadius: "4px",
    padding: "14px 32px",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  stopBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "transparent",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
    borderRadius: "4px",
    padding: "14px 32px",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    fontFamily: "'DM Mono', monospace",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  micIcon: {
    fontSize: "16px",
  },
  stopIcon: {
    fontSize: "12px",
  },
  hint: {
    textAlign: "center",
    fontSize: "12px",
    color: "#333",
    margin: 0,
    letterSpacing: "0.03em",
  },
};

export default InterviewClient;
