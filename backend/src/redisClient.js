import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ REDIS_URL missing");
}

console.log("redis url: ", REDIS_URL);
// Redis connection
export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

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