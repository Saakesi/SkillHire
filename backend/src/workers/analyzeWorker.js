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

    try {
      // mark as processing
      await Analysis.findOneAndUpdate(
        { githubId },
        { status: "processing" }
      );

      // Fetch repos
      const repoRes = await axios.get(
        `https://api.github.com/user/repos`,
        {
          headers: { Authorization: `Bearer ${githubToken}` },
          params: {
            per_page: 100,
            visibility: "all"
          }
        }
      );

      //first we will ignore forked repos
      const repos = repoRes.data.filter(repo => !repo.fork);

      //popularity metrics
      const repoCount = repos.length;

      const totalStars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      );

      const totalForks = repos.reduce(
        (sum, repo) => sum + repo.forks_count,
        0
      )

      //language metrics
      const languageBytes = {};

      for (const repo of repos) {
        try {
          console.log(`📦 Repo: ${repo.name}`);
          const response = await axios.get(repo.languages_url, {
            headers: { Authorization: `Bearer ${githubToken}` }
          });

          console.log("response: ", response.data);

          const languages = response.data;

          for (const [lang, bytes] of Object.entries(languages)) {
            languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
          }
        } catch (error) {
          console.log(`Skipping language fetch for ${repo.name}`);
        }
      }

      // If user has no languages
      if (Object.keys(languageBytes).length === 0) {
        console.log("No language data found.");
      }

      const totalBytes = Object.values(languageBytes)
        .reduce((sum, val) => sum + val, 0);


      const languagePercentages = {};
      let primaryLanguage = null;
      let maxBytes = 0;

      if (totalBytes > 0) {
        for (const [lang, bytes] of Object.entries(languageBytes)) {
          const percentage = bytes / totalBytes;
          languagePercentages[lang] = percentage;

          if (bytes > maxBytes) {
            maxBytes = bytes;
            primaryLanguage = lang;
          }
        }
      }

      let languageEntropy = 0;
      for (const p of Object.values(languagePercentages)) {
        if (p > 0) {
          languageEntropy -= p * Math.log2(p);
        }
      }


      const rawMetrics = {
        repoCount,
        totalStars,
        totalForks,
        languagePercentages,
        primaryLanguage,
        languageEntropy
      };

      // save final result
      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "completed",
          rawMetrics,
          updatedAt: new Date()
        }
      );

      return rawMetrics;
    } catch (error) {
      console.error("Analysis failed:", error.message);

      await Analysis.findOneAndUpdate(
        { githubId },
        {
          status: "failed",
          error: error.message
        }
      );

      throw error;
    }
  },
  { connection }
);

worker.on("completed", job => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", job => {
  console.error(`❌ Job ${job.id} failed`);
});
