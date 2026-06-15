import "dotenv/config";
import { Redis } from "ioredis";

// Ensure this only connects once in dev to avoid hitting connection limits
const globalForRedis = global as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("Missing REDIS_URL environment variable. Falling back to localhost.");
}

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
