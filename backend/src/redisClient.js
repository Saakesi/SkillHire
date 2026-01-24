import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

// Redis connection
export const connection = new IORedis("redis://127.0.0.1:6379");

// Function to create a queue
export const createQueue = (name) => new Queue(name, { connection });

// Helper to create a worker
export const createWorker = (name, processor) => new Worker(name, processor, { connection });
