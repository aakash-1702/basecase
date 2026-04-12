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
const keyGenerator = (interviewId : string , userId : string) => {
  return `interview:${interviewId}:${userId}`;
}

// lib/types/interview.ts
export interface InterviewSession {
  interviewId: string;
  userId: string;
  questions: GeneratedQuestion[];     // all questions from RAG pipeline
  currentQuestionIndex: number;       // which main question we're on (0-based)
  followupCountForCurrent: number;    // followups asked for current question (max 3)
  transcript: Turn[];                 // last N turns (rolling window)
  rollingTranscript: Turn[];          // last 5 turns raw
  previousSummary: string;            // compressed summary of earlier turns
  totalTurns: number;                 // total turns across whole session
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface Turn {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
  questionIndex: number;              // which question this turn belongs to
  isFollowup: boolean;
}
/**
 * Sets the interview questions for a given interview session.
 * @param {any} interviewStarting The interview starting data.
 * @returns {Promise<void>} A promise that resolves when the questions have been set.
 */
interface GeneratedQuestion{
  

}
const setInterviewQuestions = async (interviewStarting : any  , interviewId : string , userId : string) => {
  
    const key = keyGenerator(interviewId ,userId);
  
  await redis.set(key , JSON.stringify(interviewStarting) , {
    ex : 12 * 60 * 60  // 12 hours of expiry time 
  });
}

const getInterviewDetails  = async(interviewId : string , userId : string) =>{
  const key = keyGenerator(interviewId , userId);

  const data = await redis.get(key);
  return data ? data : null; // no requirement for parsing as the upstash arleady return parsed data

}


export { setInterviewQuestions , getInterviewDetails };






