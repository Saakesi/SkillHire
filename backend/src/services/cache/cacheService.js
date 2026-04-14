import dotenv from "dotenv";
dotenv.config();

import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ REDIS_URL missing in cache service");
}

const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  db: 0, // IMPORTANT for Upstash
});

redis.on("connect", () => console.log("🟢 Cache Redis connected"));
redis.on("error", (err) =>
  console.error("❌ Cache Redis error:", err.message)
);

const DEFAULT_TTL = 600; // 10 minutes

export const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {}
};

export const cacheDel = async (...keys) => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
};

export const cacheDelPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Cache invalidated: ${keys.join(", ")}`);
    }
  } catch {}
};

export default redis;