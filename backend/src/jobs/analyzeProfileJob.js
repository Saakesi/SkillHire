import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
	throw new Error("❌ REDIS_URL missing in analyzeProfileJob");
}

const connection = new IORedis(REDIS_URL, {
	maxRetriesPerRequest: null,
	db: 0,
});

export const analyzeProfileQueue = new Queue("analyzeProfile", {
	connection,
	defaultJobOptions: {
		removeOnComplete: 50,
		removeOnFail: 20,
	},
});
