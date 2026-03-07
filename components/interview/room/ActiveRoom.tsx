"use client";

import { useState, useEffect } from "react";
import { AIPanel } from "./AIPanel";
import { UserPanel } from "./UserPanel";
import { RoomTopBar } from "./RoomTopBar";
import { TranscriptDrawer } from "./TranscriptDrawer";
import { EvaluationOverlay } from "./EvaluationOverlay";
import { useRouter } from "next/navigation";

const MOCK_QUESTIONS = [
  "What is the difference between a process and a thread, and when would you use one over the other?",
  "Explain how database indexing works and when you would use a composite index.",
  "How does React's reconciliation algorithm work under the hood?",
  "What is the CAP theorem? Give a real-world example of a trade-off.",
  "Describe how you would design a URL shortener like bit.ly.",
];

interface ActiveRoomProps {
  sessionId: string;
  userName: string;
  questionCount: number;
}

export function ActiveRoom({
  sessionId,
  userName,
  questionCount,
}: ActiveRoomProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState<any[]>([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const totalQuestions = Math.min(questionCount, MOCK_QUESTIONS.length);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript("");

    // Simulate transcript updating
    setTimeout(() => {
      setTranscript("I think that processes and threads are both... ");
    }, 1000);
    setTimeout(() => {
      setTranscript(
        "I think that processes and threads are both execution units, but processes have separate memory space while threads share memory within the same process...",
      );
    }, 3000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);

    // Mock API call to evaluate
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockEval = {
      evaluation:
        "Solid answer on the core distinction. You mentioned memory isolation well but missed context-switching overhead.",
      score: 7,
      followUp:
        currentQuestionIndex === 0
          ? "You mentioned threads share memory space — what synchronization problems can arise from that?"
          : null,
    };

    setCurrentEvaluation(mockEval);
    setShowEvaluation(true);

    // Add to history
    setTranscriptHistory((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer: transcript,
        score: mockEval.score,
      },
    ]);
  };

  const handleNextQuestion = () => {
    setShowEvaluation(false);
    setCurrentEvaluation(null);
    setTranscript("");

    if (currentQuestionIndex + 1 >= totalQuestions) {
      // Session complete
      router.push(`/interview/${sessionId}/report`);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleEndSession = () => {
    router.push(`/interview/${sessionId}/report`);
  };

  return (
    <div className="h-screen flex flex-col interview-ambient-bg">
      {/* Top Bar */}
      <RoomTopBar
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onEndSession={handleEndSession}
      />

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-2">
        {/* Left: AI Panel */}
        <AIPanel
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          state={isRecording ? "waiting" : "asking"}
        />

        {/* Right: User Panel */}
        <div className="relative">
          <UserPanel
            userName={userName}
            isRecording={isRecording}
            transcript={transcript}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />

          {/* Evaluation Overlay */}
          {showEvaluation && currentEvaluation && (
            <EvaluationOverlay
              evaluation={currentEvaluation.evaluation}
              score={currentEvaluation.score}
              followUp={currentEvaluation.followUp}
              onNext={handleNextQuestion}
            />
          )}
        </div>
      </div>

      {/* Transcript Drawer */}
      <TranscriptDrawer entries={transcriptHistory} />
    </div>
  );
}
