/**
 * Shared shapes for the interview feature.
 *
 * `InterviewListItem` is one row returned by `GET /api/interview` and drives
 * the landing page cards. The remaining types describe the (legacy) detailed
 * breakdown consumed by `components/interview/InterviewDetail.tsx`.
 */

export interface InterviewFeedbackSummary {
  overallScore: number;
  confidence?: { score: number };
  depthReview?: { score: number };
  englishQuality?: { score: number };
}

export interface InterviewListItem {
  id: string;
  company: string;
  mode: string;
  status: string;
  difficulty: string | null;
  questionLimit: number | null;
  startedAt: string;
  completedAt: string | null;
  feedback: InterviewFeedbackSummary | null;
}

/* ---- legacy detail view ------------------------------------------------- */

export interface InterviewMetrics {
  confidence: number; // 0-100
  englishClarity: number; // 0-100
  conceptClarity: number; // 0-100
  communicationFlow: number; // 0-100
  technicalDepth: number; // 0-100
}

export interface Interview {
  id: string;
  company: string;
  type: "DSA" | "Technical" | "HR" | "Behavioral";
  score: number;
  duration: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  metrics: InterviewMetrics;
  questionCount: number;
  strongAreas: string[];
  needsWork: string[];
}

export interface TranscriptItem {
  question: string;
  answer: string;
  feedback: string;
  suggestedAnswer?: string;
}
