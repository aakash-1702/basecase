"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Web Speech API types (not in standard TypeScript libs)
// Defining specific event interfaces so that TypeScript can correctly infer arguments without throwing errors.
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Return type for our custom speech recognition hook.
// Encapsulates state and controls that a component may need to manage dictation.
interface UseSpeechRecognitionReturn {
  transcript: string; // The recognized text
  isListening: boolean; // Indicates if the microphone is currently active and listening
  isSupported: boolean; // Indicates if the browser supports Speech Recognition
  startListening: () => void; // Function to begin listening
  stopListening: () => void; // Function to manually stop listening
  resetTranscript: () => void; // Clear current recognized track
  error: string | null; // Latest error string, or null
}

/**
 * A custom React hook that integrates the Web Speech API (`SpeechRecognition`).
 * Provides methods for initiating, stopping, and handling continuous speech-to-text functionality.
 * Automatically reconciles intermediate (interim) and finalized recognized sentences.
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  // --- STATE HOOKS ---
  // Store the fully recognized and interim text combined.
  const [transcript, setTranscript] = useState("");
  // Local active listening state
  const [isListening, setIsListening] = useState(false);
  // Whether the Web Speech API is present in the current browser
  const [isSupported, setIsSupported] = useState(true);
  // Captures specific errors (e.g., mic blocked) for the UI to display
  const [error, setError] = useState<string | null>(null);

  // --- REF HOOKS ---
  // Maintain a reference to the active SpeechRecognition instance without causing re-renders
  const recognitionRef = useRef<any>(null);
  // Stores the strictly finalized portions of spoken transcripts to help append newly streamed words
  const finalTranscriptRef = useRef("");

  // --- EFFECT HOOK: Initialization & Event Attachment ---
  // Runs once on component mount to detect support and wire up event handlers
  useEffect(() => {
    // Guards against running on server (SSR/Next.js)
    if (typeof window === "undefined") {
      setIsSupported(false);
      return;
    }

    // Determine standard API or WebKit-prefixed fallback (common in Chrome/Safari)
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    // Fail gracefully if API is totally unsupported in this browser
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    // Instantiate and configure the recognition service
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Keep listening even if the user pauses
    recognition.interimResults = true; // Fetch results that aren't finalized yet (for live streaming effect)
    recognition.lang = "en-US"; // Standard language focus

    // --- EVENT: onresult ---
    // Triggered constantly as speech chunks are analyzed
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      // Iterate through historical and latest results to build the coherent string
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Permanently commit finalized sentences/phrases
          finalText += result[0].transcript;
        } else {
          // Append what the engine thinks the user is saying right now
          interimText += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      setTranscript(finalText + interimText); // State update combines both
    };

    // --- EVENT: onerror ---
    // Handle permissions logic, network issues, or lack of hardware
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

    // --- EVENT: onend ---
    // Browser engines (especially Safari/Chrome) aggressively stop recognition after brief silence.
    // If we're technically still in "listening mode" (isListening=true), restart it transparently.
    recognition.onend = () => {
      // Browser kills recognition after silence even with continuous=true
      // Auto-restart if we're still supposed to be listening
      if (recognitionRef.current && isListening) {
        try {
          // Attempt to boot it back up immediately
          recognition.start();
        } catch {
          // Already started or other issue — ignore
        }
      }
    };

    // Keep the instance within reference scope for control methods (start/stop) to access
    recognitionRef.current = recognition;

    // --- CLEANUP ---
    return () => {
      if (recognitionRef.current) {
        try {
          // Safely stop background processes to free hardware resources when unmounted
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors on cleanup
        }
      }
    };
  }, []); // Empty dependency array ensures we initialize this standard handler exactly once per mount

  // --- CALLBACK HOOK: startListening ---
  // Exposes to the component a heavily cached function indicating clear intent to activate the mic.
  // Using useCallback prevents triggering unnecessary re-renders in children consuming this function.
  const startListening = useCallback(() => {
    // Abort if no instance/hardware is available
    if (!recognitionRef.current || !isSupported) return;

    // Reset localized states to start fresh
    setError(null);
    setIsListening(true);
    finalTranscriptRef.current = "";
    setTranscript("");

    // Initiate the native API instance
    try {
      recognitionRef.current.start();
    } catch {
      // Already started, ignore
    }
  }, [isSupported]);

  // --- CALLBACK HOOK: stopListening ---
  // Exposes to the component a mechanism to kill recording (typically attached to a 'Stop' button).
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setIsListening(false); // Flags it explicitly off, preventing the auto-restart loop in `onend`

    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped, ignore
    }
  }, []);

  // --- CALLBACK HOOK: resetTranscript ---
  // Allow manual erasure of the captured text buffer without restarting hardware logic.
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
