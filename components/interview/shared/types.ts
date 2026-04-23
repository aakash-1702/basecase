export type InterviewState =
  | "ai-speaking"
  | "user-speaking"
  | "processing"
  | "idle"
  | "ended";

export interface TranscriptMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
}

export interface InterviewConfig {
  interviewId: string;
  contextLabel: string;
  creditsRemaining: number;
}
