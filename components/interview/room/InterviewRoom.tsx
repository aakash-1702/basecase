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
    isSupported: isSTTSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: sttError,
  } = useSpeechRecognition();

  const { playAudio, needsManualPlay, triggerManualPlay } = useAudioPlayer();

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

  // STT errors while recording surface as a retryable error state (derived, no extra render pass)
  const sttFailedWhileRecording = Boolean(sttError) && phase === "recording";
  const effectivePhase: Phase = sttFailedWhileRecording ? "error" : phase;
  const effectiveErrorMessage = sttFailedWhileRecording ? (sttError ?? "") : errorMessage;
  const effectiveCanRetry = sttFailedWhileRecording ? true : canRetry;

  // Submit answer to backend
  const submitAnswer = useCallback(
    async (answer: string) => {
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
    },
    [interviewId, router, currentMessage, playAudio, resetTranscript],
  );

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
  }, [stopListening, transcript, submitAnswer]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setErrorMessage("");
    setPhase("submitting");
    submitAnswer(lastAnswer);
  }, [lastAnswer, submitAnswer]);

  // End session handler
  const handleEndSession = useCallback(() => {
    setShowEndModal(false);
    router.push("/interview");
  }, [router]);

  const micVisible =
    (effectivePhase === "answering" || effectivePhase === "recording") && isSTTSupported;

  return (
    <div
      data-interview-room="active"
      className="flex h-screen w-full flex-col overflow-hidden"
    >
      {/* Loading state */}
      {effectivePhase === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center" role="status" aria-live="polite">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="mt-4 font-mono text-[13px] text-fg-muted">
            Connecting to your interview room...
          </p>
        </div>
      )}

      {/* Main room layout */}
      {effectivePhase !== "loading" && (
        <>
          {/* Top Bar */}
          <RoomTopBar
            config={config}
            phase={effectivePhase}
            onEndSessionClick={() => setShowEndModal(true)}
          />

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - 280px fixed */}
            <div className="hidden w-[280px] shrink-0 flex-col border-r border-line bg-surface md:flex">
              {/* AI Section - top 50% */}
              <div className="flex-1">
                <AIPanel phase={effectivePhase} />
              </div>

              {/* User Section - bottom 50% */}
              <div className="flex-1">
                <UserPanel
                  userName={userName}
                  phase={effectivePhase}
                  isSTTSupported={isSTTSupported}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
              </div>
            </div>

            {/* Right Panel - flex-1 */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <TranscriptArea
                phase={effectivePhase}
                currentMessage={currentMessage}
                liveTranscript={
                  effectivePhase === "recording" ? transcript : finalTranscript
                }
                history={history}
                errorMessage={effectiveErrorMessage}
                canRetry={effectiveCanRetry}
                onRetry={handleRetry}
                needsManualPlay={needsManualPlay}
                onManualPlay={triggerManualPlay}
              />
            </div>
          </div>

          {/* Mobile mic button (visible only on mobile) */}
          {micVisible && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
              <button
                type="button"
                onClick={
                  effectivePhase === "answering"
                    ? handleStartRecording
                    : handleStopRecording
                }
                className={
                  effectivePhase === "answering"
                    ? "btn btn-primary px-8 font-mono"
                    : "btn btn-outline-accent px-8 font-mono"
                }
              >
                {effectivePhase === "answering" ? "🎙 Speak" : "■ Done"}
              </button>
            </div>
          )}
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
        isVisible={effectivePhase === "complete"}
        interviewId={interviewId}
      />
    </div>
  );
}
