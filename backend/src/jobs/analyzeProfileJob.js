import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis();

export const analyzeProfileQueue = new Queue("analyzeProfile", { connection });
