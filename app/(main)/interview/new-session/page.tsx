"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LobbyScreen } from "@/components/interview/room/LobbyScreen";
import { PreparingScreen } from "@/components/interview/room/PreparingScreen";
import { ActiveRoom } from "@/components/interview/room/ActiveRoom";

type Stage = "lobby" | "preparing" | "active";

export default function InterviewSessionPage() {
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("lobby");

  // Get config from search params
  const config = {
    company: searchParams.get("company") || "Google",
    mode: searchParams.get("mode") || "technical",
    questions: parseInt(searchParams.get("questions") || "8"),
    difficulty: searchParams.get("difficulty") || "senior",
    stack: ["React", "Node.js", "Redis", "PostgreSQL"], // Mock stack
  };

  const handleJoin = () => {
    setStage("preparing");
  };

  const handleReady = () => {
    setStage("active");
  };

  if (stage === "lobby") {
    return <LobbyScreen config={config} onJoin={handleJoin} />;
  }

  if (stage === "preparing") {
    return <PreparingScreen onReady={handleReady} />;
  }

  return (
    <ActiveRoom
      sessionId="demo-session"
      userName="Akash"
      questionCount={config.questions}
    />
  );
}
