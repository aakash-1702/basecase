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

const TTL_INTERVIEW = 60 * 60 * 24; // 2hours , so that background jobs can be completed



// ─── INTERVIEW SESSION ─────────────────────────────────────────

type InterviewSession = {
  plan: any;
  transcript: string[]; // alternating: even = AI, odd = User
  isGreetingDone: boolean;
  turnCount: number; // number of user responses so far
  mode: string;
  company: string;
  difficulty: string | null;
  questionLimit: number | null;
};

const interviewKey = (interviewId: string) => `interviewSession:${interviewId}`;

// called ONCE at join room — creates the session
export async function saveInterviewSession(
  interviewId: string,
  sessionData: InterviewSession,
) {
  await redis.set(interviewKey(interviewId), sessionData, {
    ex: TTL_INTERVIEW,
  });
}

// called to read current state
export async function getInterviewSession(
  interviewId: string,
): Promise<InterviewSession | null> {
  return await redis.get<InterviewSession>(interviewKey(interviewId));
}

// called on every turn — appends without overwriting
export async function appendToTranscript(interviewId: string, message: string) {
  const session = await getInterviewSession(interviewId);
  if (!session) throw new Error(`Interview session not found: ${interviewId}`);

  session.transcript.push(message);

  // if message is from user (odd index after push) increment turnCount
  if (session.transcript.length % 2 === 0) {
    session.turnCount += 1;
  }

  // if this was user's first real answer, mark greeting as done
  if (!session.isGreetingDone && session.turnCount === 1) {
    session.isGreetingDone = true;
  }

  await redis.set(interviewKey(interviewId), session, { ex: TTL_INTERVIEW });

  return session;
}

// called when interview completes — clean up Redis
export async function deleteInterviewSession(interviewId: string) {
  return await redis.del(interviewKey(interviewId));
}
