import "dotenv/config";
import { Queue, Worker } from "bullmq";

console.log(process.env.UPSTASH_CONNECTION_BULLMQ_URL);

const url = new URL(process.env.UPSTASH_CONNECTION_BULLMQ_URL!);

export const connection = {
  host: url.hostname,
  port: parseInt(url.port),
  password: decodeURIComponent(url.password),
  tls: {},
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const analysisQueue = new Queue("interview-analysis", { connection });
