"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InterviewRoom } from "@/components/interview/shared/InterviewRoom";

function RoomContent() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [contextLabel, setContextLabel] = useState("Technical Interview");
  const [creditsRemaining, setCreditsRemaining] = useState(3);

  // Read session data stored before navigation to ready page
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = sessionStorage.getItem(`interview_session_${interviewId}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.repoName) setContextLabel(data.repoName);
        if (typeof data.credits === "number") setCreditsRemaining(data.credits);
      }
    } catch {
      // Non-critical — defaults are fine
    }
  }, [interviewId]);

  return (
    <InterviewRoom
      interviewId={interviewId}
      contextLabel={contextLabel}
      creditsRemaining={creditsRemaining}
      onInterviewEnd={() => router.push("/interview")}
    />
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
