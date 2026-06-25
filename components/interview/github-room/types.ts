// Shared types for the GitHub Interview v2 flow

export type InterviewState =
  | "ai-speaking"   // audio is playing, UI locked
  | "idle"          // waiting for user to click Start Speaking
  | "user-speaking" // Web Speech API recording
  | "processing"    // response sent, awaiting SSE
  | "ended";        // interview confirmed ended

export type StepState = "pending" | "active" | "completed";

export type TranscriptMessage = {
  id: string;            // crypto.randomUUID()
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;     // Date.now()
};

export type IcebreakerData = {
  text: string;
  audio: string;         // base64-encoded WAV
  credits: number;
};
