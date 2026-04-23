import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TTL_MENTOR = 60 * 60;

export async function getHistory(userId: string, problemId: string) {
  const key = `session:${userId}:${problemId}`;
  const history = await redis.get<Array<{ role: string; text: string }>>(key);
  return history || [];
}

export async function saveHistory(
  userId: string,
  problemId: string,
  history: Array<{ role: string; text: string }>,
) {
  const key = `session:${userId}:${problemId}`;
  await redis.set(key, history, { ex: TTL_MENTOR });
}

// this is for interview related data and session management , we can use it
const keyGenerator = (interviewId: string, userId: string) => {
  return `interview:${interviewId}:${userId}`;
};

// lib/types/interview.ts
export interface InterviewSession {
  interviewId: string;
  userId: string;
  repoLink: string;
  repoId: string;
  questions: QuestionItem[]; // the questions array from RAG pipeline (excludes icebreaker)
  currentQuestionIndex: number; // which main question we're on (0-based), -1 = ice-breaker phase
  followupCountForCurrent: number; // followups asked for current question (max 3)
  transcript: Turn[]; // last N turns (rolling window)
  rollingTranscript: Turn[]; // last 5 turns raw
  previousSummary: string; // compressed summary of earlier turns
  totalTurns: number; // total turns across whole session
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface Turn {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
  questionIndex: number; // which question this turn belongs to
  isFollowup: boolean;
}
/**
 * Sets the interview questions for a given interview session.
 * @param {any} interviewStarting The interview starting data.
 * @returns {Promise<void>} A promise that resolves when the questions have been set.
 */
export interface QuestionItem {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  intent: string;
  howmuchDepthRequired: number;
}
/**
 * Sets the interview questions for a given interview session.
 * @param {any} interviewStarting The interview starting data.
 * @param {string} interviewId The ID of the interview.
 * @param {string} userId The ID of the user.
 * @param {string} repoLink The link to the user's repository.
 * @param {string} repoId The ID of the repository.
 * @returns {Promise<void>} A promise that resolves when the questions have been set.
 */
const setInterviewQuestions = async (
  interviewStarting: any,
  interviewId: string,
  userId: string,
  repoLink: string,
  repoId: string,
) => {
  const key = keyGenerator(interviewId, userId);

  await redis.set<InterviewSession>(
    key,
    {
      interviewId: interviewId,
      userId: userId,
      repoLink: repoLink,
      repoId: repoId,
      questions: interviewStarting.questions, // store only the questions array, not the full object
      currentQuestionIndex: -1, // -1 = ice-breaker phase; advances to 0 on first PATCH
      followupCountForCurrent: 0,
      transcript: [],
      rollingTranscript: [],
      previousSummary: "",
      totalTurns: 0,
      status: "IN_PROGRESS",
    },
    { ex: TTL_MENTOR },
  );
};

const getInterviewDetails = async (
  interviewId: string,
  userId: string,
): Promise<InterviewSession | null> => {
  const key = keyGenerator(interviewId, userId);
  const data = await redis.get<InterviewSession>(key);
  return data ?? null;
};

const saveInterviewSession = async (
  interviewDetails: InterviewSession,
  interviewId: string,
  userId: string,
) => {
  const key = keyGenerator(interviewId, userId);
  await redis.set<InterviewSession>(key, interviewDetails, { ex: TTL_MENTOR });
};

export { setInterviewQuestions, getInterviewDetails, saveInterviewSession };
