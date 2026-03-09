"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AIPanel } from "./AIPanel";
import { UserPanel } from "./UserPanel";
import { RoomTopBar } from "./RoomTopBar";
import { TranscriptArea } from "./TranscriptArea";
import { EndSessionModal } from "./EndSessionModal";
import { CompletionOverlay } from "./CompletionOverlay";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type {
  InterviewConfig,
  Phase,
  HistoryTurn,
} from "@/types/interview-room";

interface InterviewRoomProps {
  interviewId: string;
  config: InterviewConfig;
  userName?: string;
}

export function InterviewRoom({
  interviewId,
  config,
  userName = "User",
}: InterviewRoomProps) {
  const router = useRouter();

  // Core state
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentMessage, setCurrentMessage] = useState("");
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");
  const [showEndModal, setShowEndModal] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");

  // Hooks
  const {
    transcript,
    isListening,
    isSupported: isSTTSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: sttError,
  } = useSpeechRecognition();

  const { playAudio, isPlaying, needsManualPlay, triggerManualPlay } =
    useAudioPlayer();

  // Fetch greeting on mount
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await fetch(
          `/api/interview/${interviewId}/join-interview`,
          {
            method: "POST",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch greeting");
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || "Failed to start interview");
        }

        const { greetingMessage, audio } = json.data;
        setCurrentMessage(greetingMessage);
        setPhase("speaking");

        // Play greeting audio if available
        if (audio) {
          await playAudio(audio);
        }

        setPhase("answering");
      } catch {
        setPhase("error");
        setErrorMessage(
          "Unable to load your interview room. Please refresh the page.",
        );
        setCanRetry(false);
      }
    };

    fetchGreeting();
  }, [interviewId, playAudio]);

  // Handle STT errors
  useEffect(() => {
    if (sttError && phase === "recording") {
      setPhase("error");
      setErrorMessage(sttError);
      setCanRetry(true);
    }
  }, [sttError, phase]);

  // Start recording handler
  const handleStartRecording = useCallback(() => {
    resetTranscript();
    startListening();
    setPhase("recording");
  }, [resetTranscript, startListening]);

  // Stop recording handler
  const handleStopRecording = useCallback(async () => {
    stopListening();

    // Wait 300ms for STT to finalize
    await new Promise((resolve) => setTimeout(resolve, 300));

    const capturedText = transcript.trim();

    if (!capturedText) {
      // Nothing captured - don't submit
      setPhase("answering");
      return;
    }

    setFinalTranscript(capturedText);
    setPhase("submitting");

    // Submit the answer
    await submitAnswer(capturedText);
  }, [stopListening, transcript]);

  // Submit answer to backend
  const submitAnswer = async (answer: string) => {
    try {
      const res = await fetch(
        `/api/interview/${interviewId}/join-interview/room`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userResponse: answer }),
        },
      );

      if (res.status === 401) {
        router.push("/auth");
        return;
      }

      if (res.status === 404) {
        setPhase("error");
        setErrorMessage(
          "Your session has expired. Please end this interview and start a new one.",
        );
        setCanRetry(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to get response");
      }

      const { nextQuestion, audioData, isComplete } = json.data;

      if (isComplete) {
        // Push final turn to history
        setHistory((prev) => [
          ...prev,
          { aiMessage: currentMessage, userAnswer: answer },
        ]);
        setCurrentMessage(nextQuestion);
        setPhase("complete");

        // Play closing message if audio available
        if (audioData) {
          await playAudio(audioData);
        }

        return;
      }

      // Normal turn - push to history
      setHistory((prev) => [
        ...prev,
        { aiMessage: currentMessage, userAnswer: answer },
      ]);
      setCurrentMessage(nextQuestion);
      resetTranscript();
      setFinalTranscript("");
      setPhase("speaking");

      // Play audio response
      if (audioData) {
        await playAudio(audioData);
      }

      setPhase("answering");
    } catch {
      setPhase("error");
      setErrorMessage(
        "Something went wrong on our end. Your answer was heard — tap retry to continue.",
      );
      setLastAnswer(answer);
      setCanRetry(true);
    }
  };

  // Retry handler
  const handleRetry = useCallback(() => {
    setErrorMessage("");
    setPhase("submitting");
    submitAnswer(lastAnswer);
  }, [lastAnswer]);

  // End session handler
  const handleEndSession = useCallback(() => {
    setShowEndModal(false);
    router.push("/interview");
  }, [router]);

  return (
    <>
      {/* Global styles for animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes orbBreath {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50%       { opacity: 0.9; transform: scale(1.05); }
            }
            @keyframes recordPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
              50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
            }
            @keyframes wavePulse {
              0%, 100% { transform: scaleY(0.15); opacity: 0.2; }
              50%       { transform: scaleY(1); opacity: 0.6; }
            }
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes shimmer {
              0%   { background-position: -400px 0; }
              100% { background-position: 400px 0; }
            }
          `,
        }}
      />

      <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
        {/* Loading state */}
        {phase === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "2px solid rgba(255,255,255,0.1)",
                borderTopColor: "rgba(245,158,11,0.5)",
                borderRadius: "50%",
                animation: "spinnerRotate 1s linear infinite",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "13px",
                color: "#3a3a3a",
                marginTop: "16px",
              }}
            >
              Connecting to your interview room...
            </p>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes spinnerRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `,
              }}
            />
          </div>
        )}

        {/* Main room layout */}
        {phase !== "loading" && (
          <>
            {/* Top Bar */}
            <RoomTopBar
              config={config}
              phase={phase}
              onEndSessionClick={() => setShowEndModal(true)}
            />

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - 280px fixed */}
              <div
                className="hidden md:flex flex-col shrink-0"
                style={{ width: "280px" }}
              >
                {/* AI Section - top 50% */}
                <div className="flex-1">
                  <AIPanel phase={phase} />
                </div>

                {/* User Section - bottom 50% */}
                <div className="flex-1">
                  <UserPanel
                    userName={userName}
                    phase={phase}
                    isSTTSupported={isSTTSupported}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                  />
                </div>
              </div>

              {/* Right Panel - flex-1 */}
              <div className="flex-1 overflow-hidden">
                <TranscriptArea
                  phase={phase}
                  currentMessage={currentMessage}
                  liveTranscript={
                    phase === "recording" ? transcript : finalTranscript
                  }
                  history={history}
                  errorMessage={errorMessage}
                  canRetry={canRetry}
                  onRetry={handleRetry}
                  needsManualPlay={needsManualPlay}
                  onManualPlay={triggerManualPlay}
                />
              </div>
            </div>

            {/* Mobile mic button (visible only on mobile) */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2">
              {(phase === "answering" || phase === "recording") &&
                isSTTSupported && (
                  <button
                    onClick={
                      phase === "answering"
                        ? handleStartRecording
                        : handleStopRecording
                    }
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "14px",
                      color: phase === "answering" ? "#0a0a0a" : "#f59e0b",
                      background:
                        phase === "answering" ? "#f59e0b" : "transparent",
                      border:
                        phase === "answering"
                          ? "none"
                          : "1px solid rgba(245,158,11,0.5)",
                      borderRadius: "8px",
                      padding: "14px 32px",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {phase === "answering" ? "🎙 Speak" : "■ Done"}
                  </button>
                )}
            </div>
          </>
        )}

        {/* End Session Modal */}
        <EndSessionModal
          isOpen={showEndModal}
          onClose={() => setShowEndModal(false)}
          onConfirm={handleEndSession}
        />

        {/* Completion Overlay */}
        <CompletionOverlay
          isVisible={phase === "complete"}
          interviewId={interviewId}
        />
      </div>
    </>
  );
}
