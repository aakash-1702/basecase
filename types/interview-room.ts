export type InterviewConfig = {
  company: string;
  mode: "Technical" | "DSA" | "HR" | "Behavioural";
  difficulty: "Entry" | "Mid" | "Senior" | "Staff";
};

export type TranscriptMessage = {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: number;
};

export type PreparingStatus = "loading" | "ready" | "error";

export type TurnState = "idle" | "listening" | "processing";

// Phase-based state for interview room
export type Phase =
  | "loading" // fetching greeting on mount
  | "speaking" // AI audio playing, mic locked
  | "answering" // mic available, waiting for user
  | "recording" // user speaking, STT capturing
  | "submitting" // answer sent, waiting for AI response
  | "error" // something failed
  | "complete"; // interview ended

export type HistoryTurn = {
  aiMessage: string;
  userAnswer: string;
};
