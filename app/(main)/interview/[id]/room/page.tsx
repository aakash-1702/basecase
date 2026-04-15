"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { GitHubLoadingScreen } from "@/components/interview/github-room/GitHubLoadingScreen";
import { GitHubRoomNavbar } from "@/components/interview/github-room/GitHubRoomNavbar";
import { ParticipantsPanel } from "@/components/interview/github-room/ParticipantsPanel";
import {
  ContentPanel,
  type TranscriptEntry,
} from "@/components/interview/github-room/ContentPanel";
import { GitHubCompletionOverlay } from "@/components/interview/github-room/CompletionOverlay";
import { useAudioQueue } from "@/components/interview/github-room/useAudioQueue";

type AIState = "speaking" | "thinking" | "listening";
type UserState = "recording" | "ready";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const interviewId = params.id as string;
  const repoUrl = searchParams.get("repo") || "";
  const role = searchParams.get("role") || "Full Stack";

  // Extract repo name
  const repoName = (() => {
    try {
      const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      return match ? match[1].replace(/\.git$/, "") : "Unknown Repo";
    } catch {
      return "Unknown Repo";
    }
  })();

  // ── State ──
  const [isLoading, setIsLoading] = useState(true);
  const [aiState, setAiState] = useState<AIState>("thinking");
  const [userState, setUserState] = useState<UserState>("ready");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isFollowup, setIsFollowup] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isSpeakDisabled, setIsSpeakDisabled] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const firstEventReceivedRef = useRef(false);

  const { enqueue, isPlaying, onQueueEnd, getContext } =
    useAudioQueue();

  // ── Update AI state based on audio playback ──
  useEffect(() => {
    if (isPlaying) {
      setAiState("speaking");
    }
  }, [isPlaying]);

  // ── Initialize Web Speech API ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      finalTranscriptRef.current = finalText;
      setLiveTranscript(finalText + interimText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      isListeningRef.current = false;
      setUserState("ready");
      setLiveTranscript("");
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
  }, []);

  // ── Fire SSE request ──
  const firePatchRequest = useCallback(
    async (userResponse: string) => {
      setIsStreaming(true);
      setStreamingText("");
      let accumulatedText = "";
      let isFollowupTurn = false;

      try {
        const res = await fetch(
          `/api/interview/${interviewId}/room`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interviewId, userResponse }),
          }
        );

        if (!res.ok || !res.body) {
          toast.error("Something went wrong. Please try again.");
          setAiState("listening");
          setIsSpeakDisabled(false);
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (line: string) => {
          if (!line.startsWith("data: ")) return;
          try {
            const payload = JSON.parse(line.slice(6));

            if (payload.type === "audio") {
              // First audio event → dismiss loading screen
              if (!firstEventReceivedRef.current) {
                firstEventReceivedRef.current = true;
                setIsLoading(false);
              }

              // Accumulate text
              const text = payload.text || "";
              accumulatedText += (accumulatedText ? " " : "") + text;
              setStreamingText(accumulatedText);
              setCurrentQuestion(accumulatedText);

              // Enqueue audio for playback
              if (payload.audio) {
                setAiState("speaking");
                enqueue(payload.audio);
              }
            } else if (payload.type === "done") {
              const nextStep = payload.nextStep;

              // Finalize: add AI message to transcript
              if (accumulatedText) {
                const aiEntry: TranscriptEntry = {
                  id: crypto.randomUUID(),
                  role: "ai",
                  text: accumulatedText,
                  isFollowup: isFollowupTurn,
                };
                setTranscript((prev) => [...prev, aiEntry]);
              }

              setIsStreaming(false);
              setStreamingText("");

              // Wait for audio queue to finish before enabling controls
              onQueueEnd(() => {
                if (nextStep === "interview-completed") {
                  setIsComplete(true);
                  setIsSpeakDisabled(true);
                  setAiState("listening");
                } else {
                  setAiState("listening");
                  setIsSpeakDisabled(false);
                }
              });

              if (nextStep === "follow-up") {
                isFollowupTurn = true;
                setIsFollowup(true);
              } else {
                setIsFollowup(false);
              }
            } else if (payload.type === "error") {
              toast.error(
                payload.message || "Stream error. Please try again."
              );
              setAiState("listening");
              setIsSpeakDisabled(false);
              setIsStreaming(false);
            }
          } catch {
            // Malformed SSE line
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              processLine(line.trim());
            }
          }
        }

        // Flush remaining
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            processLine(line.trim());
          }
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
        setAiState("listening");
        setIsSpeakDisabled(false);
        setIsStreaming(false);
      }
    },
    [interviewId, enqueue, onQueueEnd]
  );

  // ── Fire first PATCH on mount (ice-breaker) ──
  useEffect(() => {
    firePatchRequest("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start recording ──
  const handleStartSpeaking = useCallback(() => {
    // Ensure AudioContext is resumed (user gesture)
    getContext();

    isListeningRef.current = true;
    setUserState("recording");
    setLiveTranscript("");
    finalTranscriptRef.current = "";

    try {
      recognitionRef.current?.start();
    } catch {
      // Already started
    }
  }, [getContext]);

  // ── Stop recording and submit ──
  const handleStopSpeaking = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();

    const capturedText = finalTranscriptRef.current || liveTranscript;
    setLiveTranscript("");
    setUserState("ready");

    if (!capturedText.trim()) return;

    // Add user entry to transcript
    const userEntry: TranscriptEntry = {
      id: crypto.randomUUID(),
      role: "user",
      text: capturedText.trim(),
    };
    setTranscript((prev) => [...prev, userEntry]);

    // Disable speak and fire PATCH
    setIsSpeakDisabled(true);
    setAiState("thinking");
    firePatchRequest(capturedText.trim());
  }, [liveTranscript, firePatchRequest]);

  // ── Navigation guards ──
  useEffect(() => {
    if (isLoading) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLoading]);

  return (
    <div data-interview-room="active">
      <Toaster position="top-right" theme="dark" richColors />

      {/* Loading Screen */}
      <GitHubLoadingScreen isVisible={isLoading} />

      {/* Completion Overlay */}
      <GitHubCompletionOverlay
        isVisible={isComplete}
        interviewId={interviewId}
      />

      {/* Main Room */}
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          overflow: "hidden",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 600ms ease",
        }}
      >
        {/* Navbar */}
        <GitHubRoomNavbar repoName={repoName} userDesignation={role} />

        {/* Main content: 30/70 split */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Left: Participants (30%) */}
          <div
            style={{
              width: "30%",
              minWidth: 280,
              borderRight: "1px solid rgba(255,255,255,0.04)",
              overflow: "hidden",
            }}
          >
            <ParticipantsPanel
              aiState={aiState}
              userState={userState}
              isSpeakDisabled={isSpeakDisabled}
              isRecording={userState === "recording"}
              onStartSpeaking={handleStartSpeaking}
              onStopSpeaking={handleStopSpeaking}
            />
          </div>

          {/* Right: Content (70%) */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <ContentPanel
              currentQuestion={currentQuestion}
              isFollowup={isFollowup}
              transcript={transcript}
              isStreaming={isStreaming}
              streamingText={streamingText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GitHubRoomPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "13px",
              color: "#3a3a3a",
            }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
