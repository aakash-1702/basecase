"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AIPanel } from "./AIPanel";
import { UserPanel } from "./UserPanel";
import { RoomTopBar } from "./RoomTopBar";
import { TranscriptArea } from "./TranscriptArea";
import { BottomControlBar } from "./BottomControlBar";
import type {
  InterviewConfig,
  TranscriptMessage,
  TurnState,
} from "@/types/interview-room";

/* Minimal Web Speech API surface we rely on (the constructor isn't in lib.dom). */
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

interface ActiveRoomProps {
  greetingMessage: string;
  greetingAudio?: string | null;
  interviewId: string;
  config: InterviewConfig;
  onExitClick?: () => void;
}

export function ActiveRoom({
  greetingMessage,
  greetingAudio,
  interviewId,
  config,
  onExitClick,
}: ActiveRoomProps) {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [turnState, setTurnState] = useState<TurnState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const isListeningRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasEndedRef = useRef(false);

  // ── Play greeting audio helper ──
  const playAudio = useCallback((base64: string) => {
    try {
      // Cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
      };

      audio.play().catch(() => {
        // Autoplay blocked - user can still see the message
        URL.revokeObjectURL(url);
      });
    } catch {
      // Silently fail - message is still visible
    }
  }, []);

  // ── Greeting display with 2s delay + audio ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setTranscript([
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: greetingMessage,
          timestamp: Date.now(),
        },
      ]);

      // Play greeting audio if available
      if (greetingAudio) {
        playAudio(greetingAudio);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [greetingMessage, greetingAudio, playAudio]);

  // ── Cleanup audio on unmount ──
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, []);

  // ── Initialize Web Speech API ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
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

    recognition.onerror = (event) => {
      // Only abort on fatal errors, not silence/no-speech
      if (event.error === "no-speech" || event.error === "aborted") return;
      isListeningRef.current = false;
      setTurnState("idle");
      setLiveTranscript("");
    };

    recognition.onend = () => {
      // Browser kills recognition after silence even with continuous=true.
      // Auto-restart if we're still supposed to be listening.
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started or other issue — ignore
        }
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // ── Start listening ──
  const startListening = useCallback(() => {
    isListeningRef.current = true;
    setTurnState("listening");
    setLiveTranscript("");
    finalTranscriptRef.current = "";
    try {
      recognitionRef.current?.start();
    } catch {
      // Already started, ignore
    }
  }, []);

  // ── Ordered SSE queue: stores { text, audio } keyed by seq ──
  const chunkQueueRef = useRef<
    Map<number, { text: string; audio: string | null }>
  >(new Map());
  const nextSeqRef = useRef(0);
  const isPlayingQueueRef = useRef(false);
  const queueDoneRef = useRef(false);
  const onQueueDrainRef = useRef<(() => void) | null>(null);

  const drainAudioQueue = useCallback(function drain() {
    if (isPlayingQueueRef.current) return;

    const chunk = chunkQueueRef.current.get(nextSeqRef.current);
    // undefined means this seq hasn't arrived yet — wait
    if (chunk === undefined) {
      if (queueDoneRef.current) {
        onQueueDrainRef.current?.();
        onQueueDrainRef.current = null;
      }
      return;
    }

    chunkQueueRef.current.delete(nextSeqRef.current);
    nextSeqRef.current += 1;

    // Emit text in seq order — right before playing its audio
    setTranscript((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai" as const,
        text: chunk.text,
        timestamp: Date.now(),
      },
    ]);

    // If TTS failed for this chunk, skip audio and move on
    if (!chunk.audio) {
      drain();
      return;
    }

    isPlayingQueueRef.current = true;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const el = new Audio(`data:audio/wav;base64,${chunk.audio}`);
      audioRef.current = el;

      el.onended = () => {
        isPlayingQueueRef.current = false;
        drain();
      };
      el.onerror = () => {
        isPlayingQueueRef.current = false;
        drain();
      };
      el.play().catch(() => {
        isPlayingQueueRef.current = false;
        drain();
      });
    } catch {
      isPlayingQueueRef.current = false;
      drain();
    }
  }, []);

  // ── Stop listening and send ──
  const stopListening = useCallback(async () => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();

    const capturedText = finalTranscriptRef.current || liveTranscript;
    setLiveTranscript("");

    if (!capturedText.trim()) {
      setTurnState("idle");
      return;
    }

    // Append user message immediately
    const userMessage: TranscriptMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: capturedText.trim(),
      timestamp: Date.now(),
    };
    setTranscript((prev) => [...prev, userMessage]);
    setTurnState("processing");

    // Reset queue state for this turn
    chunkQueueRef.current = new Map();
    nextSeqRef.current = 0;
    isPlayingQueueRef.current = false;
    queueDoneRef.current = false;
    onQueueDrainRef.current = null;

    try {
      const res = await fetch(
        `/api/interview/${interviewId}/join-interview/room`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userResponse: capturedText.trim() }),
        },
      );

      if (!res.ok || !res.body) {
        toast.error("Something went wrong. Please try again.");
        setTurnState("idle");
        return;
      }

      // ── SSE stream reader ──
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Metadata collected from the `done` event
      const streamMeta = { isComplete: false, isEnding: false };

      const processLine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        try {
          const payload = JSON.parse(line.slice(6));

          if (payload.type === "chunk") {
            // Buffer text + audio together, keyed by seq — drain emits text in order
            chunkQueueRef.current.set(payload.seq, {
              text: payload.text,
              audio: payload.audio ?? null,
            });
            drainAudioQueue();
          } else if (payload.type === "done") {
            streamMeta.isComplete = payload.isComplete ?? false;
            streamMeta.isEnding = payload.isEnding ?? false;
            queueDoneRef.current = true;
            // Try drain in case all audio already arrived
            drainAudioQueue();
          } else if (payload.type === "error") {
            toast.error(payload.message || "Stream error. Please try again.");
          }
        } catch {
          // Malformed SSE line — ignore
        }
      };

      // Read the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newline
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          for (const line of part.split("\n")) {
            processLine(line.trim());
          }
        }
      }

      // Flush any remaining buffer
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) {
          processLine(line.trim());
        }
      }

      // ── Wait for queue to drain before changing state ──
      await new Promise<void>((resolve) => {
        if (
          !isPlayingQueueRef.current &&
          chunkQueueRef.current.size === 0 &&
          queueDoneRef.current
        ) {
          resolve();
        } else {
          onQueueDrainRef.current = resolve;
          drainAudioQueue();
          setTimeout(resolve, 30_000);
        }
      });

      // ── Handle completion ──
      if (streamMeta.isEnding || streamMeta.isComplete) {
        setIsComplete(true);

        if (!hasEndedRef.current) {
          hasEndedRef.current = true;

          toast.loading("Generating your report...", {
            id: "end-interview",
          });

          try {
            const endRes = await fetch(
              `/api/interview/${interviewId}/exit-interview`,
              { method: "PATCH" },
            );
            const endJson = await endRes.json();

            if (endRes.ok && endJson.success) {
              toast.success(
                "Interview complete! Your report is being generated.",
                { id: "end-interview" },
              );
              router.push(`/interview`);
            } else {
              toast.error("Failed to end interview. Please try again.", {
                id: "end-interview",
              });
            }
          } catch {
            toast.error("Failed to end interview. Please try again.", {
              id: "end-interview",
            });
          }
        }

        setTurnState("idle");
        return;
      }

      setTurnState("idle");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setTurnState("idle");
    }
  }, [interviewId, liveTranscript, drainAudioQueue, router]);

  // ── Derive AI panel state ──
  const aiState =
    turnState === "listening"
      ? "waiting"
      : turnState === "processing"
        ? "processing"
        : "asking";

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Top Bar */}
      <RoomTopBar config={config} onExitClick={onExitClick} />

      {/* Main Split — 50/50 */}
      <div className="mx-auto flex w-full max-w-[1700px] flex-1 gap-4 overflow-hidden px-4 py-4 pb-24 md:gap-6 md:px-8 md:py-6 lg:px-12">
        {/* Left 50%: AI + User stacked */}
        <div className="hidden w-1/2 flex-col gap-4 md:flex">
          <div className="card-base relative flex-1 overflow-hidden rounded-3xl">
            <AIPanel state={aiState} />
          </div>
          <div className="card-base relative flex-1 overflow-hidden rounded-3xl">
            <UserPanel
              userName="You"
              liveTranscript={liveTranscript}
              turnState={turnState}
            />
          </div>
        </div>

        {/* Right 50%: Transcript */}
        <div className="card-base relative flex h-full w-full flex-col overflow-hidden rounded-3xl md:w-1/2">
          <TranscriptArea
            messages={transcript}
            isProcessing={turnState === "processing"}
          />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <BottomControlBar
        turnState={turnState}
        onStart={startListening}
        onStop={stopListening}
        isComplete={isComplete}
      />
    </div>
  );
}
