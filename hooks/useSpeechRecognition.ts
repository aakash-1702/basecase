"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Web Speech API types (not in standard TypeScript libs)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  // Initialize on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
      setTranscript(finalText + interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorCode = event.error;

      // Map error codes to user-friendly messages
      switch (errorCode) {
        case "not-allowed":
          setError("Microphone access denied. Allow mic and refresh.");
          setIsListening(false);
          break;
        case "network":
          setError(
            "Speech recognition blocked. Try Chrome or disable Brave Shields.",
          );
          setIsListening(false);
          break;
        case "no-speech":
          // Silent reset - user just paused, not an error
          break;
        case "audio-capture":
          setError("No microphone found. Please connect one.");
          setIsListening(false);
          break;
        case "aborted":
          // Intentional abort, not an error
          break;
        default:
          setError("Voice input error. Please try again.");
          setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Browser kills recognition after silence even with continuous=true
      // Auto-restart if we're still supposed to be listening
      if (recognitionRef.current && isListening) {
        try {
          recognition.start();
        } catch {
          // Already started or other issue — ignore
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors on cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setError(null);
    setIsListening(true);
    finalTranscriptRef.current = "";
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch {
      // Already started, ignore
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setIsListening(false);

    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped, ignore
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
