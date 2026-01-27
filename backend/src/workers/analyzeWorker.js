import { Worker } from "bullmq";
import IORedis from "ioredis";
import axios from "axios";
import Analysis from "../models/Analysis.js";

const connection = new IORedis();

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
