"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LobbyScreen } from "@/components/interview/room/LobbyScreen";
import { BrowserGateScreen } from "@/components/interview/room/BrowserGateScreen";
import { InterviewCreationLoader } from "@/components/interview/shared/InterviewCreationLoader";
import { ReadyScreen } from "@/components/interview/shared/ReadyScreen";
import { toast as _toast } from "sonner";
import type { InterviewConfig } from "@/types/interview-room";

type View = "lobby" | "browser-gate" | "preparing" | "ready";
type ApiStatus = "pending" | "success" | "error";

/**
 * Check if browser supports Web Speech API using feature detection.
 * Does NOT use user agent sniffing.
 */
function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const interviewId = searchParams.get("interviewId") || "";
  const questions = parseInt(searchParams.get("questions") || "8");
  const config: InterviewConfig = {
    company: searchParams.get("company") || "Google",
    mode: (searchParams.get("mode") || "technical") as InterviewConfig["mode"],
    difficulty: (searchParams.get("difficulty") ||
      "senior") as InterviewConfig["difficulty"],
  };
  const lobbyConfig = { ...config, questions };

  const [view, setView] = useState<View>("lobby");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("pending");
  const [errorMessage, setErrorMessage] = useState("");



  // Derive a human-readable context label from available config
  // Declared here so fireJoinRequest captures the correct value in its closure
  const interviewContextLabel = `${config.mode} Interview — ${config.company} · ${config.difficulty}`;

  const fireJoinRequest = useCallback(async () => {
    setApiStatus("pending");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/interview/${interviewId}/join-interview`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMessage(json.message || "Failed to join interview");
        setApiStatus("error");
        return;
      }
      // Write session data so /interview/[id]/room can read it
      try {
        sessionStorage.setItem(
          `interview_session_${interviewId}`,
          JSON.stringify({
            repoName: interviewContextLabel,
            credits: 0,
          }),
        );
      } catch {
        // sessionStorage unavailable — room will use defaults
      }
      setApiStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setApiStatus("error");
    }
  }, [interviewId, interviewContextLabel]);

  const handleJoin = () => {
    // Browser gate check FIRST — before anything else
    if (!checkSpeechRecognitionSupport()) {
      setView("browser-gate");
      return;
    }

    setView("preparing");
    fireJoinRequest();
  };

  const handleRetry = () => {
    setApiStatus("pending");
    fireJoinRequest();
  };

  const handleLoaderComplete = () => {
    setView("ready");
  };

  const handleJoinRoom = () => {
    try {
      // Unlock AudioContext with this user gesture — critical for audio autoplay
      new AudioContext().resume().catch(() => {});
    } catch {
      // AudioContext not available — proceed anyway
    }
    router.push(`/interview/${interviewId}/room`);
  };


  if (view === "lobby") {
    return (
      <div data-interview-room="active">
        <LobbyScreen config={lobbyConfig} onJoin={handleJoin} />
      </div>
    );
  }

  if (view === "browser-gate") {
    return (
      <div data-interview-room="active">
        <BrowserGateScreen />
      </div>
    );
  }

  if (view === "preparing") {
    return (
      <div data-interview-room="active">
        <InterviewCreationLoader
          title="Preparing your interview"
          subtitle="Please wait while we set up your personalised session"
          steps={[
            "Validating your information",
            "Preparing interview questions",
            "Personalising your experience",
            "Creating interview room",
          ]}
          apiStatus={apiStatus}
          errorMessage={errorMessage}
          onComplete={handleLoaderComplete}
          onRetry={handleRetry}
          securityNote="Your session is encrypted and private."
        />
      </div>
    );
  }

  if (view === "ready") {
    return (
      <div data-interview-room="active">
        <ReadyScreen
          interviewContextLabel={interviewContextLabel}
          onJoin={handleJoinRoom}
        />
      </div>
    );
  }

  // Fallback (should not reach)
  return null;
}
