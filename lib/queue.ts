import { Queue } from "bullmq";

const connection = {
  host: process.env.UPSTASH_REDIS_REST_URL,
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
};

export const scanQueue = new Queue("scan", { connection });
