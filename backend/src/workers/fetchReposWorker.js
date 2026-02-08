import { Worker } from "bullmq";
import axios from "axios";
import Profile from "../models/Profile.js";
import { connection } from "../redisClient.js";
import { analyzeProfileQueue } from "../jobs/analyzeProfileJob.js";

export const fetchReposWorker = new Worker(
  "fetch-repos",
  async (job) => {
    const { githubId, accessToken } = job.data;
    if (!accessToken) throw new Error("Missing GitHub token");

    let page = 1;
    let allRepos = [];

    while (true) {
      const res = await axios.get("https://api.github.com/user/repos", {
        params: { per_page: 100, page },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "SkillHire-Backend"
        }
      });

      if (res.data.length === 0) break;

      allRepos.push(...res.data);
      page++;
      await new Promise(r => setTimeout(r, 300)); // rate-limit safety
    }

    const repos = allRepos.map(r => ({
      name: r.name,
      private: r.private,
      language: r.language,
      stars: r.stargazers_count,
      fork: r.fork,
      updatedAt: r.updated_at
    }));

    await Profile.findOneAndUpdate(
      { githubId },
      { $set: { repos } },
      { upsert: true }
    );

    // 🔥 Chain next step
    await analyzeProfileQueue.add("analyze", { githubId });

    console.log(`✅ Repos fetched for ${githubId}`);
  },
  { connection }
);
