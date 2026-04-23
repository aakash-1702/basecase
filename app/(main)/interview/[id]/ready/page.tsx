"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ReadyScreen } from "@/components/interview/shared/ReadyScreen";

export default function ReadyPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [contextLabel, setContextLabel] = useState("Technical Interview");
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`interview_session_${interviewId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { repoName?: string; credits?: number };
        if (parsed.repoName) setContextLabel(parsed.repoName);
        if (typeof parsed.credits === "number") setCredits(parsed.credits);
      }
    } catch {
      // sessionStorage unavailable or invalid JSON — render with defaults
    }
    setHydrated(true);
  }, [interviewId]);

  const handleJoin = () => {
    // Unlock AudioContext with this user gesture — required for audio autoplay
    try {
      new AudioContext().resume().catch(() => {});
    } catch {
      // AudioContext not available in this browser
    }
    router.push(`/interview/${interviewId}/room`);
  };

  // Render a blank dark screen until sessionStorage is read to avoid content flash
  if (!hydrated) {
    return (
      <div
        data-interview-room="active"
        style={{ minHeight: "100vh", background: "#0a0a0a" }}
      />
    );
  }

  return (
    <ReadyScreen
      interviewContextLabel={contextLabel}
      credits={credits}
      onJoin={handleJoin}
    />
  );
}
