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
