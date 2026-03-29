import IORedis from "ioredis";

const redis = new IORedis({ maxRetriesPerRequest: null });

redis.on("connect", () => console.log("🟢 Cache Redis connected"));
redis.on("error",   (err) => console.error("❌ Cache Redis error:", err.message));

const DEFAULT_TTL = 600; // 10 minutes

export const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // cache miss on error, never block the request
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // non-fatal — serve uncached data silently
  }
};

// Delete specific keys
export const cacheDel = async (...keys) => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch { /* ignore */ }
};

// Invalidate all keys matching a pattern (e.g. "leaderboard:*")
export const cacheDelPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️  Cache invalidated: ${keys.join(", ")}`);
    }
  } catch { /* ignore */ }
};

export default redis;
