import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Redis connection
export const connection = new IORedis(REDIS_URL);

// Logs
connection.on("connect", () => {
  console.log("✅ Redis connected");
});
connection.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// Function to create a queue
export const createQueue = (name) => new Queue(name, { connection });

// Helper to create a worker
export const createWorker = (name, processor) => new Worker(name, processor, { connection });