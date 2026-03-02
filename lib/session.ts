    import {Redis} from "@upstash/redis";

    const redis  = new Redis({
        url : process.env.UPSTASH_REDIS_REST_URL,
        token : process.env.UPSTASH_REDIS_REST_TOKEN
    });

    const TTL = 60 * 60;

    export async function getHistory(userId: string, problemId: string) {
  const key = `session:${userId}:${problemId}`;
  const history = await redis.get<Array<{ role: string; text: string }>>(key);
  return history || [];
}

export async function saveHistory(userId: string, problemId: string, history: Array<{ role: string; text: string }>) {
  const key = `session:${userId}:${problemId}`;
  await redis.set(key, history, { ex: TTL });
}