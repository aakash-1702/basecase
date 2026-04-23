"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AIInterviewerCard } from "./AIInterviewerCard";
import { CompletionOverlay } from "./CompletionOverlay";
import { EndInterviewModal } from "./EndInterviewModal";
import { InterviewNavbar } from "./InterviewNavbar";
import { SpeakButton } from "./SpeakButton";
import { TranscriptPanel } from "./TranscriptPanel";
import { UserCard } from "./UserCard";
import { extractBase64Audio } from "./audio";
import type { InterviewState, TranscriptMessage } from "./types";
import { useAudioQueue } from "./useAudioQueue";
import { useBlockNavigation } from "./useBlockNavigation";
import { useRouter } from "next/navigation";

interface InterviewRoomProps {
  interviewId: string;
  contextLabel: string;
  creditsRemaining: number;
  onInterviewEnd?: () => void;
}

export function InterviewRoom({
  interviewId,
  contextLabel,
  creditsRemaining,
  onInterviewEnd,
}: InterviewRoomProps) {
  const router = useRouter();

  /* ── State ── */
  const [interviewState, setInterviewState] =
    useState<InterviewState>("processing");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  /* ── Refs ── */
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const liveTranscriptRef = useRef("");
  const isListeningRef = useRef(false);
  const wordTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wordOffsetMsRef = useRef(0);
  const isMountedRef = useRef(true);
  const icebreakerFired = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { enqueue, getContext, onQueueEnd, stopAll } = useAudioQueue();


  /* ── Navigation guards ── */
  useBlockNavigation(interviewState !== "ended", () => {
    setShowEndModal(true);
  });

  /* ── Speech support check ── */
  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  }, []);

  /* ── Helpers ── */
  const clearWordTimers = useCallback(() => {
    wordTimersRef.current.forEach(clearTimeout);
    wordTimersRef.current = [];
    wordOffsetMsRef.current = 0;
  }, []);

  const appendInterviewerWords = useCallback((chunk: string) => {
    const words = chunk.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const baseDelay = wordOffsetMsRef.current;
    words.forEach((word, index) => {
      const timer = setTimeout(
        () => {
          if (!isMountedRef.current) return;
          setStreamingText((prev) => `${prev}${word} `);
        },
        baseDelay + index * 60,
      );
      wordTimersRef.current.push(timer);
    });

    wordOffsetMsRef.current += words.length * 60;
  }, []);

  /* ── Mount / unmount ── */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearWordTimers();
      stopAll();
    };
  }, [clearWordTimers, stopAll]);

  /* ── Initialize Web Speech API ── */
  useEffect(() => {
    if (!speechSupported || typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }

      if (finalText) transcriptRef.current += finalText;
      liveTranscriptRef.current = `${transcriptRef.current}${interimText}`;
      setLiveTranscript(liveTranscriptRef.current);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      isListeningRef.current = false;
      if (isMountedRef.current) {
        setInterviewState("idle");
        setLiveTranscript("");
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [speechSupported]);

  /* ── Send response to backend (SSE) ── */
  const sendResponseToBackend = useCallback(
    async (userResponse: string) => {
      setInterviewState("processing");
      setIsStreaming(true);
      setStreamingText("");
      clearWordTimers();

      // Cancel any previous in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulatedContent = "";
      let nextStep: string | null = null;

      try {
        const res = await fetch(`/api/interview/${interviewId}/room`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId, userResponse }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setInterviewState("idle");
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const processSseEvent = (eventBlock: string) => {
          const lines = eventBlock
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const dataLine = lines.find((l) => l.startsWith("data: "));
          if (!dataLine) return;

          try {
            const payload = JSON.parse(dataLine.slice(6));

            if (payload.type === "audio") {
              setInterviewState("ai-speaking");

              const textChunk =
                typeof payload.text === "string" ? payload.text.trim() : "";
              if (textChunk) {
                appendInterviewerWords(textChunk);
                accumulatedContent += `${accumulatedContent ? " " : ""}${textChunk}`;
              }

              const audioChunk = extractBase64Audio(payload.audio);
              if (audioChunk) enqueue(audioChunk);
              return;
            }

            if (payload.type === "done") {
              nextStep = payload.nextStep ?? null;

              onQueueEnd(() => {
                if (!isMountedRef.current) return;

                clearWordTimers();
                if (accumulatedContent.trim()) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: "interviewer",
                      content: accumulatedContent.trim(),
                      timestamp: Date.now(),
                    },
                  ]);
                }

                setStreamingText("");
                setIsStreaming(false);

                if (nextStep === "interview-completed") {
                  setInterviewState("ended");
                } else {
                  setInterviewState("idle");
                }
              });
              return;
            }

            if (payload.type === "error") {
              setInterviewState("idle");
              setIsStreaming(false);
            }
          } catch {
            // Malformed SSE event — skip
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const eventBlocks = buffer.split("\n\n");
          buffer = eventBlocks.pop() ?? "";
          eventBlocks.forEach(processSseEvent);
        }

        if (buffer.trim()) {
          processSseEvent(buffer.trim());
        }
      } catch (err: unknown) {
        // Ignore aborts (component unmounted or new request superseded this one)
        if (err instanceof Error && err.name === "AbortError") return;
        if (isMountedRef.current) {
          setInterviewState("idle");
          setIsStreaming(false);
        }
      }
    },
    [appendInterviewerWords, clearWordTimers, enqueue, interviewId, onQueueEnd],
  );

  /* ── Icebreaker bootstrap ── */
  useEffect(() => {
    if (!interviewId || interviewId === "undefined") return;
    if (icebreakerFired.current) return;
    icebreakerFired.current = true;

    // Ensure AudioContext is ready (user gesture from "Join Interview Room" should have unlocked it)
    getContext();

    // Fire the first PATCH with empty userResponse to get icebreaker audio via SSE
    sendResponseToBackend("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Start Speaking ── */
  const handleStartSpeaking = useCallback(() => {
    getContext();
    transcriptRef.current = "";
    liveTranscriptRef.current = "";
    isListeningRef.current = true;
    setInterviewState("user-speaking");
    setLiveTranscript("");

    try {
      recognitionRef.current?.start();
    } catch {
      // Already started
    }
  }, [getContext]);

  /* ── Stop Speaking ── */
  const handleStopSpeaking = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();

    const captured = (
      transcriptRef.current || liveTranscriptRef.current
    ).trim();
    transcriptRef.current = "";
    liveTranscriptRef.current = "";
    setLiveTranscript("");

    if (!captured) {
      setInterviewState("idle");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "candidate",
        content: captured,
        timestamp: Date.now(),
      },
    ]);

    sendResponseToBackend(captured);
  }, [sendResponseToBackend]);

  /* ── Send Text (fallback for unsupported browsers) ── */
  const handleSendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "candidate",
          content: trimmed,
          timestamp: Date.now(),
        },
      ]);

      sendResponseToBackend(trimmed);
    },
    [sendResponseToBackend],
  );

  /* ── End interview handler (from modal confirm) ── */
  const handleEndConfirmed = useCallback(() => {
    // Abort any in-flight SSE fetch and silence queued audio immediately
    abortControllerRef.current?.abort();
    stopAll();
    setInterviewState("ended");
    setShowEndModal(false);
    if (onInterviewEnd) {
      onInterviewEnd();
    } else {
      router.push(`/interview/${interviewId}/report-pending`);
    }
  }, [interviewId, onInterviewEnd, router, stopAll]);

  /* ── Render ── */
  return (
    <div
      data-interview-room="active"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "#0a0a0a",
        overflow: "hidden",
        animation: "ghv2FadeIn 400ms ease-out both",
      }}
    >
      {/* ── Completion Overlay ── */}
      <CompletionOverlay
        isVisible={interviewState === "ended"}
        interviewId={interviewId}
      />

      {/* ── Navbar ── */}
      <InterviewNavbar
        contextLabel={contextLabel}
        creditsRemaining={creditsRemaining}
        onEndInterview={() => setShowEndModal(true)}
      />

      {/* ── Main Content: 30/70 split ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* ── Left Column (30%) ── */}
        <div
          style={{
            width: "30%",
            minWidth: 260,
            maxWidth: 360,
            borderRight: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* AI Interviewer Card — top ~42% */}
          <div
            style={{
              flex: "0 0 42%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <AIInterviewerCard interviewState={interviewState} />
          </div>

          {/* Speak Controls — center ~16% */}
          <div
            style={{
              flex: "0 0 16%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px",
            }}
          >
            <SpeakButton
              interviewState={interviewState}
              speechSupported={speechSupported}
              liveTranscript={liveTranscript}
              onStartSpeaking={handleStartSpeaking}
              onStopSpeaking={handleStopSpeaking}
              onSendText={handleSendText}
            />
          </div>

          {/* User Card — bottom ~42% */}
          <div
            style={{
              flex: "0 0 42%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <UserCard interviewState={interviewState} />
          </div>
        </div>

        {/* ── Right Column (70%) — Transcript ── */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            padding: 12,
          }}
        >
          <TranscriptPanel
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* ── End Interview Modal ── */}
      <EndInterviewModal
        isOpen={showEndModal}
        interviewId={interviewId}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndConfirmed}
      />
    </div>
  );
}
