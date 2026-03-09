"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  interviewId: string;
  config: InterviewConfig;
  onExitClick?: () => void;
}

export function ActiveRoom({
  greetingMessage,
  interviewId,
  config,
  onExitClick,
}: ActiveRoomProps) {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [turnState, setTurnState] = useState<TurnState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const isListeningRef = useRef(false);

  // ── Greeting display with 2s delay ──
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [greetingMessage]);

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
        setTurnState("idle");
        return;
      }

      // Append AI response
      const aiMessage: TranscriptMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: json.data,
        timestamp: Date.now(),
      };
      setTranscript((prev) => [...prev, aiMessage]);

      if (json.isComplete) {
        setIsComplete(true);
      }

      setTurnState("idle");
    } catch {
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
