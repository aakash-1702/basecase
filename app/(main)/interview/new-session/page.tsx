"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LobbyScreen } from "@/components/interview/room/LobbyScreen";
import { PreparingScreen } from "@/components/interview/room/PreparingScreen";
import { ActiveRoom } from "@/components/interview/room/ActiveRoom";
import { BrowserGateScreen } from "@/components/interview/room/BrowserGateScreen";
import { EndSessionModal } from "@/components/interview/room/EndSessionModal";
import { toast } from "sonner";
import type { InterviewConfig, PreparingStatus } from "@/types/interview-room";

type View = "lobby" | "browser-gate" | "preparing" | "room";

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
  const [preparingStatus, setPreparingStatus] =
    useState<PreparingStatus>("loading");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [greetingAudio, setGreetingAudio] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  // ── Navigation guards (active only when in "room" view) ──
  useEffect(() => {
    if (view !== "room") return;

    // Prevent tab close / refresh with native browser dialog
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome
    };

    // Capture browser back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitModal(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [view]);

  const fireJoinRequest = useCallback(async () => {
    setPreparingStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/interview/${interviewId}/join-interview`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMessage(json.message || "Failed to join interview");
        setPreparingStatus("error");
        return;
      }
      const { greetingMessage: message, audio } = json.data;
      setGreetingMessage(message);
      setGreetingAudio(audio || null);
      setPreparingStatus("ready");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setPreparingStatus("error");
    }
  }, [interviewId]);

  const handleJoin = () => {
    // Browser gate check FIRST — before anything else
    if (!checkSpeechRecognitionSupport()) {
      setView("browser-gate");
      return;
    }

    setView("preparing");
    fireJoinRequest();
  };

  const handleReady = () => {
    setView("room");
  };

  const handleRetry = () => {
    fireJoinRequest();
  };

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = async () => {
    try {
      toast.loading("Ending interview...", { id: "exit-interview" });

      // Call end session API
      const res = await fetch(`/api/interview/${interviewId}/exit-interview`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(
          json.message || "Failed to end interview. Please try again.",
          {
            id: "exit-interview",
          },
        );
        setShowExitModal(false);
        return;
      }

      toast.success("Interview ended. Your report is being generated.", {
        id: "exit-interview",
      });

      // Navigate back to interview landing — processing card will show there
      router.push(`/interview`);
    } catch (error) {
      toast.error("Failed to end interview. Please try again.", {
        id: "exit-interview",
      });
      setShowExitModal(false);
    }
  };

  const handleExitClose = () => {
    setShowExitModal(false);
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
        <PreparingScreen
          status={preparingStatus}
          onReady={handleReady}
          onRetry={handleRetry}
          errorMessage={errorMessage}
        />
      </div>
    );
  }

  return (
    <div data-interview-room="active">
      <ActiveRoom
        greetingMessage={greetingMessage}
        greetingAudio={greetingAudio}
        interviewId={interviewId}
        config={config}
        onExitClick={handleExitClick}
      />
      <EndSessionModal
        isOpen={showExitModal}
        onClose={handleExitClose}
        onConfirm={handleExitConfirm}
      />
    </div>
  );
}
