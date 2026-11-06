import "dotenv/config";
import { Queue } from "bullmq";

/**
 * BullMQ connection + queue, created lazily so importing this module (which
 * `next build` does while collecting page data) never throws when the Redis
 * URL is absent — e.g. in mock mode or on a UI-only machine.
 */
export function getConnection() {
  const raw = process.env.UPSTASH_CONNECTION_BULLMQ_URL;
  if (!raw) {
    throw new Error("UPSTASH_CONNECTION_BULLMQ_URL is not set");
  }
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: parseInt(url.port),
    password: decodeURIComponent(url.password),
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

let queue: Queue | null = null;

export function getAnalysisQueue(): Queue {
  if (!queue) {
    queue = new Queue("interview-analysis", { connection: getConnection() });
  }
  return queue;
}
