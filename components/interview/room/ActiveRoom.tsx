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

  const recognitionRef = useRef<any>(null);
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

    // Append user message
    const userMessage: TranscriptMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: capturedText.trim(),
      timestamp: Date.now(),
    };
    setTranscript((prev) => [...prev, userMessage]);
    setTurnState("processing");

    // Send to API
    try {
      const res = await fetch(
        `/api/interview/${interviewId}/join-interview/room`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userResponse: capturedText.trim() }),
        },
      );
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Something went wrong. Please try again.");
        setTurnState("idle");
        return;
      }

      // Append AI response (farewell or next question)
      const aiMessage: TranscriptMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: json.data.nextQuestion,
        timestamp: Date.now(),
      };
      setTranscript((prev) => [...prev, aiMessage]);

      // ── Ending / Complete ──
      if (json.data.isEnding || json.data.isComplete) {
        setIsComplete(true);

        // Fire end-interview exactly once
        if (!hasEndedRef.current) {
          hasEndedRef.current = true;

          toast.loading("Processing your interview...", {
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
                "Interview ended successfully. Your report will be generated shortly.",
                { id: "end-interview" },
              );
              router.push("/interview");
            } else {
              toast.error(
                "Failed to end interview. Please try again.",
                { id: "end-interview" },
              );
            }
          } catch {
            toast.error(
              "Failed to end interview. Please try again.",
              { id: "end-interview" },
            );
          }
        }

        setTurnState("idle");
        return;
      }

      // ── Normal turn — play audio, show mic only after it ends ──
      if (json.data.audioData) {
        try {
          // Cleanup previous audio
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }

          const audio = new Audio(
            `data:audio/wav;base64,${json.data.audioData}`,
          );
          audioRef.current = audio;

          // Keep turnState as "processing" — mic stays hidden
          audio.onended = () => {
            setTurnState("idle");
          };

          audio.onerror = () => {
            setTurnState("idle");
          };

          await audio.play();
        } catch {
          // Autoplay blocked or other error — still allow mic
          setTurnState("idle");
        }
      } else {
        setTurnState("idle");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setTurnState("idle");
    }
  }, [interviewId, liveTranscript]);

  // ── Derive AI panel state ──
  const aiState =
    turnState === "listening"
      ? "waiting"
      : turnState === "processing"
        ? "processing"
        : "asking";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes orbBreath {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.04); }
        }

        @keyframes recordPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
        }

        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.2); opacity: 0.3; }
          50%       { transform: scaleY(1);   opacity: 0.7; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .interview-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .interview-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .interview-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
        }
      `,
        }}
      />

      <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
        {/* Top Bar */}
        <RoomTopBar config={config} onExitClick={onExitClick} />

        {/* Main Split — 50/50 */}
        <div className="flex-1 flex overflow-hidden max-w-[1700px] w-full mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6 gap-4 md:gap-6 pb-24">
          {/* Left 50%: AI + User stacked */}
          <div className="hidden md:flex flex-col w-1/2 gap-4">
            {/* AI Panel */}
            <div
              className="flex-1 rounded-[24px] overflow-hidden relative"
              style={{
                background: "#0c0c0c",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <AIPanel state={aiState} />
            </div>

            {/* User Panel */}
            <div
              className="flex-1 rounded-[24px] overflow-hidden relative"
              style={{
                background: "#0c0c0c",
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <UserPanel
                userName="You"
                liveTranscript={liveTranscript}
                turnState={turnState}
              />
            </div>
          </div>

          {/* Right 50%: Transcript */}
          <div
            className="flex flex-col w-full md:w-1/2 h-full overflow-hidden rounded-[24px] relative"
            style={{
              background: "#0c0c0c",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
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
    </>
  );
}
