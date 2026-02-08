import { Worker } from "bullmq";
import Profile from "../models/Profile.js";
import Analysis from "../models/Analysis.js";
import { extractSkills } from "../services/scoring/skillExtractor.js";
import { connection } from "../redisClient.js";
import { analyzeRepos } from "../services/scoring/analyzeRepos.js";

console.log("🟢 analyzeProfileWorker file loaded");
export const analyzeProfileWorker = new Worker(
  "analyze-profile",
  async (job) => {
    console.log("🟡 analyze-profile job received:", job.data);
    const { githubId } = job.data;

    const profile = await Profile.findOne({ githubId }).lean();

    console.log("🟠 profile found:", !!profile);
console.log("🟠 repos field:", profile?.repos);
console.log("🟠 repos type:", typeof profile?.repos);
console.log("🟠 isArray:", Array.isArray(profile?.repos));

if (profile?.repos?.length > 0) {
  console.log("🟢 first repo:");
  console.log(JSON.stringify(profile.repos[0], null, 2));
}

    // ✅ HARD GUARDS
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!Array.isArray(profile.repos) || profile.repos.length === 0) {
      throw new Error("Repos not ready for analysis");
    }
    console.log(JSON.stringify(profile.repos[0], null, 2));

    //const skills = extractSkills(profile.repos);
    const skills = analyzeRepos(profile.repos);
    await Analysis.findOneAndUpdate(
      { githubId },
      {
        status: "completed",
        result: {
          skills,
          repoCount: profile.repos.length,
          analyzedAt: new Date()
        },
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log(`✅ Analysis completed for ${githubId}`);
  },
  { connection }
);



/*
import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Analysis from "../models/Analysis.js";
import { fetchRepos } from "../services/github/githubFetcher.js";
import { extractSkills } from "../services/scoring/skillExtractor.js";

dotenv.config();

// Mongo
await mongoose.connect(process.env.MONGO_URI);
console.log("🟢 Worker MongoDB connected");

// Redis
const connection = new IORedis({
  maxRetriesPerRequest: null
});

// Worker
const worker = new Worker(
  "analyzeProfile",
  async (job) => {
    const { githubId, githubUsername, githubToken } = job.data;

    if (!githubToken) {
      throw new Error("Missing GitHub token");
    }
    console.log({
  hasToken: !!githubToken,
  tokenPreview: githubToken?.slice(0, 6),
  username: githubUsername
});

    try {
      // 1️⃣ Mark as processing
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" },
        { upsert: true }
      );

      // 2️⃣ Fetch repos
      const repos = await fetchRepos(githubToken, githubUsername);

      // 3️⃣ Extract skills + scoring
      const skills = extractSkills(repos);

      const result = {
        skills,
        repoCount: repos.length,
        analyzedAt: new Date()
      };

      // 4️⃣ Save result
      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "completed",
          result,
          updatedAt: new Date()
        }
      );

      return result;
    } catch (err) {
      // Mark failed
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "failed" }
      );
      throw err;
    }
  },
  { connection }
);

// Logs
worker.on("completed", (job) => {
  console.log(`✅ Analysis job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

*/

/*
import { Worker } from "bullmq";
import IORedis from "ioredis";
import axios from "axios";
import Analysis from "../models/Analysis.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("🟢 Worker MongoDB connected");

const connection = new IORedis({
  maxRetriesPerRequest: null
});


const worker = new Worker(
  "analyzeProfile",
  async job => {
    const { githubId, githubUsername, githubToken } = job.data;

    // 🔄 mark as processing
    await Analysis.findOneAndUpdate(
      { githubId },
      { status: "processing" }
    );

    // Fetch repos
    const repoRes = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos`,
      {
        headers: { Authorization: `Bearer ${githubToken}` }
      }
    );

    const repos = repoRes.data;

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );

    const result = {
      totalStars,
      repoCount: repos.length
    };

    // ✅ save final result
    await Analysis.findOneAndUpdate(
      { githubId },
      {
        status: "completed",
        result,
        updatedAt: new Date()
      }
    );

    return result;
  },
  { connection }
);

worker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  console.error(`❌ Job ${job.id} failed`, err);

  if (job?.data?.githubId) {
    await Analysis.findOneAndUpdate(
      { githubId: job.data.githubId },
      { status: "failed" }
    );
  }
});
*/