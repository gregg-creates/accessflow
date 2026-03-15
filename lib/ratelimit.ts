import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const scanRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  analytics: true,
});
