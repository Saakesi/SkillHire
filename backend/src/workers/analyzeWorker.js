import { Worker } from "bullmq";
import IORedis from "ioredis";
import axios from "axios";
import Analysis from "../models/Analysis.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fetchUserRepos } from "../services/github/repoService.js";
import { computeLanguageMetrics } from "../services/metrics/languageService.js";
import { getStack } from "../services/metrics/stackService.js";
import { detectFrameworks } from "../services/metrics/frameworkService.js";
import { getActivityMetrics } from "../services/metrics/activityService.js";
import { getCollaborationMetrics } from "../services/metrics/collaborationService.js";
import { getProjectQualityMetrics } from "../services/metrics/projectQualityService.js";

dotenv.config();
console.log("ENV MONGO_URI =", process.env.MONGO_URI);
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
      const repos = await fetchUserRepos(githubToken);

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

      const {
        languagePercentages,
        primaryLanguage,
        languageEntropy
      } = await computeLanguageMetrics(repos, githubToken);

      //Stack classification
      const { developerType, techStack } = getStack(languagePercentages);

      //get frameworks
      const frameworks = await detectFrameworks(repos, githubToken);

      // activity
      console.log("🚀 Running activity metrics...");
      const activityMetrics = await getActivityMetrics(
        repos,
        githubToken
      );

      // collaboration
      console.log("🚀 Running collaboration metrics...");
      const collaborationMetrics = await getCollaborationMetrics(
        githubUsername,
        githubToken
      );

      // project quality
      console.log("🚀 Running project quality metrics...");
      const qualityMetrics = await getProjectQualityMetrics(
        repos,
        githubToken
      );

      const rawMetrics = {
        repoCount,
        totalStars,
        totalForks,
        languagePercentages,
        primaryLanguage,
        languageEntropy,
        developerType,
        techStack,
        frameworks,
        ...activityMetrics,
        ...collaborationMetrics,
        qualityIndicators: qualityMetrics
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
